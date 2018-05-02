

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
    N = utils.normaliseHex(hex_encryption_key);
    net_nonce = "00" + npdu2 + utils.toHex(seq, 3) + src + "0000" + iv_index;
    network_pdu = crypto.meshAuthEncNetwork(N, net_nonce, hex_dst, lower_transport_pdu);
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




Network.receive = function (netpduhex, privacy_key) {

  var result = {
		ivi: 0,
		nid: 0,
    CTL: 0,
    TTL: 0,
    SEQ: 0,
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
  var obfuscated_ctl_ttl_seq_src = netpduhex.substring(1*2, 7*2);
  var privacy_random = netpduhex.substring(7*2, 13*2);

  var pecb_input = "0000000000" + iv_index + hex_privacy_random;
  var pecb_hex = crypto.e(pecb_input, privacy_key);
  var pecb = pecb_hex.substring(0, 6*2);

  //Reverse Obfuscate
	var ctl_ttl_seq_src = utils.xorU8Array(utils.hexToU8A(obfuscated_ctl_ttl_seq_src), utils.hexToU8A(pecb));
  var ctl_ttl_seq_src_hex = utils.u8AToHexString(ctl_ttl_seq_src);
  //
  var ctl_ttl_hex = ctl_ttl_seq_src_hex.substring(0, 1*2);
  var ctl_ttl = parseInt(ctl_ttl_hex, 16);
  result.CTL = (ctl_ttl & (1 << 7))?1:0;
  result.TTL = ctl_ttl & 0x7F;
  var seq_hex =  ctl_ttl_seq_src_hex.substring(1*2, 4*2);
  result.SEQ = (ctl_ttl_seq_src[1] << 16) + (ctl_ttl_seq_src[2] << 8) + ctl_ttl_seq_src[2];

  //result.SRC =  ctl_ttl_seq_src_hex.substring(5*2, 7*2);
  var src_hex =  ctl_ttl_seq_src_hex.substring(4*2, 6*2);

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
//  result.enc_transport_pdu =  ctl_ttl_seq_src_hex.substring(7*2, NetMIC_start_offset);
//  result.netmic =  ctl_ttl_seq_src_hex.substring(NetMIC_start_offset, netpduhex.lenght);
console.log('ctl_ttl_hex : ' + ctl_ttl_hex);
console.log('seq_hex : ' + seq_hex);
console.log('src_hex : ' + src_hex);
console.log('iv_index : ' + iv_index);
  //3.8.5.1 Network nonce
  var net_nonce = "00" + ctl_ttl_hex + seq_hex + src_hex + "0000" + iv_index;
  console.log('ctl_ttl_hex : ' + ctl_ttl_hex);
  console.log('seq_hex : ' + seq_hex);
  console.log('src_hex : ' + src_hex);
  console.log('iv_index : ' + iv_index);

  console.log('net_nonce : ' + net_nonce.length);
  console.log('net_nonce : ' + net_nonce);

  N = utils.normaliseHex(hex_encryption_key);
  dec_network_pdu = crypto.meshAuthEncNetwork_decode(N, net_nonce, auth_enc_network, result.CTL);

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
