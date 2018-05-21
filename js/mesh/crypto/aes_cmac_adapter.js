// isolates use of the CryptoJS CMAC extension library which is not available from node.js
// i.e. on node.js only this file needs to change for the crypto.js functions to work.

aescmac = {};

aescmac.getAesCmac = function(hex_key,hex_message) {

  console.log("getAesCmac("+hex_key+","+hex_message+")");
  key = CryptoJS.enc.Hex.parse(hex_key);
  // "message must be a WordArray" : https://github.com/artjomb/cryptojs-extension
  message = byteArrayToWordArray(hexToBytes(hex_message));
  return CryptoJS.CMAC(key, message);
}