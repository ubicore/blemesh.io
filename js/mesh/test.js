
var test = {};

//Adapted from http://stackoverflow.com/a/9458996
function _arrayBufferToJwkBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    var base64 = window.btoa( binary );
    var jwk_base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    return jwk_base64;
};
test.start2 = function() {
  window.crypto.subtle.generateKey(
    {
        name: "ECDH",
        namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
    },
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ["deriveKey", "deriveBits"] //can be any combination of "deriveKey" and "deriveBits"
)
.then(function(key){
    //returns a keypair object
    console.log(key);
    console.log(key.publicKey);
    console.log(key.privateKey);
})
.catch(function(err){
    console.error(err);
});
};
test.start = function() {
  //test.EDCH();
  test.Confirmation();

};


test.EDCH = function() {
        console.log('START Ecc function implementation test');
        /***************************************************/

        // this.AES_CMAC_s1('test');

        // var N = '3216d1509884b533248541792b877f98';
        // var SALT = '2ba14ffa0df84a2831938d57d276cab4';
        // var P = '5a09d60797eeb4478aada59db3352a0d';

        // this.AES_CMAC_k1(N, SALT, P);

        /***************************************************/
        //Test key build and EDCH calc
        //See 8.7 PB-ADV provisioning sample data

        const Prov_Private_Key = '06a516693c9aa31a6084545d0c5db641b48572b97203ddffb7ac73f7d0457663';
        const Prov_Public_Key   = '2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f';
        const Device_Private_Key = '529aa0670d72cd6497502ed473502b037e8803b5c60829a5a3caa219505530ba';
        const Device_Public_Key = 'f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279';

        const Prov_ECDH = 'ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69';
        const Device_ECDH = 'ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69';
        const Prov_Random = '8b19ac31d58b124c946209b5db1021b9';
        const Device_Random = '55a2a2bca04cd32ff6f346bd0a0c1a3a';

        // ProvKey uses a newly generated cryptographically strong
        // pseudorandom key pair
        //var Privatekey = new Uint8Array(utils.hexToBytes(Prov_Private_Key));
        var Privatekey = new Uint8Array(utils.hexToBytes(Prov_Private_Key));
        var key = Privatekey.buffer;
        var key_x =  Privatekey.slice(0, 16);
        var key_y =  Privatekey.slice(16);
        console.log('Prov_Private_Key: ' + Prov_Private_Key);
        console.log('key_x: ' + key_x);
        console.log('key_y: ' + key_y);

        window.crypto.subtle.importKey(
          // "jwk", //can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
          // {   //this is an example jwk key, other key types are Uint8Array objects
          //     kty: "EC",
          //     crv: "P-256",
          //     x: _arrayBufferToJwkBase64(key_x),
          //     y: _arrayBufferToJwkBase64(key_y),
          // },
          "jwk", //can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
// {   //this is an example jwk key, other key types are Uint8Array objects
//     kty: "EC",
//     crv: "P-256",
//     x: _arrayBufferToJwkBase64(key_x),
//     y: _arrayBufferToJwkBase64(key_y),
//     d: "5aPFSt0UFVXYGu-ZKyC9FQIUOAMmnjzdIwkxCMe3Iok",
// //    ext: true,
// },
{"kty":"EC",
 "crv":"P-256",
 "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
 "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
// "kid":"Public key used in JWS A.3 example"
},
            {   //these are the algorithm options
              name: 'ECDH',
              namedCurve: 'P-256'
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["deriveKey", "deriveBits"] //"deriveKey" and/or "deriveBits" for private keys only (just put an empty list if importing a public key)
        )
        .then(function(privateKey){
            //returns a privateKey (or publicKey if you are importing a public key)
            console.log(privateKey);





        })
        .catch(function(err){
            console.log('Fail catched');

            console.error(err);
        });



        return;






        window.crypto.subtle.setPrivateKey
        console.log('setPrivateKey');
        ProvKeyObj.setPrivateKey(Prov_Private_Key, 'hex');

        var Prov_Public_Key_With_Tag = Buffer.alloc(65);
        Prov_Public_Key_With_Tag[0] = 0x04 //Tag PubKey
        Prov_Public_Key_With_Tag.fill(Prov_Public_Key, 1);
        //Get Public Key
        var Calc_Prov_Public_Key = ProvKeyObj.getPublicKey();
        //Test Calc_ProvEDCHSecret
        if (Buffer.compare(Calc_Prov_Public_Key, Prov_Public_Key_With_Tag) != 0) {
            console.log('Error : Calc_Prov_Public_Key is diff! ');
            return;
        } else {
            console.log('Calc_Prov_Public_Key : OK');
            console.log('Calc_Prov_Public_Key: \n' + Calc_Prov_Public_Key.toString('hex'));
        }
        //
        console.log('computeSecret');

        var PubKey = Buffer.alloc(65);
        PubKey[0] = 0x04 //Tag PubKey
        PubKey.fill(Device_Public_Key, 1);

        var Calc_ProvEDCHSecret = ProvKeyObj.computeSecret(PubKey);
        console.log('Calc_ProvEDCHSecret : ' + Calc_ProvEDCHSecret.toString('hex'));

        //Test Calc_ProvEDCHSecret
        if (Buffer.compare(Calc_ProvEDCHSecret, Prov_ECDH) != 0) {
            console.log('Error : Calc_ProvEDCHSecret is diff! ');
            return;
        } else {
            console.log('Calc_ProvEDCHSecret : OK');
            console.log('Calc_ProvEDCHSecret: \n' + Calc_ProvEDCHSecret.toString('hex'));
        }

};

test.Confirmation = function() {

        /***************************************************/
        //8.7.8 PB-ADV Provisioning Confirmation (Provisioner)
        const InvitePDUValue = '00';
        const CapabilitiesPDUValue = '0100010000000000000000';
        const StartPDUValue = '0000000000';
        const ProvisionerPublicKey = '2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f';
        const DevicePublicKey = 'f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279';
        const ConfirmationInputs = '00010001000000000000000000000000002c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4ff465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279';
        const ConfirmationSalt = '5faabe187337c71cc6c973369dcaa79a';
        const ECDHSecret = 'ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69';
        const ConfirmationKey = 'e31fe046c68ec339c425fc6629f0336f';
        const RandomProvisioner = '8b19ac31d58b124c946209b5db1021b9';
        const AuthValue = '00000000000000000000000000000000';
        const Confirmation = 'b38a114dfdca1fe153bd2c1e0dc46ac2';


        //Calc_ConfirmationInputs
        var Calc_ConfirmationInputs = new Uint8Array(1 + 11 + 5 + 64 + 64);
        Calc_ConfirmationInputs.set(new Uint8Array(utils.hexToBytes(InvitePDUValue)), 0); //size 1
        Calc_ConfirmationInputs.set(new Uint8Array(utils.hexToBytes(CapabilitiesPDUValue)), 1); //size 11
        Calc_ConfirmationInputs.set(new Uint8Array(utils.hexToBytes(StartPDUValue)), 12);
        Calc_ConfirmationInputs.set(new Uint8Array(utils.hexToBytes(ProvisionerPublicKey)), 17);
        Calc_ConfirmationInputs.set(new Uint8Array(utils.hexToBytes(DevicePublicKey)), 81);

        var Calc_ConfirmationInputsHex = utils.bytesToHex(Calc_ConfirmationInputs);
        console.log('Calc_ConfirmationInputsHex len: ' + Calc_ConfirmationInputs.length);
        console.log('Calc_ConfirmationInputsHex: ' + Calc_ConfirmationInputsHex);

        //Test ConfirmationInputs
        if (Calc_ConfirmationInputsHex != ConfirmationInputs) {
            console.log('Error : Calc_ConfirmationInputs is diff! ');
            return;
        } else {
            console.log('Calc_ConfirmationInputs : OK');
            console.log('Calc_ConfirmationInputs: \n' + Calc_ConfirmationInputsHex);
        }

        var Calc_ConfirmationSaltHex = crypto.s1(Calc_ConfirmationInputsHex);

        //Test Calc_ConfirmationSalt
        if (Calc_ConfirmationSaltHex != ConfirmationSalt) {
            console.log('Error : Calc_ConfirmationSalt is diff! ');
            console.log('Calc_ConfirmationSaltHex: \n' + Calc_ConfirmationSaltHex);
            console.log('ConfirmationSalt: \n' + ConfirmationSalt);
            return;
        } else {
            console.log('Calc_ConfirmationSaltHex : OK');
            console.log('Calc_ConfirmationSaltHex: \n' + Calc_ConfirmationSaltHex);
        }

        var Calc_ConfirmationKeyHex = crypto.k1(ECDHSecret, Calc_ConfirmationSaltHex, 'prck');
        //Test Calc_ConfirmationKey
        if (Calc_ConfirmationKeyHex != ConfirmationKey){
            console.log('Error : Calc_ConfirmationKey is diff! ');
            console.log('Calc_ConfirmationKeyHex: \n' + Calc_ConfirmationKeyHex);
            console.log('ConfirmationKey: \n' + ConfirmationKey);
            return;
        } else {
            console.log('Calc_ConfirmationKey : OK');
            console.log('Calc_ConfirmationKey: \n' + Calc_ConfirmationKeyHex);
        }


        var message = RandomProvisioner + AuthValue;
        console.log('message: ' + message);

        //Calc_ConfirmationProvisioner
        var Calc_ConfirmationProvisioner = crypto.getAesCmac(Calc_ConfirmationKeyHex, message );
        var Calc_ConfirmationProvisionerHex = Calc_ConfirmationProvisioner.toString();
        //Test Calc_ConfirmationProvisioner
        if (Calc_ConfirmationProvisioner != Confirmation) {
            console.log('Error : Calc_ConfirmationProvisioner is diff! ');
            console.log('Calc_ConfirmationProvisioner: \n' + Calc_ConfirmationProvisionerHex);
            console.log('Confirmation: \n' + Confirmation);
            return;
        } else {
            console.log('Calc_ConfirmationProvisioner : OK');
            console.log('Calc_ConfirmationProvisionerHex: \n' + Calc_ConfirmationProvisionerHex);
        }

        /******************************************************* */
        //5.4.2.5 Distribution of provisioning data

        //var aesCCM = require('node-aes-ccm').aesCCM;
        //var aaa = aesCCM()





        console.log('END test');
        return;
    };
