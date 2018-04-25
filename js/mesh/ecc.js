// var crypto = require("crypto");
// var eccrypto = require("eccrypto");


class Ecc {
    constructor() {
        console.log('constructor Ecc');
        console.log('generateKeys');

        // generate Prov's private and public key
        window.crypto.subtle.generateKey(
          {
            name: 'ECDH',
            namedCurve: 'P-256'
          },
          false, // no need to make Bob's private key exportable
          ['deriveKey', 'deriveBits'])
          .then(Key => {
            this.ProvKey = Key
            // export Prov's public key
            return window.crypto.subtle.exportKey(
              'raw', Key.publicKey
            )
          })
          .then(ProvPublicKeyExported => {
            this.ProvPublicKey = ProvPublicKeyExported;

//            this.ProvPublicKeyHex = this.buf2Hex(ProvPublicKeyExported)
            // display and send Bob's public key to Alice
          //  console.log(`Prov's publicKey: ${ProvPublicKeyExported}`)
            var view = new Uint8Array(this.ProvPublicKey);
            //console.log(`Prov's publicKey: ` + view.toString('hex'));
            console.log(`Prov's publicKey: ` + view.toString());

          })
          .catch(err => {
                console.log(err)
          })

        //ECDH secret
        this.ProvEDCHSecret;

        //Device Key
        this.DevPubKey;

        //Other
        this.ConfirmationKey;
        this.OOBhexstring;

        //Random
        this.Prov_Random;
        this.Dev_RandomBuff;
    };





    GetPublic() {
        //
        return this.ProvKey.getPublicKey();

    };

    ComputeSecret() {

      return new Promise((resolve, reject) => {

        //
        this.DevPubKey;
        var view = new Uint8Array(this.DevPubKey);
        console.log('this.DevPubKey : ' + view.toString());

        // import Device's public key
        return window.crypto.subtle.importKey(
          'raw',
          this.DevPubKey,
          {
            name: 'ECDH',
            namedCurve: 'P-256'
          },
          true,
          [])
          .then(Dev_KeyImported => {
            // use Device's imported public key and
            // Prov's private key to compute the shared secret
            return window.crypto.subtle.deriveBits(
              {
                name: 'ECDH',
                namedCurve: 'P-256',
                public: Dev_KeyImported
              },
              this.ProvKey.privateKey,
              256);
            })
            .then(sharedSecret => {
              this.ProvEDCHSecret = sharedSecret;
              console.log('this.ProvEDCHSecret :' + new Uint8Array(sharedSecret).toString());

              resolve();
              return;
            })
            .catch(err => {
              console.log(err)
              reject(err);
            });
            console.log('ComputeSecret Finished\n\n');
          });
        };


    AES_CMAC_test() {
        const crypto = require('crypto');

        const ciphers = crypto.getCiphers();
        console.log(ciphers);

        //return;
        var plaintext = 'test';
        const key = Buffer.alloc(16, 0);
        const encipher = crypto.createCipher('aes-128-ccm', key);

        encipher.setAutoPadding(true);
        var ciphertext = Buffer.concat([encipher.update(plaintext), encipher.final()]);
        console.log(ciphertext.toString());
    };



