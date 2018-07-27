


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
        this.Dev_Random;
        //Salt
        this.ConfirmationSalt;

        //
        this.ProvisioningSalt;
        this.SessionKey;
        this.SessionNonce;
        //
        this.DeviceKey
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
          });
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
        this.ConfirmationSalt = crypto.s1(M);
        var N = this.ProvEDCHSecret;

        this.ConfirmationKey = crypto.k1(N, this.ConfirmationSalt, 'prck');
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
        var OOBhexstring = "";

        if(OOB){
          OOBhexstring = OOB.toString(16);
        }

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
        var message = this.Dev_Random + this.OOBhexstring;
        console.log('message: ' + message);
        var ConfirmationDevice = crypto.getAesCmac(this.ConfirmationKey, message);
        console.log('ConfirmationDevice: ' + ConfirmationDevice.toString());
        return ConfirmationDevice.toString();
    };


    Create_Session_Key(){
      //Session key
      //The Session key shall be derived using the formula:
      //ProvisioningSalt = s1(ConfirmationSalt || RandomProvisioner || RandomDevice)
      //SessionKey = k1(ECDHSecret, ProvisioningSalt, “prsk”)
      this.ProvisioningSalt = crypto.s1(this.ConfirmationSalt  + this.Prov_Random + this.Dev_Random);
      this.SessionKey = crypto.k1(this.ProvEDCHSecret, this.ProvisioningSalt, 'prsk');
      console.log('ProvisioningSalt: ' + this.ProvisioningSalt );
    };

    Create_Nonce(){
      //nonce
      //The nonce shall be the 13 least significant octets of:
      //SessionNonce = k1(ECDHSecret, ProvisioningSalt, “prsn”)
      var hex = crypto.k1(this.ProvEDCHSecret, this.ProvisioningSalt , 'prsn');
      this.SessionNonce  = hex.substring((hex.length - 13*2), hex.length);
      console.log('SessionNonce: ' + this.SessionNonce );
    };

    Encrypt_Provision_DATA(Provisioning_Data){
      // Encrypted Provisioning Data, Provisioning Data MIC = AES-CCM (SessionKey, SessionNonce,
      // Provisioning Data)
      var u8_key = utils.hexToU8A(this.SessionKey);
      var u8_nonce = utils.hexToU8A(this.SessionNonce);
      var u8_payload = utils.hexToU8A(Provisioning_Data);
      // var result = {
      //   EncProvisionDATA: 0,
      //   TransMIC: 0
      // };
      var auth_enc_DATA = asmCrypto.AES_CCM.encrypt(u8_payload, u8_key, u8_nonce, new Uint8Array([]), 8);
      var hex = utils.u8AToHexString(auth_enc_DATA);
      // result.EncProvisionDATA = hex.substring(0, hex.length - 8);
      // result.TransMIC = hex.substring(hex.length - 8, hex.length);
      // return result;
      return hex;
    };

    Create_Device_Key(){
      //Device key
      //3.8.6.1 Device key
      //DevKey = k1(ECDHSecret, ProvisioningSalt, “prdk”)
      this.DeviceKey = crypto.k1(this.ProvEDCHSecret, this.ProvisioningSalt, 'prdk');
      console.log('DeviceKey: ' + this.DeviceKey );
    };
};
