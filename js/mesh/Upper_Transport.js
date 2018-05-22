var UpperTransport = {};

UpperTransport.deriveSecure_DeviceKey = function (access_payload) {
    upper_trans_pdu = {};

    aid = 0;
    akf = 0;

    iv_index = utils.toHex(db.data.IVindex, 4);

    // derive Application Nonce (ref 3.8.5.2)
    app_nonce = "0200" + utils.toHex(seq, 3) + src + dst + iv_index;
    upper_trans_pdu = crypto.meshAuthEncAccessPayload(SelectedNode.deviceKey, app_nonce, access_payload);
    return upper_trans_pdu;
}


UpperTransport.deriveSecure_AppKey = function (access_payload) {
    upper_trans_pdu = {};

    aid = AppKey.aid;
    akf = 1;
    iv_index = utils.toHex(db.data.IVindex, 4);

    // derive Application Nonce (ref 3.8.5.2)
    app_nonce = "0100" + utils.toHex(seq, 3) + src + dst + iv_index;
    upper_trans_pdu = crypto.meshAuthEncAccessPayload(AppKey.key, app_nonce, access_payload);
    return upper_trans_pdu;
}

UpperTransport.Send_With_DeviceKey = function (mesh_proxy_data_in, access_payload) {
    console.log("UpperTransport.Send_With_DeviceKey");

    // access payload
    console.log("access_payload=" + access_payload);

    // upper transport PDU
    upper_transport_pdu_obj = UpperTransport.deriveSecure_DeviceKey(access_payload);
    console.log('upper_transport_pdu_obj : ' + JSON.stringify(upper_transport_pdu_obj));

    // derive lower transport PDU
    lower_transport_pdu = LowerTransport.derive(upper_transport_pdu_obj);
    console.log('lower_transport_pdu : ' + JSON.stringify(lower_transport_pdu));
    ctl = 0;
    Network.Send(lower_transport_pdu);
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

  console.log('SelectedNode.deviceKey : ' + SelectedNode.deviceKey);
  var TransMIC_size = Access_message.SZMIC?8:4;
  dec_upper_transport_layer = crypto.meshAuthEncAccessPayload_decode(SelectedNode.deviceKey, device_nonce, Access_message.UpperTransportAccessPDU, TransMIC_size);
  console.log('meshAuthEncAccessPayload_decode complete');
  console.log('meshAuthEncAccessPayload_decode : ' + JSON.stringify(dec_upper_transport_layer));

  Access_Layer.receiver(dec_upper_transport_layer);
  return;
}
