

var seq = 0; //

var Selected_NetKey;
var Selected_AppKey;

var Security = {};
Security.NetKey = {};
Security.AppKey = {};

Security.Load = function () {
  // Get saved data from sessionStorage
  // devkey = sessionStorage.getItem('devkey');
  // if(!devkey){
  //   console.log("No provision data ");
  //   return;
  // }
  seq = sessionStorage.getItem('seq');
  if(!seq){
    seq = 0;
  }
  console.log('seq: ' + seq);

  Selected_NetKey = db.data.netKeys[0];
  Selected_AppKey = db.data.appKeys[0];

  Security.NetKey.Derivation(Selected_NetKey);
  Security.AppKey.Derivation(Selected_AppKey);

  I = utils.toHex(db.data.IVindex, 4);
  ivi = utils.leastSignificantBit(db.data.IVindex)
}



Security.NetKey.Create = function (index) {
  var NetKey = {
    "index":utils.toHex(index, 2),
    "keyRefresh":0,
    "key":""
  }

  var random = new Uint8Array(16);
  window.crypto.getRandomValues(random);
  NetKey.key  = utils.bytesToHex(random);

  return NetKey;
}

Security.NetKey.Derivation = function (NetKey) {

  k2_material = crypto.k2(NetKey.key, "00");
  NetKey.EncryptionKey = k2_material.encryption_key;
  NetKey.PrivacyKey = k2_material.privacy_key;
  NetKey.NID = k2_material.NID;
  NetKey.Network_ID = crypto.k3(NetKey.key);

  console.log("NetKey: " + JSON.stringify(NetKey));

  return;
}



Security.AppKey.Create = function (index, boundNetKeyIndex ) {
  var AppKey = {
    "index":index,
    "boundNetKey":boundNetKeyIndex,
    "key":""
  }

  var random = new Uint8Array(16);
  window.crypto.getRandomValues(random);
  AppKey.key  = utils.bytesToHex(random);

  return AppKey;
}

Security.AppKey.Derivation = function (AppKey) {
  AppKey.aid = crypto.k4(AppKey.key);
  return;
}
