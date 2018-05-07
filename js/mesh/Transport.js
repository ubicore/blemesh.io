

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
//OUT
// DataView.prototype.getUint24 = function(pos) {
// 	return (this.getUint16(pos) << 8) + this.getUint8(pos+2);
// }

var OUT_Upper_Transport_Access_PDU = {
  EncAccessPayload : '',
  TransMIC_size : 0,
  ASZMIC : 0,
  SeqZero_hex : '',
  SRC: '',
  DST: '',
}

var Segmented_Access_Message_value;

Network.receive = function (netpduhex, privacy_key) {

  var result = {
		ivi: 0,
		nid: 0,
    CTL: 0,
    TTL: 0,
    SEQ: '',
    SRC: '',
    DST: '',
    enc_transport_pdu: 0,
    netmic: 0,
	};

  //octet 0
  var M = netpduhex.substring(0, 1*2);
  var M_int =  (utils.hexToBytes(M))[0];
  //
  result.ivi = (M_int & (1 << 7));
  result.nid = (M_int & 0x7F);

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
  result.CTL = (ctl_ttl & (1 << 7))?1:0;
  result.TTL = ctl_ttl & 0x7F;
  result.SEQ =  ctl_ttl_seq_src_hex.substring(1*2, 4*2);; //(ctl_ttl_seq_src[1] << 16) + (ctl_ttl_seq_src[2] << 8) + ctl_ttl_seq_src[3];
  result.SRC =  ctl_ttl_seq_src_hex.substring(4*2, 6*2);

  var NetMIC_start_offset = 0;
  console.log('CTL : ' + result.CTL);
  //
  if(result.CTL == 0){
    //Access message NetMIC Size = 32 bits
    NetMIC_start_offset = (netpduhex.lenght - 4*2);
  }else{
    //Control message NetMIC Size = 64 bits
    NetMIC_start_offset = (netpduhex.lenght - 8*2);
  }

  var auth_enc_network = netpduhex.substring(7*2, netpduhex.lenght);

  console.log("result : " + JSON.stringify(result));


  //3.8.5.1 Network nonce
  var net_nonce = "00" + ctl_ttl_hex + result.SEQ + result.SRC + "0000" + iv_index;

  K = utils.normaliseHex(hex_encryption_key);
  var MIC_size = result.CTL?8:4;
  dec_network_pdu = crypto.meshAuthEncNetwork_decode(K, net_nonce, auth_enc_network, MIC_size);

  result.DST = dec_network_pdu.DST;
  console.log('dec_network_pdu : ' + JSON.stringify(dec_network_pdu));

  //3.5.2 Lower Transport PDU
  //3.5.2.2 Segmented Access message
  var octet0 = utils.hexToU8A(dec_network_pdu.TransportPDU.substring(0, 1*2))[0];
  var octet1 = utils.hexToU8A(dec_network_pdu.TransportPDU.substring(1*2, 2*2))[0];
  var octet2 = utils.hexToU8A(dec_network_pdu.TransportPDU.substring(2*2, 3*2))[0];
  var octet3 = utils.hexToU8A(dec_network_pdu.TransportPDU.substring(3*2, 4*2))[0];

  if(result.CTL == 0){
      //Access message
      var Access_message = {
        SEG : (octet0 & (1<<7))?1:0,
        AKF : (octet0 & (1<<6))?1:0,
        AID : octet0 & 0x3F,
        SZMIC : 0,
        SeqZero : 0,
        SegO : 0,
        SegN : 0,
      };
      // var SEG = (octet0 & (1<<7))?1:0;
      // var AKF = (octet0 & (1<<6))?1:0;
      // var AID = octet0 & 0x3F;
      //
      if(Access_message.SEG == 0) {///Unsegmented Access Message
        //
        console.log('Unsegmented Access Message : ' + JSON.stringify(Access_message));
        //TODO

        OUT_Upper_Transport_Access_PDU.ASZMIC = '00';



      } else if(Access_message.SEG == 1){//Segmented Access Message
        Access_message.SZMIC = (octet1 & (1<<7))?1:0;
        Access_message.SeqZero = (((octet1 & 0x7F) << 8) + octet2) >> 2; //TODO : ne correspod pas au traces de debug zephy ??
        Access_message.SegO = (((octet2 & 0x03) << 8) + octet3) >> 5;
        Access_message.SegN = octet3 & 0x1F;
        console.log('Access_message : ' + JSON.stringify(Access_message));

        //Init Output on the first Segment
        if(Access_message.SegO == 0){
          Segmented_Access_Message_value = Access_message;
          OUT_Upper_Transport_Access_PDU.EncAccessPayload = '';
          OUT_Upper_Transport_Access_PDU.TransMIC_size = 0;
//          OUT_Upper_Transport_Access_PDU.SeqZero = result.SEQ;
          OUT_Upper_Transport_Access_PDU.SeqZero_hex = utils.toHex(Access_message.SeqZero, 3);

        //  OUT_Upper_Transport_Access_PDU.SeqAuth = iv_index + result.SEQ;

        } else {
          //Check every segment
          if((Segmented_Access_Message_value.AKF != Access_message.AKF) ||
          (Segmented_Access_Message_value.AID != Access_message.AID) ||
          (Segmented_Access_Message_value.SZMIC != Access_message.SZMIC) ||
          (Segmented_Access_Message_value.SeqZero != Access_message.SeqZero) ||
          (Segmented_Access_Message_value.SegN != Access_message.SegN)){
            alert('Error: Segmented Access Message Invalid segment');
            return;
          }

        }

        var Segment_m = dec_network_pdu.TransportPDU.substring(4*2);
        console.log('Segment_m : ' + Segment_m + ' len : ' + Segment_m.length); //TODO : ne correspod pas au traces de debug zephy ??

        OUT_Upper_Transport_Access_PDU.EncAccessPayload += Segment_m;

        if(Access_message.SegO == Access_message.SegN ){
          OUT_Upper_Transport_Access_PDU.TransMIC_size = Segmented_Access_Message_value.SZMIC?8:4; //in bytes
          OUT_Upper_Transport_Access_PDU.ASZMIC = '80';
          OUT_Upper_Transport_Access_PDU.SRC = result.SRC;
          OUT_Upper_Transport_Access_PDU.DST = result.DST;

          console.log('Get a complete  Upper_Transport_Access_PDU : ' + JSON.stringify(OUT_Upper_Transport_Access_PDU));
          UpperTransport.OUT_ProcessAccessPDU(OUT_Upper_Transport_Access_PDU);


          //TODO

        }
      }

  }else{
      //Control message
      var Control_message = {
        SEG : (octet0 & (1<<7))?1:0,
        OPCODE : octet0 & 0x7F,
      };


      //
      if(Control_message.SEG == 0) {///Unsegmented Control Message
        if(OPCODE == 0){ //3.5.2.3.1 Segment Acknowledgment message
          Control_message.OBO = (octet1 & (1<<7))?1:0;
          Control_message.SeqZero = (((octet1 & 0x7F) << 8) + octet2) >> 2;
          Control_message.BlockAck = dec_network_pdu.TransportPDU.substring(3*2, 7*2);
          console.log('Segment Acknowledgment message : ' + JSON.stringify(Control_message));


        }else {
          console.log('Segment Control message : ' + JSON.stringify(Control_message));

        }


      } else if(SEG == 1){//Segmented Control Message
        console.log('Segmented Control message : ' + JSON.stringify(Control_message));

      }
  }




//  result.DST =  ctl_ttl_seq_src_hex.substring(7*2, 9*2);


  return result;
};


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


