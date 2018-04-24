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
        this.OOBhexBuffer;

        //Random
        this.Prov_RandomBuff;
        this.Dev_RandomBuff;
    };

    hex2Arr (str){
        if (!str) {
            return new Uint8Array()
        }
        const arr = []
        for (let i = 0, len = str.length; i < len; i+=2) {
            arr.push(parseInt(str.substr(i, 2), 16))
        }
        return new Uint8Array(arr)
    }

    buf2Hex (buf){
        return Array.from(new Uint8Array(buf))
            .map(x => ('00' + x.toString(16)).slice(-2))
            .join('')
    }



    GetPublic() {
        //
        return this.ProvKey.getPublicKey();

    };

    ComputeSecret() {
        //
        this.DevPubKey;
        var view = new Uint8Array(this.DevPubKey);
        console.log('this.DevPubKey : ' + view.toString());
        // /this.ProvEDCHSecret = this.ProvKey.computeSecret(this.DevPubKey);
        //this.ProvEDCHSecret = window.crypto.subtle. .computeSecret(this.DevPubKey);

        // import Alice's public key
        window.crypto.subtle.importKey(
          'raw',
          this.DevPubKey,
          {
            name: 'ECDH',
            namedCurve: 'P-256'
          },
          true,
          [])
          .then(Dev_KeyImported => {
            // use Alice's imported public key and
            // Bob's private key to compute the shared secret
            return window.crypto.subtle.deriveBits(
              {
                name: 'ECDH',
                namedCurve: 'P-256',
                public: Dev_KeyImported
              },
              this.ProvKey.privateKey,
              256)
            })
            .then(sharedSecret => {
              const sharedSecretHex = buf2Hex(sharedSecret)
              console.log(`sharedSecret: ${sharedSecretHex}`)
            })
            .catch(err => {
              console.log(err)
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
        const crypto = require('crypto');
        console.log('CreateRandomProvisionner :');

        this.Prov_RandomBuff = crypto.randomBytes(16);
        console.log('this.Prov_RandomBuff: ' + this.Prov_RandomBuff.toString('hex'));
        return;
    };


    CreateConfirmationKey(ConfirmationInputs) {
        console.log('CreateConfirmationKey :');

        var ConfirmationSalt = this.AES_CMAC_s1(ConfirmationInputs);
        this.ConfirmationKey = this.AES_CMAC_k1(this.ProvEDCHSecret, ConfirmationSalt, 'prck');
        console.log('this.ConfirmationKey : ' + this.ConfirmationKey.toString('hex'));

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

        const OOBhexstringof16B = this.FormatNumberLength(OOBhexstring, 32);
        console.log('OOBhexstringof16B : ' + OOBhexstringof16B + ' len: ' + OOBhexstringof16B.length);

        this.OOBhexBuffer = new Buffer(OOBhexstringof16B, 'hex');
        console.log('this.OOBhexBuffer : ' + this.OOBhexBuffer.toString('hex') );
        return;
    };

    ConfirmationProvisioner() {
        var aesCmac = require('node-aes-cmac').aesCmac;

        console.log('ConfirmationProvisioner');

        var message = Buffer.alloc(16 + 16, 0);
        message.fill(this.Prov_RandomBuff, 0);
        message.fill(this.OOBhexBuffer, 16);

        console.log('message: ' + message.toString('hex'));

        var options = { returnAsBuffer: true };
        var ConfirmationProvisioner = aesCmac(this.ConfirmationKey, message, options);

        console.log('ConfirmationProvisioner: ' + ConfirmationProvisioner.toString('hex'));
        return ConfirmationProvisioner;
    };

    ConfirmationDevice() {
        var aesCmac = require('node-aes-cmac').aesCmac;

        console.log('ConfirmationDevice');

        var message = Buffer.alloc(16 + 16, 0);
        message.fill(this.Dev_RandomBuff, 0);
        message.fill(this.OOBhexBuffer, 16);

        console.log('message: ' + message.toString('hex'));

        var options = { returnAsBuffer: true };
        var ConfirmationDevice = aesCmac(this.ConfirmationKey, message, options);

        console.log('ConfirmationDevice: ' + ConfirmationDevice.toString('hex'));
        return ConfirmationDevice;
    };


    AES_CMAC_s1(M) {
        console.log('AES_CMAC_s1');

        var aesCmac = require('node-aes-cmac').aesCmac;
        const bufferKey = Buffer.alloc(16, 0);

        var options = { returnAsBuffer: true };
        var cmac = aesCmac(bufferKey, M, options);

        console.log(M);
        console.log(cmac.toString('hex'));
        return cmac;
    };

    AES_CMAC_k1(N, SALT, P) {
        console.log('AES_CMAC_k1');

        var aesCmac = require('node-aes-cmac').aesCmac;

        console.log(N.toString('hex'));
        console.log(SALT.toString('hex'));
        console.log(P.toString('hex'));

        var options = { returnAsBuffer: true };
        var T = aesCmac(SALT, N, options);
        var cmac = aesCmac(T, P, options);

        console.log(T.toString('hex'));

        console.log(cmac.toString('hex'));
        return cmac;
    };



};



//module.exports = Ecc;
