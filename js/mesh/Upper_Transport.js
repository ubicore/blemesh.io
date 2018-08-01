UpperTransport_LOG = console.log;
//UpperTransport_LOG =  function() {}

var UpperTransport = {};

const ENCRYPTED_ACCESS_PAYLOAD_MAX_SIZE = 380;


UpperTransport.deriveSecure = function (access_payload, parameters) {
    upper_trans_pdu = {};
    // Nonce (ref 3.8.5)
    nonce = parameters.Nonce_Type + parameters.ASZMIC_and_Pad + parameters.SEQ + parameters.SRC + parameters.DST + parameters.iv_index;
    console.log('nonce len : ' + nonce.length + ' : ' + nonce);

    upper_trans_pdu = crypto.meshAuthEncAccessPayload(parameters.KEY, nonce, access_payload);
    return upper_trans_pdu;
}


UpperTransport.Send_With_DeviceKey = function (mesh_proxy_data_in, access_payload, TransMIC_size, UseAppKey) {
  return new Promise((resolve, reject) => {

    if(access_payload.length > (ENCRYPTED_ACCESS_PAYLOAD_MAX_SIZE*2 + 4*2 -  TransMIC_size*2)){
      reject('Payload exced max size');
      return;
    }

    var parameters = {
      SEG: (access_payload.length > 11*2)?1:0,
      AKF: UseAppKey?1:0,
      AID: UseAppKey?parseInt(Selected_AppKey.aid, 16):0,
      //SZMIC:0,
      //
      KEY: UseAppKey?Selected_AppKey:Node.SelectedNode.deviceKey,

      SeqAuth: ((db.data.IVindex << 24) | (seq & 0xFFF)),
//      SeqZero: ,

      //nonce param
      Nonce_Type: UseAppKey?'01':'02',
      //ASZMIC_and_Pad:'00',
      SEQ: utils.toHex(seq, 3),
      SRC: Own_SRC,
      DST: Node.dst,
      iv_index: utils.toHex(db.data.IVindex, 4),
    }

    parameters.SeqZero = (parameters.SeqAuth & 0x1FFF);

    //
    if(parameters.SEG == 0){
        TransMIC_size = 4; //force TransMIC size to 4 only for unsegmented data message
    }

    parameters.SZMIC = (TransMIC_size == 8)?1:0;
    var ASZMIC = parameters.SEG?parameters.SZMIC:0;
    parameters.ASZMIC_and_Pad = ASZMIC?'80':'00';


    // access payload
    console.log("access_payload=" + access_payload);
    // upper transport PDU
    upper_transport_pdu_obj = UpperTransport.deriveSecure(access_payload, parameters);
    console.log('upper_transport_pdu_obj : ' + JSON.stringify(upper_transport_pdu_obj));

    // //lower transport PDU
    // lower_transport_pdu = LowerTransport.derive(upper_transport_pdu_obj);
    // console.log('lower_transport_pdu : ' + JSON.stringify(lower_transport_pdu));

    LowerTransport.Send(upper_transport_pdu_obj, parameters)
    .then(() => {
      UpperTransport_LOG("UpperTransport.Send_With_DeviceKey OK");
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
}




UpperTransport.OUT_ProcessAccessPDU  = function (Access_message) {
  //3.6.4.2 Receiving an Upper Transport PDU
  //3.8.5.1 Device nonce
  ASZMIC_and_Pad = Access_message.SZMIC?'80':'00';
  SRC = Access_message.NetworkPDU.SRC;
  DST = Access_message.NetworkPDU.DST;
  SEQ = utils.toHex(Access_message.SeqZero, 3);
  iv_index = utils.toHex(db.data.IVindex, 4);

  var device_nonce = '02' + ASZMIC_and_Pad + SEQ + SRC + DST + iv_index;
  console.log('device_nonce len : ' + device_nonce.length + ' : ' + device_nonce);

  console.log('Node.SelectedNode.deviceKey : ' + Node.SelectedNode.deviceKey);
  var TransMIC_size = Access_message.SZMIC?8:4;
  dec_upper_transport_layer = crypto.meshAuthEncAccessPayload_decode(Node.SelectedNode.deviceKey, device_nonce, Access_message.UpperTransportAccessPDU, TransMIC_size);
  console.log('meshAuthEncAccessPayload_decode complete');
  console.log('meshAuthEncAccessPayload_decode : ' + JSON.stringify(dec_upper_transport_layer));

  Access_Layer.receiver(dec_upper_transport_layer);
  return;
}
