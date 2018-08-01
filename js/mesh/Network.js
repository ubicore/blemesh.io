
//Network_LOG = console.log;
Network_LOG =  function() {}


var Network = {};

// network PDU fields
Network.ttl = 0x03;

/*********************************/
//IN
Network.deriveSecure = function (hex_dst, lower_transport_pdu, parameters) {
    var network_pdu = "";
    var ctl_ttl = (parameters.CTL << 7) + (Network.ttl & 0x7F);
    var npdu1 = utils.intToHex(ctl_ttl);
    var Nonce_Type = "00";
    var net_nonce = Nonce_Type + npdu1 + parameters.SEQ + parameters.SRC + "0000" + parameters.iv_index;
    Network_LOG("net_nonce: " + net_nonce);

    K = utils.normaliseHex(Selected_NetKey.EncryptionKey);

    var MIC_size = parameters.CTL?8:4;
    Network_LOG("MIC_size: " + MIC_size);

    network_pdu = crypto.meshAuthEncNetwork(K, net_nonce, parameters.DST, lower_transport_pdu, MIC_size);
    return network_pdu;
};


Network.obfuscate = function (network_pdu, parameters) {
    obfuscated = "";
    obfuscated = crypto.obfuscate(network_pdu.EncDST, network_pdu.EncTransportPDU, network_pdu.NetMIC,
       parameters.CTL, Network.ttl, parameters.SEQ, parameters.SRC, parameters.iv_index, Selected_NetKey.PrivacyKey);
    return obfuscated;
};

Network.finalise = function ( nid, obfuscated_ctl_ttl_seq_src, enc_dst, enc_transport_pdu, netmic) {
    nid_int = parseInt(nid, 16);
    ivi = (parameters.iv_index << 7);
    npdu0 = utils.intToHex(ivi | nid_int);
    netpdu = npdu0 + obfuscated_ctl_ttl_seq_src + enc_dst + enc_transport_pdu + netmic;
    return netpdu;
};

Network.Send = function(lower_transport_pdu, parameters){
  return new Promise((resolve, reject) => {
    // encrypt network PDU
    secured_network_pdu = Network.deriveSecure(lower_transport_pdu, parameters);
    Network_LOG("secured_network_pdu: " + JSON.stringify(secured_network_pdu));

    // obfuscate
    obfuscated = Network.obfuscate(secured_network_pdu, parameters);
    Network_LOG("obfuscated: " + JSON.stringify(obfuscated));

    // finalise network PDU
    finalised_network_pdu = Network.finalise( Selected_NetKey.NID, obfuscated.obfuscated_ctl_ttl_seq_src, secured_network_pdu.EncDST, secured_network_pdu.EncTransportPDU, network_pdu.NetMIC);
    Network_LOG("finalised_network_pdu: " + finalised_network_pdu);

    proxy_pdu_bytes = utils.hexToBytes('00' + finalised_network_pdu);
    proxy_pdu_data = new Uint8Array(proxy_pdu_bytes)

    connection.ProxyPDU_IN.Send(proxy_pdu_data)
    .then(() => {
      Network_LOG('sent proxy pdu OK');
      seq++;
      sessionStorage.setItem('seq', seq);
      resolve();
    })
    .catch(error => {
      // HMI.showMessageRed(error);
      // Network_LOG('ERROR: ' + error);
      reject(error);
    });
  });
}

/*********************************/
//Out
Network.receive = function (netpduhex) {

  var NetworkPDU =  {};
		// ivi: 0,
		// nid: 0,
    // CTL: 0,
    // TTL: 0,
    // SEQ: 0,
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
  var iv_index = utils.toHex(db.data.IVindex, 4);

  var pecb_input = "0000000000" + iv_index + privacy_random_hex;
  var pecb_hex = crypto.e(pecb_input, Selected_NetKey.PrivacyKey);
  var pecb = pecb_hex.substring(0, 6*2);

  //Reverse Obfuscate
	var ctl_ttl_seq_src = utils.xorU8Array(utils.hexToU8A(obfuscated_ctl_ttl_seq_src), utils.hexToU8A(pecb));
  var ctl_ttl_seq_src_hex = utils.u8AToHexString(ctl_ttl_seq_src);
  //
  Network_LOG('ctl_ttl_seq_src : ' + ctl_ttl_seq_src);
  Network_LOG('ctl_ttl_seq_src_hex : ' + ctl_ttl_seq_src_hex);

  var ctl_ttl_hex = ctl_ttl_seq_src_hex.substring(0, 1*2);
  var ctl_ttl = parseInt(ctl_ttl_hex, 16);
  NetworkPDU.CTL = (ctl_ttl & (1 << 7))?1:0;
  NetworkPDU.TTL = ctl_ttl & 0x7F;

  var octet0 = utils.hexToU8A(ctl_ttl_seq_src_hex.substring(1*2, 2*2))[0];
  var octet1 = utils.hexToU8A(ctl_ttl_seq_src_hex.substring(2*2, 3*2))[0];
  var octet2 = utils.hexToU8A(ctl_ttl_seq_src_hex.substring(3*2, 4*2))[0];
  NetworkPDU.SEQ = (octet0 << 16) + (octet1 << 8) + octet2;
//  NetworkPDU.SEQ =  ctl_ttl_seq_src_hex.substring(1*2, 4*2);
  NetworkPDU.SRC =  ctl_ttl_seq_src_hex.substring(4*2, 6*2);

  if(NetworkPDU.SEQ > seq){
    seq = NetworkPDU.SEQ;
    sessionStorage.setItem('seq', seq);
  }

  //Decode Network
  K = utils.normaliseHex(Selected_NetKey.EncryptionKey);
  //3.8.5.1 Network nonce
  var net_nonce = "00" + ctl_ttl_hex + utils.toHex(NetworkPDU.SEQ, 3) + NetworkPDU.SRC + "0000" + iv_index;
  var EncNetData = netpduhex.substring(7*2);
  var NetMIC_size = NetworkPDU.CTL?8:4;
  DecNetData = crypto.meshAuthEncNetwork_decode(K, net_nonce, EncNetData, NetMIC_size);

  NetworkPDU.DST = DecNetData.DST;
  NetworkPDU.TransportPDU = DecNetData.TransportPDU;

  Network_LOG("NetworkPDU : " + JSON.stringify(NetworkPDU));
  LowerTransport.receive(NetworkPDU);
}
