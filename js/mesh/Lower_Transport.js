
var LowerTransport = {};
LowerTransport.OUT = {};

var seg = 0;
var akf = 0;
var aid = 0;

LowerTransport.derive = function (upper_transport_pdu) {
    lower_transport_pdu = "";
    // seg (1 bit), akf (1 bit), aid (6 bits) already derived from k4
    seg_int = parseInt(seg, 16);
    akf_int = parseInt(akf, 16);
    aid_int = parseInt(aid, 16);
    ltpdu1 = (seg_int << 7) | (akf_int << 6) | aid_int;
    lower_transport_pdu = utils.intToHex(ltpdu1) + upper_transport_pdu.EncAccessPayload + upper_transport_pdu.TransMIC;
    return lower_transport_pdu;
};

LowerTransport.Segment_Acknowledgment_message = function(Access_message, BlockAck){
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

  console.log('Segment_Acknowledgment_message : ' + Segment_Acknowledgment_message);
  var lower_transport_pdu = Segment_Acknowledgment_message;
  ctl = 1;
  Network.Send(lower_transport_pdu);
}


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

  var TransportPDU = NetworkPDU.TransportPDU;
  //3.5.2 Lower Transport PDU
  //3.5.2.2 Segmented Access message
  var octet0 = utils.hexToU8A(TransportPDU.substring(0, 1*2))[0];

  //Access message
  if(NetworkPDU.CTL == 0){
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
        console.log('Unsegmented Access Message : ' + JSON.stringify(Access_message));
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
        console.log('Access_message : ' + JSON.stringify(Access_message));

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
        console.log('Segment_m : ' + Segment_m + ' len : ' + Segment_m.length);
        LowerTransport.OUT.PayloadFromSegments += Segment_m;

        //Format BlockAck
        LowerTransport.OUT.BlockAck |= (1 << Access_message.SegO);

        //Last segment
        if(Access_message.SegO == Access_message.SegN ){
          var Reassembled_Access_message = Object.assign(LowerTransport.OUT.First_Access_Message);
          Reassembled_Access_message.UpperTransportAccessPDU =  LowerTransport.OUT.PayloadFromSegments;
          console.log('Get a complete Reassembled_Access_message : ' + JSON.stringify(Reassembled_Access_message));

          //Send Acknowledgment Segmented Acces message
          LowerTransport.Segment_Acknowledgment_message(Access_message, LowerTransport.OUT.BlockAck );
          //
          UpperTransport.OUT_ProcessAccessPDU(Reassembled_Access_message);
          return;
        }
      }

  }

  //Control message
  if(NetworkPDU.CTL == 1){
      //Control message
      var Control_message = {};
      Control_message.SEG = (octet0 & (1<<7))?1:0;
      Control_message.OP = octet0 & 0x7F;


      //Unsegmented Control Message
      if(Control_message.SEG == 0) {
        //3.5.2.3.1 Segment Acknowledgment message
        if( Control_message.OP == 0){
          Control_message.OBO = (octet1 & (1<<7))?1:0;
          Control_message.SeqZero = (((octet1 & 0x7F) << 8) + octet2) >> 2;
          Control_message.BlockAck = dec_network_pdu.TransportPDU.substring(3*2, 7*2);
          console.log('Segment Acknowledgment message : ' + JSON.stringify(Control_message));
        }
      }

      //Segmented Control Message
      if(Control_message.SEG == 1) {
        console.log('Segmented Control message : ' + JSON.stringify(Control_message));
      }
  }
  return ;
};