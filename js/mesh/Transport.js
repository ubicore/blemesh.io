

//src
//dst
//iv_index

//Keys
//var netkey;
//var appkey;
//var devkey;

var seq = 0x07080b; //
var MeshAll = {};

MeshAll.update = function () {

  console.log("netkey=" + netkey);
  console.log("appkey=" + appkey);
  console.log("devkey=" + devkey);


  N = utils.normaliseHex(netkey);
  A = utils.normaliseHex(appkey);
  D = utils.normaliseHex(devkey);

  //P = "00";
  k2_material = crypto.k2(netkey, "00");
  hex_encryption_key = k2_material.encryption_key;
  hex_privacy_key = k2_material.privacy_key;
  hex_nid = k2_material.NID;
  network_id = crypto.k3(netkey);
  aid_appkey = crypto.k4(appkey);

  I = utils.normaliseHex(iv_index);
  ivi = utils.leastSignificantBit(parseInt(I, 16))
}


/***************************************************************************************************/

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

LowerTransport.Segment_Acknowledgment_message = function(SeqZero){
//3.5.3.3 Segmentation behavior
//3.5.2.3.1 Segment Acknowledgment message

}



var First_Access_Message;

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
        //
        Access_message.UpperTransportAccessPDU = TransportPDU.substring(1*2);
        console.log('Unsegmented Access Message : ' + JSON.stringify(Access_message));
        //TODO
        alert('TODO: Unsegmented Access Message');
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

        if(Access_message.SegO == Access_message.SegN ){
          var Reassembled_Access_message = Object.assign(LowerTransport.OUT.First_Access_Message);
          Reassembled_Access_message.UpperTransportAccessPDU =  LowerTransport.OUT.PayloadFromSegments;
          console.log('Get a complete Reassembled_Access_message : ' + JSON.stringify(Reassembled_Access_message));
          UpperTransport.OUT_ProcessAccessPDU(Reassembled_Access_message);
        }
      }

  }

  //Control message
  if(NetworkPDU.CTL == 1){
      //Control message
      var Control_message = {};
      Control_message.SEG = (octet0 & (1<<7))?1:0;
      Control_message.OPCODE = octet0 & 0x7F;


      //Unsegmented Control Message
      if(Control_message.SEG == 0) {
        //3.5.2.3.1 Segment Acknowledgment message
        if(OPCODE == 0){
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









/***************************************************************************************************/

var Network = {};
/*********************************/
//IN
Network.deriveSecure = function (hex_dst, lower_transport_pdu) {
    network_pdu = "";
    ctl_int = parseInt(ctl, 16);
    ttl_int = parseInt(ttl, 16);
    ctl_ttl = (ctl_int | ttl_int);
    npdu2 = utils.intToHex(ctl_ttl);
    K = utils.normaliseHex(hex_encryption_key);
    net_nonce = "00" + npdu2 + utils.toHex(seq, 3) + src + "0000" + iv_index;
    network_pdu = crypto.meshAuthEncNetwork(K, net_nonce, hex_dst, lower_transport_pdu);
    return network_pdu;
};



Network.obfuscate = function (network_pdu) {
    obfuscated = "";
    obfuscated = crypto.obfuscate(network_pdu.EncDST, network_pdu.EncTransportPDU, network_pdu.NetMIC, ctl, ttl, utils.toHex(seq, 3), src, iv_index, hex_privacy_key);
    return obfuscated;
};

Network.finalise = function (ivi, nid, obfuscated_ctl_ttl_seq_src, enc_dst, enc_transport_pdu, netmic) {
    ivi_int = parseInt(ivi, 16);
    nid_int = parseInt(nid, 16);
    npdu1 = utils.intToHex((ivi_int << 7) | nid_int);
    netpdu = npdu1 + obfuscated_ctl_ttl_seq_src + enc_dst + enc_transport_pdu + netmic;
    return netpdu;
};

/*********************************/

Network.receive = function (netpduhex, privacy_key) {

  var NetworkPDU =  {};
		// ivi: 0,
		// nid: 0,
    // CTL: 0,
    // TTL: 0,
    // SEQ: '',
    // SRC: '',
    // DST: '',
    // TransportPDU: 0,

  //octet 0
  var M = netpduhex.substring(0, 1*2);
  var M_int =  (utils.hexToBytes(M))[0];
  //
  NetworkPDU.ivi = (M_int & (1 << 7));
  NetworkPDU.nid = (M_int & 0x7F);

  //Obfuscated decode
  //3.8.7.3 Network layer obfuscation
  var obfuscated_ctl_ttl_seq_src = netpduhex.substring(1*2, 7*2);
  var privacy_random_hex = netpduhex.substring(7*2, 14*2);

  var pecb_input = "0000000000" + iv_index + privacy_random_hex;
  var pecb_hex = crypto.e(pecb_input, privacy_key);
  var pecb = pecb_hex.substring(0, 6*2);

  //Reverse Obfuscate
	var ctl_ttl_seq_src = utils.xorU8Array(utils.hexToU8A(obfuscated_ctl_ttl_seq_src), utils.hexToU8A(pecb));
  var ctl_ttl_seq_src_hex = utils.u8AToHexString(ctl_ttl_seq_src);
  //
  console.log('ctl_ttl_seq_src : ' + ctl_ttl_seq_src);
  console.log('ctl_ttl_seq_src_hex : ' + ctl_ttl_seq_src_hex);

  var ctl_ttl_hex = ctl_ttl_seq_src_hex.substring(0, 1*2);
  var ctl_ttl = parseInt(ctl_ttl_hex, 16);
  NetworkPDU.CTL = (ctl_ttl & (1 << 7))?1:0;
  NetworkPDU.TTL = ctl_ttl & 0x7F;
  NetworkPDU.SEQ =  ctl_ttl_seq_src_hex.substring(1*2, 4*2);
  NetworkPDU.SRC =  ctl_ttl_seq_src_hex.substring(4*2, 6*2);

  //Decode Network
  K = utils.normaliseHex(hex_encryption_key);
  //3.8.5.1 Network nonce
  var net_nonce = "00" + ctl_ttl_hex + NetworkPDU.SEQ + NetworkPDU.SRC + "0000" + iv_index;
  var EncNetData = netpduhex.substring(7*2);
  var NetMIC_size = NetworkPDU.CTL?8:4;
  DecNetData = crypto.meshAuthEncNetwork_decode(K, net_nonce, EncNetData, NetMIC_size);

  NetworkPDU.DST = DecNetData.DST;
  NetworkPDU.TransportPDU = DecNetData.TransportPDU;

  console.log("NetworkPDU : " + JSON.stringify(NetworkPDU));
  LowerTransport.receive(NetworkPDU);
}


/***************************************************************************************************/

var ProxyPDU_IN = {};
var msg_type = 0;


ProxyPDU_IN.finalise = function (finalised_network_pdu) {
    proxy_pdu = "";
    sm = (sar << 6) | msg_type;
    i = 0;
    proxy_pdu = proxy_pdu + utils.intToHex(sm);
    proxy_pdu = proxy_pdu + finalised_network_pdu;
    return proxy_pdu;
};

var ProxyPDU_OUT = {};

ProxyPDU_OUT.ProcessPDU = function (PDU) {
    console.log("ProcessPDU");

    var proxy_pdu = new Uint8Array(PDU)

    //PDU type
    var Proxy_PDU_Type = proxy_pdu[0];
    var Net_pdu_bytes = utils.bytesToHex(proxy_pdu.slice(1));//Skip PDU Type

    //
    switch (Proxy_PDU_Type) {
      case 0x00 :
        console.log("Network PDU");
        Network.receive(Net_pdu_bytes, hex_privacy_key);
        break;
      case 0x01:
        console.log("Mesh Beacon");
        break;
      case 0x02:
        console.log("Proxy Configuration");
        break;
      case 0x03:
        console.log("Provisioning PDU");
        break;
      default:
        console.log("RFU");
    }
}


/***************************************************************************************************/
var UpperTransport = {};

UpperTransport.initialize = function () {
    this.ProxyPDU_1 = new ProxyPDU;
}

UpperTransport.deriveSecure_DeviceKey = function (access_payload) {
    upper_trans_pdu = {};

    aid = 0;
    akf = 0;

    // derive Application Nonce (ref 3.8.5.2)
    app_nonce = "0200" + utils.toHex(seq, 3) + src + dst + iv_index;
    upper_trans_pdu = crypto.meshAuthEncAccessPayload(D, app_nonce, access_payload);
    return upper_trans_pdu;
}


UpperTransport.deriveSecure_AppKey = function (access_payload) {
    upper_trans_pdu = {};

    aid = aid_appkey;
    akf = 1;

    // derive Application Nonce (ref 3.8.5.2)
    app_nonce = "0100" + utils.toHex(seq, 3) + src + dst + iv_index;
    upper_trans_pdu = crypto.meshAuthEncAccessPayload(A, app_nonce, access_payload);
    return upper_trans_pdu;
}

UpperTransport.Send_With_DeviceKey = function (mesh_proxy_data_in, access_payload) {
    console.log("UpperTransport.send");

    MeshAll.update();

    // access payload
    console.log("access_payload=" + access_payload);

    // upper transport PDU
    upper_transport_pdu_obj = UpperTransport.deriveSecure_DeviceKey(access_payload);
    upper_transport_pdu = upper_transport_pdu_obj.EncAccessPayload + upper_transport_pdu_obj.TransMIC;
    console.log("upper_transport_pdu=" + upper_transport_pdu);
    transmic = upper_transport_pdu_obj.TransMIC;

    // derive lower transport PDU
    lower_transport_pdu = LowerTransport.derive(upper_transport_pdu_obj);
    console.log("lower_transport_pdu=" + lower_transport_pdu);

    // encrypt network PDU
    secured_network_pdu = Network.deriveSecure(dst, lower_transport_pdu);
    console.log("EncDST=" + JSON.stringify(secured_network_pdu.EncDST) + " EncTransportPDU=" + JSON.stringify(secured_network_pdu.EncTransportPDU));

    // obfuscate
    obfuscated = Network.obfuscate(secured_network_pdu);
    console.log("obfuscated_ctl_ttl_seq_src=" + JSON.stringify(obfuscated.obfuscated_ctl_ttl_seq_src));

    // finalise network PDU
    finalised_network_pdu = Network.finalise(ivi, hex_nid, obfuscated.obfuscated_ctl_ttl_seq_src, secured_network_pdu.EncDST, secured_network_pdu.EncTransportPDU, network_pdu.NetMIC);
    console.log("finalised_network_pdu=" + finalised_network_pdu);

    // finalise proxy PDU
    proxy_pdu = ProxyPDU_IN.finalise(finalised_network_pdu);
    console.log("proxy_pdu=" + proxy_pdu);

    if (proxy_pdu.length > (mtu * 2)) { // hex chars
        console.log("Segmentation required ( PDU length > MTU)");
        alert("Segmentation required ( PDU length > MTU : NOT IMPLEMENTED YET !");
        return;
    }

    proxy_pdu_bytes = utils.hexToBytes(proxy_pdu);
    proxy_pdu_data = new Uint8Array(proxy_pdu_bytes)
    mesh_proxy_data_in.writeValue(proxy_pdu_data.buffer)
        .then(_ => {
            console.log('sent proxy pdu OK');
            seq++;
        })
        .catch(error => {
            alert('Error: ' + error);
            app.showMessageRed('Error: ' + error);
            console.log('Error: ' + error);
            return;
        });
}


UpperTransport.OUT_ProcessAccessPDU  = function (Access_message) {
  //3.6.4.2 Receiving an Upper Transport PDU
  //3.8.5.1 Device nonce
  ASZMIC_and_Pad = Access_message.SZMIC?'80':'00';
  SRC = Access_message.NetworkPDU.SRC;
  DST = Access_message.NetworkPDU.DST;
  SEQ = utils.toHex(Access_message.SeqZero, 3);
  var device_nonce = '02' + ASZMIC_and_Pad + SEQ + SRC + DST + iv_index;
  console.log('device_nonce len : ' + device_nonce.length + ' : ' + device_nonce);

  console.log('D : ' + D);
  var TransMIC_size = Access_message.SZMIC?8:4;
  dec_upper_transport_layer = crypto.meshAuthEncAccessPayload_decode(D, device_nonce, Access_message.UpperTransportAccessPDU, TransMIC_size);
  console.log('meshAuthEncAccessPayload_decode complete');
  console.log('meshAuthEncAccessPayload_decode : ' + JSON.stringify(dec_upper_transport_layer));

  Access_Layer.receiver(dec_upper_transport_layer);
  return;
}


/***************************************************************************************************/
var Access_Layer = {};

Access_Layer.receiver = function (dec_upper_transport_layer){
  //example data page 0 parsing, See : p330
  //8.10 Composition Data sample data
  //4.2.1 Composition Data
  //4.2.1.1 Composition Data Page 0

  var result = {
    opcode: 0,
    parameters: '',
  };
  var octet0 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(0, 1*2))[0];
  var octet1 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(1*2, 2*2))[0];
  var octet2 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(2*2, 3*2))[0];
  var BIT7  = (octet0 & (1<<7))?1:0;
  var BIT6  = (octet0 & (1<<6))?1:0;

  console.log('BIT7: ' + BIT7 + 'BIT6: ' + BIT6);


  if(octet0 == 0x7F){
    //RFU

  } else if(!BIT7){
    //Opcode size = 1
    result.parameters = dec_upper_transport_layer.Payload.substring(1*2);
    result.opcode = octet0;
  } else if(BIT7 && !BIT6){
    //Opcode size = 2
    result.parameters = dec_upper_transport_layer.Payload.substring(2*2);
    result.opcode = (octet0 << 8) + octet1;
  } else if(BIT7 && BIT6){
    //Opcode size = 3
    result.parameters = dec_upper_transport_layer.Payload.substring(3*2);
    result.opcode = (octet0 << 16) + (octet1 << 8) + octet2;
  } else {
    //
    alert('Error: Access_Layer, invalid opcode');
  }



  console.log('Access_Layer : ' + JSON.stringify(result));
  Fundation_models_layer.receiver(result);
}

/***************************************************************************************************/
var Fundation_models_layer = {};

Fundation_models_layer.receiver = function (result){
//4.3.4.1 Alphabetical summary of opcodes
console.log('Opcode : ' + JSON.stringify(OPCODE[result.opcode]));


if(OPCODE[result.opcode].process){
  //
  OPCODE[result.opcode].process(result.parameters);
}





}