    test() {
        console.log('START Ecc function implementation test');
        /***************************************************/

        // this.AES_CMAC_s1('test');

        // var N = new Buffer('3216d1509884b533248541792b877f98', 'hex');
        // var SALT = new Buffer('2ba14ffa0df84a2831938d57d276cab4', 'hex');
        // var P = new Buffer('5a09d60797eeb4478aada59db3352a0d', 'hex');

        // this.AES_CMAC_k1(N, SALT, P);

        /***************************************************/
        //Test key build and EDCH calc
        //See 8.7 PB-ADV provisioning sample data

        //        const Prov_Private_Key  = new Buffer('06a516693c9aa31a6084545d0c5db641b48572b97203ddffb7ac73f7d0457663', 'hex') ;
        const Prov_Private_Key = '06a516693c9aa31a6084545d0c5db641b48572b97203ddffb7ac73f7d0457663';

        const Prov_Public_Key   = new Buffer('2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f', 'hex') ;
        //const Prov_Public_Key = '2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f';

        //        const Device_Private_Key= new Buffer('529aa0670d72cd6497502ed473502b037e8803b5c60829a5a3caa219505530ba', 'hex') ;
        const Device_Private_Key = '529aa0670d72cd6497502ed473502b037e8803b5c60829a5a3caa219505530ba';

        const Device_Public_Key = new Buffer('f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279', 'hex');
        //        const Device_Public_Key = 'f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279';

        const Prov_ECDH = new Buffer('ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69', 'hex');
        const Device_ECDH = new Buffer('ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69', 'hex');
        const Prov_Random = new Buffer('8b19ac31d58b124c946209b5db1021b9', 'hex');
        const Device_Random = new Buffer('55a2a2bca04cd32ff6f346bd0a0c1a3a', 'hex');

        const crypto = require('crypto');
        var ProvKeyObj = crypto.createECDH('prime256v1');

        // ProvKey uses a newly generated cryptographically strong
        // pseudorandom key pair
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



        /***************************************************/
        //8.7.8 PB-ADV Provisioning Confirmation (Provisioner)
        const InvitePDUValue = new Buffer('00', 'hex');
        const CapabilitiesPDUValue = new Buffer('0100010000000000000000', 'hex');
        const StartPDUValue = new Buffer('0000000000', 'hex');
        const ProvisionerPublicKey = new Buffer('2c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4f', 'hex');
        const DevicePublicKey = new Buffer('f465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279', 'hex');
        const ConfirmationInputs = new Buffer('00010001000000000000000000000000002c31a47b5779809ef44cb5eaaf5c3e43d5f8faad4a8794cb987e9b03745c78dd919512183898dfbecd52e2408e43871fd021109117bd3ed4eaf8437743715d4ff465e43ff23d3f1b9dc7dfc04da8758184dbc966204796eccf0d6cf5e16500cc0201d048bcbbd899eeefc424164e33c201c2b010ca6b4d43a8a155cad8ecb279', 'hex');
        const ConfirmationSalt = new Buffer('5faabe187337c71cc6c973369dcaa79a', 'hex');
        const ECDHSecret = new Buffer('ab85843a2f6d883f62e5684b38e307335fe6e1945ecd19604105c6f23221eb69', 'hex');
        const ConfirmationKey = new Buffer('e31fe046c68ec339c425fc6629f0336f', 'hex');
        const RandomProvisioner = new Buffer('8b19ac31d58b124c946209b5db1021b9', 'hex');
        const AuthValue = new Buffer('00000000000000000000000000000000', 'hex');
        const Confirmation = new Buffer('b38a114dfdca1fe153bd2c1e0dc46ac2', 'hex');


        //Calc_ConfirmationInputs
        var Calc_ConfirmationInputs = Buffer.alloc(1 + 11 + 5 + 64 + 64);
        Calc_ConfirmationInputs.fill(InvitePDUValue, 0); //size 1
        Calc_ConfirmationInputs.fill(CapabilitiesPDUValue, 1); //size 11
        Calc_ConfirmationInputs.fill(StartPDUValue, 1 + 11);
        Calc_ConfirmationInputs.fill(ProvisionerPublicKey, 1 + 11 + 5);
        Calc_ConfirmationInputs.fill(DevicePublicKey, 1 + 11 + 5 + 64);

        //Test ConfirmationInputs
        if (Buffer.compare(Calc_ConfirmationInputs, ConfirmationInputs) != 0) {
            console.log('Error : Calc_ConfirmationInputs is diff! ');
            return;
        } else {
            console.log('Calc_ConfirmationInputs : OK');
            console.log('Calc_ConfirmationInputs: \n' + Calc_ConfirmationInputs.toString('hex'));
        }

        var Calc_ConfirmationSalt = this.AES_CMAC_s1(Calc_ConfirmationInputs);
        //Test Calc_ConfirmationSalt
        if (Buffer.compare(Calc_ConfirmationSalt, ConfirmationSalt) != 0) {
            console.log('Error : Calc_ConfirmationSalt is diff! ');
            return;
        } else {
            console.log('Calc_ConfirmationSalt : OK');
            console.log('Calc_ConfirmationSalt: \n' + Calc_ConfirmationSalt.toString('hex'));
        }

        var Calc_ConfirmationKey = this.AES_CMAC_k1(Calc_ProvEDCHSecret, Calc_ConfirmationSalt, 'prck');
        //Test Calc_ConfirmationKey
        if (Buffer.compare(Calc_ConfirmationKey, ConfirmationKey) != 0) {
            console.log('Error : Calc_ConfirmationKey is diff! ');
            return;
        } else {
            console.log('Calc_ConfirmationKey : OK');
            console.log('Calc_ConfirmationKey: \n' + Calc_ConfirmationKey.toString('hex'));
        }

        var message = Buffer.alloc(16 + 16, 0);
        message.fill(RandomProvisioner, 0);
        message.fill(AuthValue, 16);

        //Calc_ConfirmationProvisioner
        var aesCmac = require('node-aes-cmac').aesCmac;
        var options = { returnAsBuffer: true };
        var Calc_ConfirmationProvisioner = aesCmac(Calc_ConfirmationKey, message, options);
        //Test Calc_ConfirmationProvisioner
        if (Buffer.compare(Calc_ConfirmationProvisioner, Confirmation) != 0) {
            console.log('Error : Calc_ConfirmationProvisioner is diff! ');
            console.log('Calc_ConfirmationProvisioner: \n' + Calc_ConfirmationProvisioner.toString('hex'));
            console.log('Confirmation: \n' + Confirmation.toString('hex'));
            return;
        } else {
            console.log('Calc_ConfirmationProvisioner : OK');
            console.log('Calc_ConfirmationProvisioner: \n' + Calc_ConfirmationProvisioner.toString('hex'));
        }

        /******************************************************* */
        //5.4.2.5 Distribution of provisioning data

        var aesCCM = require('node-aes-ccm').aesCCM;
        var aaa = aesCCM()





        console.log('END test');
        return;
    };


