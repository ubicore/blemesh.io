
LowerTransport_LOG = console.log;
//LowerTransport_LOG =  function() {}

var LowerTransport = {};
LowerTransport.OUT = {};



LowerTransport.Send_Unsegmented = function (upper_transport_pdu_obj, parameters) {
  return new Promise((resolve, reject) => {
    if((upper_transport_pdu_obj.EncAccessPayload.length + upper_transport_pdu_obj.TransMIC.length) > 15*2){
      reject('Payload exced max size');
      return;
    }

    lower_transport_pdu = "";
    // seg (1 bit), akf (1 bit), aid (6 bits) already derived from k4
    ltpdu0 = (parameters.SEG << 7) | (parameters.AKF << 6) | parameters.AID;
    lower_transport_pdu = utils.intToHex(ltpdu0) + upper_transport_pdu_obj.EncAccessPayload + upper_transport_pdu_obj.TransMIC;

    Network.Send(lower_transport_pdu, parameters)
    .then(() => {
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
};


LowerTransport.SegParam = {};

LowerTransport.Send_Segmented = function (upper_transport_pdu_obj, parameters) {
  return new Promise((resolve, reject) => {
    //reject('LowerTransport.Send_Segmented Not implemented');

    LowerTransport.SegParam.CbOnSuccess = resolve;
    LowerTransport.SegParam.CbOnFail = reject;

    LowerTransport.SegParam.RemainingDATA = upper_transport_pdu_obj.EncAccessPayload + upper_transport_pdu_obj.TransMIC;
    var Remaining = LowerTransport.SegParam.RemainingDATA.length;
    LowerTransport.SegParam.SegO = 0;
    LowerTransport.SegParam.SegN = Math.ceil(Remaining/(12*2)) - 1;

    LowerTransport.SegParam.ToSend = (Remaining > (12*2))? (12*2) : Remaining;

    lower_transport_pdu = "";
    // seg (1 bit), akf (1 bit), aid (6 bits) already derived from k4
    ltpdu0 = ((parameters.SEG & 0x1) << 7) | ((parameters.AKF & 0x1) << 6) | (parameters.AID & 0x3F);
    ltpdu1 = (parameters.SZMIC << 7) | (parameters.SeqZero >> 6);
    ltpdu2 = ((parameters.SeqZero & 0x3F) << 2) | ((LowerTransport.SegParam.SegO >> 3) & 0x03) ;
    ltpdu3 = ((LowerTransport.SegParam.SegO & 0x07) << 5) | (LowerTransport.SegParam.SegN & 0x1F) ;

    LowerTransport_LOG('LowerTransport.SegParam : ' + JSON.stringify(LowerTransport.SegParam));

    lower_transport_pdu =
    utils.intToHex(ltpdu0)
    + utils.intToHex(ltpdu1)
    + utils.intToHex(ltpdu2)
    + utils.intToHex(ltpdu3)
    + LowerTransport.SegParam.RemainingDATA.substring(0, LowerTransport.SegParam.ToSend);

    //
    LowerTransport_LOG('LowerTransport.Send Fisrt segment:' + lower_transport_pdu);
    LowerTransport.SendPDU(lower_transport_pdu, parameters);
  });
};

LowerTransport.SendPDU = function (lower_transport_pdu, parameters) {
  Network.Send(lower_transport_pdu, parameters)
  .then(() => {
    LowerTransport_LOG('LowerTransport.Send OK');

    LowerTransport.SegParam.RemainingDATA =
    LowerTransport.SegParam.RemainingDATA.substring(LowerTransport.SegParam.ToSend)

    var Remaining = LowerTransport.SegParam.RemainingDATA.length;

    if(Remaining > 0){
      LowerTransport.SegParam.SegO++;
      LowerTransport.SegParam.ToSend = (Remaining > (12*2))? (12*2) : Remaining;

      lower_transport_pdu = "";
      // seg (1 bit), akf (1 bit), aid (6 bits) already derived from k4
      ltpdu0 = ((parameters.SEG & 0x1) << 7) | ((parameters.AKF & 0x1) << 6) | (parameters.AID & 0x3F);
      ltpdu1 = (parameters.SZMIC << 7) | (parameters.SeqZero >> 6);
      ltpdu2 = ((parameters.SeqZero & 0x3F) << 2) | ((LowerTransport.SegParam.SegO >> 3) & 0x03) ;
      ltpdu3 = ((LowerTransport.SegParam.SegO & 0x07) << 5) | (LowerTransport.SegParam.SegN & 0x1F) ;

      LowerTransport_LOG('LowerTransport.SegParam : ' + JSON.stringify(LowerTransport.SegParam));

      lower_transport_pdu =
      utils.intToHex(ltpdu0)
      + utils.intToHex(ltpdu1)
      + utils.intToHex(ltpdu2)
      + utils.intToHex(ltpdu3)
      + LowerTransport.SegParam.RemainingDATA.substring(0, LowerTransport.SegParam.ToSend);
      LowerTransport_LOG('LowerTransport.Send N segment:' + lower_transport_pdu);
      LowerTransport.SendPDU(lower_transport_pdu, parameters);
    }else {
      LowerTransport_LOG('LowerTransport.Send finish -> Wait Ack');
      return;
      // if(LowerTransport.SegParam.CbOnSuccess  && typeof(LowerTransport.SegParam.CbOnSuccess) === "function"){
      //   LowerTransport_LOG('typeof is function ');
      //   LowerTransport.SegParam.CbOnSuccess();
      // }
    }
  })
  .catch(error => {
    LowerTransport_LOG('LowerTransport.Send Fail');

    if(LowerTransport.SegParam.CbOnFail  && typeof(LowerTransport.SegParam.CbOnFail) === "function"){
      LowerTransport.SegParam.CbOnFail(`writeValue error: ${error}`);
    }
  });

};




LowerTransport.Send = function (upper_transport_pdu_obj, parameters) {
  parameters.CTL = 0;

  LowerTransport_LOG('LowerTransport.Send len : ' +  (upper_transport_pdu_obj.EncAccessPayload.length + upper_transport_pdu_obj.TransMIC.length));


  if(parameters.SEG == 0){
    return LowerTransport.Send_Unsegmented(upper_transport_pdu_obj, parameters);
  }else{
    return LowerTransport.Send_Segmented(upper_transport_pdu_obj, parameters);
  }
};



LowerTransport.Segment_Acknowledgment_message = function(Access_message, BlockAck){
  return new Promise((resolve, reject) => {

    //3.5.3.3 Segmentation behavior
    //3.5.2.3.1 Segment Acknowledgment message

    var OBO = 0;
    // var BlockAck = 0;
    // //Format BlockAck
    // for (var i = 0; i <= Access_message.SegN; i++) {
    //   BlockAck |= (1 << i);
    // }
    var Segment_Acknowledgment_message = '';
    Segment_Acknowledgment_message += '00'; //SEG = 0, OP = 0
    Segment_Acknowledgment_message += utils.toHex((OBO << 15) + ((Access_message.SeqZero & 0x1FFF) << 2), 2); //OBO, SeqZero
    Segment_Acknowledgment_message += utils.toHex(BlockAck, 4);

    LowerTransport_LOG('Segment_Acknowledgment_message : ' + Segment_Acknowledgment_message);
    var lower_transport_pdu = Segment_Acknowledgment_message;

    var parameters = {
      CTL: 1,
      SEQ: utils.toHex(seq, 3),
      SRC: Own_SRC,
      DST: Node.dst,
      iv_index: utils.toHex(db.data.IVindex, 4),
    }

    Network.Send(lower_transport_pdu, parameters)
    .then(() => {
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
}

LowerTransport.receive_AccessMessage = function (NetworkPDU) {

  var TransportPDU = NetworkPDU.TransportPDU;
  //3.5.2 Lower Transport PDU
  //3.5.2.2 Segmented Access message
  var octet0 = utils.hexToU8A(TransportPDU.substring(0, 1*2))[0];

  var Access_message = {};
  Access_message.NetworkPDU = NetworkPDU;
  Access_message.SEG = (octet0 & (1<<7))?1:0;
  Access_message.AKF = (octet0 & (1<<6))?1:0;
  Access_message.AID = octet0 & 0x3F;

  //Unsegmented Access Message
  if(Access_message.SEG == 0) {
    Access_message.SZMIC = 0;
    // /
    Access_message.SeqZero = Access_message.NetworkPDU.SEQ;
    //
    Access_message.UpperTransportAccessPDU = TransportPDU.substring(1*2);
    LowerTransport_LOG('Unsegmented Access Message : ' + JSON.stringify(Access_message));
    //TODO
    //        alert('TODO: Unsegmented Access Message');

    UpperTransport.OUT_ProcessAccessPDU(Access_message);
    return;
  }

  //Segmented Access Message
  if(Access_message.SEG == 1){
    var octet1 = utils.hexToU8A(TransportPDU.substring(1*2, 2*2))[0];
    var octet2 = utils.hexToU8A(TransportPDU.substring(2*2, 3*2))[0];
    var octet3 = utils.hexToU8A(TransportPDU.substring(3*2, 4*2))[0];

    //Add : SZMIC, SeqZero, SegO, SegN,
    Access_message.SZMIC = (octet1 & (1<<7))?1:0;
    Access_message.SeqZero = (((octet1 & 0x7F) << 8) + octet2) >> 2;
    Access_message.SegO = (((octet2 & 0x03) << 8) + octet3) >> 5;
    Access_message.SegN = octet3 & 0x1F;
    LowerTransport_LOG('Access_message : ' + JSON.stringify(Access_message));

    //Init Output on the first Segment
    if(Access_message.SegO == 0){
      LowerTransport.OUT.First_Access_Message = Access_message;
      LowerTransport.OUT.PayloadFromSegments = '';
      LowerTransport.OUT.BlockAck = 0;
    } else {
      //Check every segment
      if((LowerTransport.OUT.First_Access_Message.AKF != Access_message.AKF) ||
      (LowerTransport.OUT.First_Access_Message.AID != Access_message.AID) ||
      (LowerTransport.OUT.First_Access_Message.SZMIC != Access_message.SZMIC) ||
      (LowerTransport.OUT.First_Access_Message.SeqZero != Access_message.SeqZero) ||
      (LowerTransport.OUT.First_Access_Message.SegN != Access_message.SegN)){
        alert('Error: Segmented Access Message Invalid segment');
        return;
      }
    }

    var Segment_m = TransportPDU.substring(4*2);
    LowerTransport_LOG('Segment_m : ' + Segment_m + ' len : ' + Segment_m.length);
    LowerTransport.OUT.PayloadFromSegments += Segment_m;

    //Format BlockAck
    LowerTransport.OUT.BlockAck |= (1 << Access_message.SegO);

    //Last segment
    if(Access_message.SegO == Access_message.SegN ){
      var Reassembled_Access_message = Object.assign(LowerTransport.OUT.First_Access_Message);
      Reassembled_Access_message.UpperTransportAccessPDU =  LowerTransport.OUT.PayloadFromSegments;
      LowerTransport_LOG('Get a complete Reassembled_Access_message : ' + JSON.stringify(Reassembled_Access_message));

      //Send Acknowledgment Segmented Acces message
      LowerTransport.Segment_Acknowledgment_message(Access_message, LowerTransport.OUT.BlockAck )
      .then(() => {
        UpperTransport.OUT_ProcessAccessPDU(Reassembled_Access_message);
        return;
      })
      .catch(error => {
        reject(error);
      });
      //
      return;
    }
  }
}


LowerTransport.receive_ControlMessage = function (NetworkPDU) {

  //     //Control message
  //     var Control_message = {};
  //     Control_message.SEG = (octet0 & (1<<7))?1:0;
  //     Control_message.OP = octet0 & 0x7F;
  //




  var TransportPDU = NetworkPDU.TransportPDU;
  //3.5.2 Lower Transport PDU
  //3.5.2.2 Segmented Access message
  var octet0 = utils.hexToU8A(TransportPDU.substring(0, 1*2))[0];

  var Control_message = {};
  Control_message.NetworkPDU = NetworkPDU;
  Control_message.SEG = (octet0 & (1<<7))?1:0;
  Control_message.OP = octet0 & 0x7F;

  //Unsegmented Control Message
  if(Control_message.SEG == 0) {
    //3.5.2.3.1 Segment Acknowledgment message
    if( Control_message.OP == 0){
      var octet1 = utils.hexToU8A(TransportPDU.substring(1*2, 2*2))[0];
      var octet2 = utils.hexToU8A(TransportPDU.substring(2*2, 3*2))[0];
      Control_message.OBO = (octet1 & (1<<7))?1:0;
      Control_message.SeqZero = (((octet1 & 0x7F) << 8) + octet2) >> 2;
      Control_message.BlockAck = TransportPDU.substring(3*2, 7*2);
      LowerTransport_LOG('Segment Acknowledgment message : ' + JSON.stringify(Control_message));
    }
    return;
  }

  //Segmented Control Message
  if(Control_message.SEG == 1) {
    LowerTransport_LOG('Segmented Control message : ' + JSON.stringify(Control_message));
  }


};

LowerTransport.receive = function (NetworkPDU) {
  // var NetworkPDU = {
  //   ivi: 0,
  //   nid: 0,
  //   CTL: 0,
  //   TTL: 0,
  //   SEQ: '',
  //   SRC: '',
  //   DST: '',
  //   TransportPDU: 0,
  // };


  //Access message
  if(NetworkPDU.CTL == 0){
    LowerTransport.receive_AccessMessage(NetworkPDU);
  }

  //Control message
  if(NetworkPDU.CTL == 1){
    LowerTransport.receive_ControlMessage(NetworkPDU);
  }
};
