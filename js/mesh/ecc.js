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
            this.ProvPublicKey = utils.bytesToHex(new Uint8Array(ProvPublicKeyExported));
            console.log(`this.ProvPublicKey: ` + this.ProvPublicKey);
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


    ComputeSecret() {

      return new Promise((resolve, reject) => {

        //
      //  var view = new Uint8Array(this.DevPubKey);
        console.log('this.DevPubKey : ' + this.DevPubKey);
        var key = new Uint8Array(utils.hexToBytes(this.DevPubKey));

        // import Device's public key
        return window.crypto.subtle.importKey(
          'raw',
          key.buffer,
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
              this.ProvEDCHSecret = utils.bytesToHex(new Uint8Array(sharedSecret));
              console.log('this.ProvEDCHSecret :' + this.ProvEDCHSecret);

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
        var M = ConfirmationInputs;
        var SALT = crypto.s1(M);
        var N = this.ProvEDCHSecret;

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