    CreateRandomProvisionner() {
        //const crypto = require('crypto');
        console.log('CreateRandomProvisionner :');
        var random = new Uint8Array(16);
        window.crypto.getRandomValues(random);
        this.Prov_Random = utils.bytesToHex(random);
        console.log('this.Prov_Random: ' + this.Prov_Random);
        return;
    };


    CreateConfirmationKey(ConfirmationInputs) {
        console.log('CreateConfirmationKey :');
        var M = utils.bytesToHex(ConfirmationInputs);
        var SALT = crypto.s1(M);
        var N = utils.bytesToHex(new Uint8Array(this.ProvEDCHSecret));

        this.ConfirmationKey = crypto.k1(N, SALT, 'prck');
        console.log('this.ConfirmationKey : ' + this.ConfirmationKey);
        return;
    };


    FormatNumberLength(num, length) {
        //var r = num;
        while (num.length < length) {
            num = "0" + num;
        }
        return num;
    };

    Set_AuthValue(OOB) {
        console.log('this.OOB : ' + OOB);
        var OOBhexstring = OOB.toString(16);
        console.log('OOBhexstring : ' + OOBhexstring + ' len: ' + OOBhexstring.length);

        this.OOBhexstring = this.FormatNumberLength(OOBhexstring, 32);
        console.log('this.OOBhexstring : ' + this.OOBhexstring + ' len: ' + this.OOBhexstring.length);
        return;
    };

    ConfirmationProvisioner() {
        console.log('ConfirmationProvisioner');
        var message = this.Prov_Random + this.OOBhexstring;
        console.log('message: ' + message);
        var ConfirmationProvisioner = crypto.getAesCmac(this.ConfirmationKey, message);
        console.log('ConfirmationProvisioner: ' + ConfirmationProvisioner.toString());
        return ConfirmationProvisioner.toString();
    };

    ConfirmationDevice() {
        console.log('ConfirmationDevice');
        var message = this.Dev_RandomBuff + this.OOBhexstring;
        console.log('message: ' + message);
        var ConfirmationDevice = crypto.getAesCmac(this.ConfirmationKey, message);
        console.log('ConfirmationDevice: ' + ConfirmationDevice.toString());
        return ConfirmationDevice.toString();
    };


    // AES_CMAC_s1(M) {
    //     console.log('AES_CMAC_s1');
    //
    //     var aesCmac = require('node-aes-cmac').aesCmac;
    //     const bufferKey = Buffer.alloc(16, 0);
    //
    //     var options = { returnAsBuffer: true };
    //     var cmac = aesCmac(bufferKey, M, options);
    //
    //     console.log(M);
    //     console.log(cmac.toString('hex'));
    //     return cmac;
    // };
    //
    // AES_CMAC_k1(N, SALT, P) {
    //     console.log('AES_CMAC_k1');
    //
    //     var aesCmac = require('node-aes-cmac').aesCmac;
    //
    //     console.log(N.toString('hex'));
    //     console.log(SALT.toString('hex'));
    //     console.log(P.toString('hex'));
    //
    //     var options = { returnAsBuffer: true };
    //     var T = aesCmac(SALT, N, options);
    //     var cmac = aesCmac(T, P, options);
    //
    //     console.log(T.toString('hex'));
    //
    //     console.log(cmac.toString('hex'));
    //     return cmac;
    // };



};

CryptoJS.enc.u8array = {
        /**
         * Converts a word array to a Uint8Array.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {Uint8Array} The Uint8Array.
         *
         * @static
         *
         * @example
         *
         *     var u8arr = CryptoJS.enc.u8array.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var u8 = new Uint8Array(sigBytes);
            for (var i = 0; i < sigBytes; i++) {
                var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                u8[i]=byte;
            }

            return u8;
        },

        /**
         * Converts a Uint8Array to a word array.
         *
         * @param {string} u8Str The Uint8Array.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.u8array.parse(u8arr);
         */
        parse: function (u8arr) {
            // Shortcut
            var len = u8arr.length;

            // Convert
            var words = [];
            for (var i = 0; i < len; i++) {
                words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
            }

            return CryptoJS.lib.WordArray.create(words, len);
        }
    };

//module.exports = Ecc;