UpperTransport.OUT_ProcessAccessPDU  = function (OUT_Upper_Transport_Access_PDU) {
  //3.6.4.2 Receiving an Upper Transport PDU

  //3.8.5.1 Device nonce
  ASZMIC_and_Pad = OUT_Upper_Transport_Access_PDU.ASZMIC;



  // SEQ = OUT_Upper_Transport_Access_PDU.SeqAuth.substring( (OUT_Upper_Transport_Access_PDU.SeqAuth.lenght - 3*2), OUT_Upper_Transport_Access_PDU.SeqAuth.lenght );
  // console.log('SEQ : ' + SEQ);

  SRC = OUT_Upper_Transport_Access_PDU.SRC;
  DST = OUT_Upper_Transport_Access_PDU.DST;
  SEQ = OUT_Upper_Transport_Access_PDU.SeqZero_hex;
  var device_nonce = '02' + ASZMIC_and_Pad + SEQ + SRC + DST + iv_index;
  console.log('device_nonce len : ' + device_nonce.length + ' : ' + device_nonce);
  console.log('D : ' + D);

  dec_upper_transport_layer = crypto.meshAuthEncAccessPayload_decode(D, device_nonce, OUT_Upper_Transport_Access_PDU.EncAccessPayload, OUT_Upper_Transport_Access_PDU.TransMIC_size);
  console.log('meshAuthEncAccessPayload_decode compplete');
  console.log('dec_network_pdu : ' + JSON.stringify(dec_network_pdu));

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
