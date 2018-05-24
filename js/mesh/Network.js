
var Network = {};

// network PDU fields
var ctl = 0;
var ivi = 0;
var nid = "00";
var ttl = 0x03;

/*********************************/
//IN
Network.deriveSecure = function (hex_dst, lower_transport_pdu) {
    network_pdu = "";
    ctl_ttl = (ctl << 7) + (ttl & 0x7F);
    npdu2 = utils.intToHex(ctl_ttl);
    K = utils.normaliseHex(NetKey.EncryptionKey);
    iv_index = utils.toHex(db.data.IVindex, 4);
    net_nonce = "00" + npdu2 + utils.toHex(seq, 3) + src + "0000" + iv_index;
    console.log("net_nonce: " + net_nonce);

    var MIC_size = ctl?8:4;
    console.log("MIC_size: " + MIC_size);

    network_pdu = crypto.meshAuthEncNetwork(K, net_nonce, hex_dst, lower_transport_pdu, MIC_size);
    return network_pdu;
};


Network.obfuscate = function (network_pdu) {
    obfuscated = "";
    iv_index = utils.toHex(db.data.IVindex, 4);
    obfuscated = crypto.obfuscate(network_pdu.EncDST, network_pdu.EncTransportPDU, network_pdu.NetMIC, ctl, ttl, utils.toHex(seq, 3), src, iv_index, NetKey.PrivacyKey);
    return obfuscated;
};

Network.finalise = function (ivi, nid, obfuscated_ctl_ttl_seq_src, enc_dst, enc_transport_pdu, netmic) {
    ivi_int = parseInt(ivi, 16);
    nid_int = parseInt(nid, 16);
    npdu1 = utils.intToHex((ivi_int << 7) | nid_int);
    netpdu = npdu1 + obfuscated_ctl_ttl_seq_src + enc_dst + enc_transport_pdu + netmic;
    return netpdu;
};

Network.Send = function(lower_transport_pdu){
    // encrypt network PDU
    secured_network_pdu = Network.deriveSecure(Node.dst, lower_transport_pdu);
    console.log("secured_network_pdu: " + JSON.stringify(secured_network_pdu));

    // obfuscate
    obfuscated = Network.obfuscate(secured_network_pdu);
    console.log("obfuscated: " + JSON.stringify(obfuscated));

    // finalise network PDU
    finalised_network_pdu = Network.finalise(ivi, NetKey.NID, obfuscated.obfuscated_ctl_ttl_seq_src, secured_network_pdu.EncDST, secured_network_pdu.EncTransportPDU, network_pdu.NetMIC);
    console.log("finalised_network_pdu: " + finalised_network_pdu);

    proxy_pdu_bytes = utils.hexToBytes('00' + finalised_network_pdu);
    proxy_pdu_data = new Uint8Array(proxy_pdu_bytes)

    connection.ProxyPDU_IN.Send(proxy_pdu_data,
      function(){
        console.log('sent proxy pdu OK');
        seq++;
        sessionStorage.setItem('seq', seq);
      },
      function(){
        alert('Error: ' + error);
        IHM.showMessageRed('Error: ' + error);
        console.log('Error: ' + error);
        return;
      }
    );
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
  iv_index = utils.toHex(db.data.IVindex, 4);

  var pecb_input = "0000000000" + iv_index + privacy_random_hex;
  var pecb_hex = crypto.e(pecb_input, NetKey.PrivacyKey);
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
  K = utils.normaliseHex(NetKey.EncryptionKey);
  //3.8.5.1 Network nonce
  var net_nonce = "00" + ctl_ttl_hex + utils.toHex(NetworkPDU.SEQ, 3) + NetworkPDU.SRC + "0000" + iv_index;
  var EncNetData = netpduhex.substring(7*2);
  var NetMIC_size = NetworkPDU.CTL?8:4;
  DecNetData = crypto.meshAuthEncNetwork_decode(K, net_nonce, EncNetData, NetMIC_size);

  NetworkPDU.DST = DecNetData.DST;
  NetworkPDU.TransportPDU = DecNetData.TransportPDU;

  console.log("NetworkPDU : " + JSON.stringify(NetworkPDU));
  LowerTransport.receive(NetworkPDU);
}
