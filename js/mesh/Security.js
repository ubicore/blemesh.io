

//src
//dst
//iv_index

//Keys
var NetKeyIndex =0;
var netkey = "7dd7364cd842ad18c17c2b820c84c3d6";

var AppKeyIndex = 0;
var appkey = "63964771734fbd76e3b40519d1d94a48";


var devkey = ''

var seq = 0; //
var iv_index = "12345677";



var Security = {};

Security.initialize = function () {
  // Get saved data from sessionStorage
  devkey = sessionStorage.getItem('devkey');
  if(!devkey){
    console.log("No provision data ");
    return;
  }
  seq = sessionStorage.getItem('seq');
  if(!seq){
    seq = 0;
  }
  console.log('seq: ' + seq);

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
