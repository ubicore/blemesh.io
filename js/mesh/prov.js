/*
.
*/

// /var ecc = require("./ecc.js");



const PROXY_PROVISIONING_PDU = 0x03;



const PROV_INVITE = 0x00;
const PROV_CAPS = 0x01;
const PROV_START = 0x02;
const PROV_PUB_KEY = 0x03;
const PROV_INP_CMPLT = 0x04;
const PROV_CONFIRM = 0x05;
const PROV_RANDOM = 0x06;
const PROV_DATA = 0x07;
const PROV_COMPLETE = 0x08;
const PROV_FAILED = 0x09;

const PROV_NO_OOB = 0;
const PROV_STATIC_OOB = 1;
const PROV_OUTPUT_OOB = 2;
const PROV_INPUT_OOB = 3;

const PROV_ERR_INVALID_PDU = 0x01;
const PROV_ERR_INVALID_FORMAT = 0x02;
const PROV_ERR_UNEXPECTED_PDU = 0x03;
const PROV_ERR_CONFIRM_FAILED = 0x04;
const PROV_ERR_INSUF_RESOURCE = 0x05;
const PROV_ERR_DECRYPT_FAILED = 0x06;
const PROV_ERR_UNEXPECTED_ERR = 0x07;
const PROV_ERR_CANT_ASSIGN_ADDR = 0x08;



const PROVISIONING_CAPABILITIES_PARAM_SIZE = 11;


//
// // use it as module
// var Enum = require('enum');
// //Output OOB
// var Output_OOB_Action = new Enum([
//     'Output_OOB_Action_Blink',
//     'Output_OOB_Action_Beep',
//     'Output_OOB_Action_Vibrate',
//     'Output_OOB_Action_Output_Numeric',
//     'Output_OOB_Action_Output_Alphanumeric',
// ]);
//
//
// //Input OOB
// var Input_OOB_Action = new Enum([
//     'Input_OOB_Action_Push',
//     'Input_OOB_Action_Twist',
//     'Input_OOB_Action_Input_Number',
//     'Input_OOB_Action_Input_Alphanumeric',
// ]);

//
const PDU_Parameters_Offset = 1;

const PROV_Attention_Duration = 0x10;



//const ProxyPDU = require("./ProxyPDU.js");

class Conf_Caps {
    constructor() {
        this.num_ele = 0;
        this.algorithms = 0;
        this.pub_type = 0;
        this.static_type = 0;
        this.output_size = 0;
        this.output_action = 0;
        this.input_size = 0;
        this.input_action = 0;
    };
};

class Prov_Start {
    constructor() {
        this.algorithm = 0;
        this.pub_key = 0;
        this.auth_method = 0;
        this.auth_action = 0;
        this.auth_size = 0;
    };
};


class Provisionner {
    constructor() {
        // this.PDU = [];
        this.ProxyPDU_1 = new ProxyPDU;
        this.in;
        this.Out;
        this.ProvisionFinished = function () { };
        this.ProvisionFailed = function () { };
        this.CurrentStepProcess = function () { };

        this.CurrentStepResolve = function () { };
        this.CurrentStepReject = function () { };

        //Conf in
        this.IN_Conf_Caps = new Conf_Caps();
        this.Prov_Start = new Prov_Start();
        //
        this.PDU_Invite;
        this.PDU_Start;
        this.ProvisioningCapabilitiesPDUValue;


        //Prov_PublicKey
        this.Ecc_1 = new Ecc;

        this.Dev_Confirmation;
    };



    OUT_Capabilities(PDU) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        //Check PDU Type
        var PDU_Type = new Uint8Array(PDU)[0];
        if (PDU_Type != PROV_CAPS) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }
        //Get PDU Parameters
        //var PDU_Parameter = PDU.subarray(PDU_Parameters_Offset);
        //this.ProvisioningCapabilitiesPDUValue = Buffer.from(PDU_Parameter);
      //  this.ProvisioningCapabilitiesPDUValue = PDU.slice(PDU_Parameters_Offset);
      //  this.ProvisioningCapabilitiesPDUValue = new Uint8Array(PROVISIONING_CAPABILITIES_PARAM_SIZE);
        //console.log('PDU : ' + PDU.length);
        this.ProvisioningCapabilitiesPDUValue = PDU.slice(1);;
      //  this.ProvisioningCapabilitiesPDUValue.set(PDU.slice(1), 0);
        console.log('ProvisioningCapabilitiesPDUValue : ' + new Uint8Array(this.ProvisioningCapabilitiesPDUValue).toString(16));

        var view = new DataView(this.ProvisioningCapabilitiesPDUValue);
        //Save caps value
        this.IN_Conf_Caps.num_ele = view.getUint8(0);
        this.IN_Conf_Caps.algorithms = view.getUint16(1);
        this.IN_Conf_Caps.pub_type = view.getUint8(3);
        this.IN_Conf_Caps.static_type = view.getUint8(4);
        this.IN_Conf_Caps.output_size = view.getUint8(5);
        this.IN_Conf_Caps.output_action = view.getUint16(6);
        this.IN_Conf_Caps.input_size = view.getUint8(8);
        this.IN_Conf_Caps.input_action = view.getUint16(9);

        console.log('IN_Conf_Caps : ' + Object.keys(this.IN_Conf_Caps));
        console.log('IN_Conf_Caps : ' + Object.values(this.IN_Conf_Caps));

        if (
            (this.IN_Conf_Caps.num_ele == 0)
            || (this.IN_Conf_Caps.algorithms != 1)
            //  || (this.IN_Conf_Caps.pub_type != 1)
            // || (this.IN_Conf_Caps.static_type != 1)
        ) {
            this.CurrentStepReject("error : Invalid PDU")
            return;
        }

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_Public_Key(PDU) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_PUB_KEY) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        // var Buffer = new ArrayBuffer(1 + 64);
        // var Buffer_view = new Uint8Array(Buffer);
        // Buffer_view[0] = 0x04; //PubKey Tag uncompressed = 0x04
        // Buffer_view.set(PDU_view.slice(1), 1);
        var key =  PDU_view.slice(1);//skip PDU tag
        this.Ecc_1.DevPubKey = '04'+ utils.bytesToHex(key);

        console.log('this.Ecc_1.DevPubKey : ' + this.Ecc_1.DevPubKey);

        // if (this.Dev_PublicKey.length != 65) {
        //
        //     this.CurrentStepReject("error : Invalid Dev_PublicKey")
        //     return;
        // }

        //Compute ECDH secret
        this.Ecc_1.ComputeSecret()
        .then(() => {
                  //Step Finished
                  this.CurrentStepResolve();
        })
    };

    OUT_Confirmation(PDU) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_CONFIRM) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        // this.Dev_Confirmation = new ArrayBuffer(16);
        // this.Dev_Confirmation.fill(PDU.subarray(PDU_Parameters_Offset));
        var Dev_Confirmation = PDU_view.slice(PDU_Parameters_Offset);
        this.Dev_Confirmation = utils.bytesToHex(Dev_Confirmation);
        console.log('this.DevConfirmation : ' + this.Dev_Confirmation);

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_PROV_INPUT_OOB(PDU) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        //Check PDU Type
        var PDU_Type = PDU[0];
        if (PDU_Type != PROV_INP_CMPLT) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        console.log('Get a PROV_INP_CMPLT PDU');

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_PROV_RANDOM(PDU) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        //Check PDU Type
        var PDU_Type = PDU[0];
        if (PDU_Type != PROV_RANDOM) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        this.Ecc_1.Dev_RandomBuff = new ArrayBuffer(16);
        this.Ecc_1.Dev_RandomBuff.fill(PDU.subarray(PDU_Parameters_Offset));

        console.log('this.Ecc_1.Dev_RandomBuff : ' + this.Ecc_1.Dev_RandomBuff.toString('hex'));


        console.log('Get a PROV_INP_CMPLT PDU');

        //Step Finished
        this.CurrentStepResolve();
    };



    IN_Invite() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_Capabilities;

            var index = 0
            //this.PDU_Invite = new ArrayBuffer(1 + 1 + 1);
  //          this.PDU_Invite = new ArrayBuffer(1 + 1 + 1);
//            var PDU = new Uint8Array(this.PDU_Invite);
            var PDU = new Uint8Array(1 + 1 + 1);

            //Fill PDU_Invite
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_INVITE;
            //PDU_Invite Data
            PDU[index++] = PROV_Attention_Duration;


            console.log('Invite PDU ' + PDU);
            console.log('Invite PDU ' + PDU.length);
            this.PDU_Invite = PDU;

            this.In.writeValue(PDU)
                .then(() => {
                })
                .catch(error => {
                    reject(`writeValue error: ${error}`);
                });
        });
    };

    Get_highest_bit_u16(value) {
        var set = 0;

        //
        for (var i = 0; i < 16; i++) {
            if (value & (1 << i)) set = (1 << i);
        }
        return set;
    }




    //Output OOB
    Select_Ouput_OOB() {
        var OOB = this.IN_Conf_Caps.output_action;

        console.log('Output_OOB_Action availables : ' + OOB);
//        console.log(Output_OOB_Action.get(OOB).value + '=> ' + Output_OOB_Action.get(OOB).key);

        var res = this.Get_highest_bit_u16(OOB);
        console.log('Output_OOB_Action select : ' + res);
//        console.log(Output_OOB_Action.get(res).value + '=> ' + Output_OOB_Action.get(res).key);

        var id = 0;
        while (res >>= 1) {
            id++;
        }
        console.log('Output_OOB_Action selected is number : ' + id);
        return id;
    }

    //Input OOB
    Select_Input_OOB() {
        var OOB = this.IN_Conf_Caps.input_action;

        console.log('Input_OOB_Action availables : ' + OOB);
        //console.log(Input_OOB_Action.get(OOB).value + '=> ' + Input_OOB_Action.get(OOB).key);

        var res = this.Get_highest_bit_u16(OOB);
        console.log('Input_OOB_Action select : ' + res);
        //console.log(Input_OOB_Action.get(res).value + '=> ' + Input_OOB_Action.get(res).key);

        return res;
    }

    //See 5.4.2 Provisioning behavior
    //And 5.4.2.3 Exchanging public keys
    IN_Start() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = null;

            this.Prov_Start.algorithm = 0; //FIPS P-256 Elliptic Curve
            this.Prov_Start.pub_key = 0; //No OOB Public Key is used

            //Select OOB Action
            if (this.IN_Conf_Caps.static_type) {
                this.Prov_Start.auth_method = PROV_STATIC_OOB; //Static OOB authentication is used
            } else if (this.IN_Conf_Caps.output_size > this.IN_Conf_Caps.input_size) {
                this.Prov_Start.auth_method = PROV_OUTPUT_OOB; //Output OOB authentication is used
                this.Prov_Start.auth_action = this.Select_Ouput_OOB();
                this.Prov_Start.auth_size = this.IN_Conf_Caps.output_size;
            } else if (this.IN_Conf_Caps.input_size > 0) {
                this.Prov_Start.auth_method = PROV_INPUT_OOB; //Input OOB authentication is used
                this.Prov_Start.auth_action = this.Select_Input_OOB();
                this.Prov_Start.auth_size = this.IN_Conf_Caps.input_size;
            } else {
                this.Prov_Start.auth_method = PROV_NO_OOB; //Input OOB authentication is used
                console.log('PROV_NO_OOB');
            }

            //Check
            if (this.Prov_Start.auth_size > 8) {
                this.CurrentStepReject("error : Prov_Start_1 ")
                return;
            }


            console.log(Object.keys(this.Prov_Start));
            console.log(Object.values(this.Prov_Start));

            var index = 0
            var PDU = new Uint8Array(1 + 1 + 5);

            //Fill PDU_Start
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_START;
            //PDU Start Data
            PDU[index++] = this.Prov_Start.algorithm;
            PDU[index++] = this.Prov_Start.pub_key;
            PDU[index++] = this.Prov_Start.auth_method;
            PDU[index++] = this.Prov_Start.auth_action;
            PDU[index++] = this.Prov_Start.auth_size;

            //PDU_Start.set (Object.values(Prov_Start_1), 1+1);

            console.log('Start PDU ' + PDU);
            console.log('Start PDU ' + PDU.length);
            this.PDU_Start = PDU;
            this.In.writeValue(PDU)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(`writeValue error: ${error}`);
                });

        });
    };


    copy_and_swap_PublicKey(PubKeyOUT, PubKeyIN) {
        //swap X from/to mesh order
        for (var i = 0; i <= 31; i++) {
            PubKeyOUT[i] = PubKeyIN[31 - i];
        }
        //swap Y from/to mesh order
        for (var i = 0; i <= 31; i++) {
            PubKeyOUT[i + 32] = PubKeyIN[32 + 31 - i];
        }
    };


    IN_Public_Key() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_Public_Key;

            var PDU = new Uint8Array(1 + 1 + 64);
            var index = 0
            //Fill PDU_Public_Key
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_PUB_KEY;

            var ProvPublicKey = utils.hexToBytes(this.Ecc_1.ProvPublicKey);
            console.log('this.Ecc_1.ProvPublicKey : ' + this.Ecc_1.ProvPublicKey);

            // const tmpKey = Buffer.from([0x3f, 0x76 , 0x78 , 0x89 , 0x14 , 0x7d , 0x27 , 0x90 , 0x83 , 0xd4 , 0xbf , 0xb7 , 0xd5 , 0xb0 , 0xbc , 0xac , 0x02 , 0x20 , 0x50 , 0xe6
            //     , 0xc3 , 0xc4 , 0x91 , 0xba , 0x27 , 0x43 , 0xf0 , 0xba , 0x97 , 0xdf , 0xfd , 0x4b , 0x0e , 0xb1 , 0x49 , 0x57 , 0x99 , 0x40 , 0xe9 , 0x5f , 0x04 , 0x9e ,
            //      0x81 , 0xc5 , 0x2e , 0x6c , 0x04 , 0x43 , 0x47 , 0xf5 , 0xaa , 0x0b , 0x70 , 0xd7 , 0xd4 , 0xe4 , 0x9e , 0x3a , 0x69 , 0x5b , 0xc3 , 0x63 , 0xbb , 0x96]);


            //PubKey is already recorded in Big endian
            //           //Swap the 256 bytes of the two half Public key parameters (X and Y) to mesh byte order
            //           var tmpKey = new ArrayBuffer(64);
            //           this.copy_and_swap_PublicKey(tmpKey, this.Prov_PublicKey.slice(1));//skip PubKeyTag
            //           var copied = tmpKey.copy(PDU_Public_Key, index, 0); //Copy to PDU parameters
          //  var copied = view.copy(PDU, index, 1); //Copy to PDU parameters
            PDU.set(ProvPublicKey.slice(1), index); //Skip key tag

            console.log('Public_Key PDU : ' + PDU);
            console.log('Public_Key PDU : ' + PDU.length);

            this.In.writeValue(PDU)
                .then(() => {
                })
                .catch(error => {
                    reject(`writeValue error: ${error}`);
                });

        });
    };


    IN_Confirmation() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_Confirmation;

            var PDU = new Uint8Array(1 + 1 + 16);
            var index = 0
            //Fill PDU_Public_Key
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_CONFIRM;

            var ConfirmationInputs = new Uint8Array(1 + 11 + 5 + 64 + 64);
            ConfirmationInputs.set(this.PDU_Invite.slice(2), 0); //size 1
            ConfirmationInputs.set(new Uint8Array(this.ProvisioningCapabilitiesPDUValue), 1); //size 11
            ConfirmationInputs.set(this.PDU_Start.slice(2), 12);
            var ProvPublicKey = utils.hexToBytes(this.Ecc_1.ProvPublicKey);
            ConfirmationInputs.set(ProvPublicKey.slice(1), 17);//Skip Tag
            var DevPubKey = utils.hexToBytes(this.Ecc_1.DevPubKey);
            ConfirmationInputs.set(DevPubKey.slice(1), 81);//Skip Tag
            var ConfirmationInputsHex = utils.bytesToHex(ConfirmationInputs);
            console.log('ConfirmationInputsHex len :' + ConfirmationInputs.length);
            console.log('ConfirmationInputsHex :' + ConfirmationInputsHex);

            this.Ecc_1.Set_AuthValue(this.OOB);
            this.Ecc_1.CreateRandomProvisionner();
            this.Ecc_1.CreateConfirmationKey(ConfirmationInputsHex);

            console.log('ConfirmationProvisioner =>');
            var ConfirmationProvisioner = this.Ecc_1.ConfirmationProvisioner();

            PDU.set(utils.hexToBytes(ConfirmationProvisioner), index);

            console.log('Confirmation PDU : ' + PDU);
            console.log('Confirmation PDU : ' + PDU.length);
            this.In.writeValue(PDU)
                .then(() => {
                })
                .catch(error => {
                    reject(`writeValue error: ${error}`);
                });
        });
    };

    IN_Random() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_PROV_RANDOM;

            var PDU = new Uint8Array(1 + 1 + 16);
            var index = 0
            //Fill PDU_Random
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_RANDOM;
            PDU.set(utils.hexToBytes(this.Ecc_1.Prov_Random), index);

            console.log('PDU_Random : ' + PDU);
            console.log('PDU_Random : ' + PDU.length);
            this.In.writeValue(PDU)
                .then(() => {
                })
                .catch(error => {
                    reject(`writeValue error: ${error}`);
                });
        });
    };
    CheckConfirmation() {
        return new Promise((resolve, reject) => {

            var Calc_ConfirmationDevice = this.Ecc_1.ConfirmationDevice();

            if (Calc_ConfirmationDevice != this.Dev_Confirmation) {
//            if (Buffer.compare(Calc_ConfirmationDevice, this.Dev_Confirmation) != 0) {
                console.log('Error : Calc_ConfirmationProvisioner is diff! ');
                console.log('Calc_ConfirmationDevice: \n' + Calc_ConfirmationDevice);
                console.log('this.Dev_Confirmation: \n' + this.Dev_Confirmation);
                reject();
                return;
            } else {
                console.log('Dev_Confirmation : OK');
                resolve();
            }
        });
    };

    Get_OOB_FromUser(resolve, reject) {
        console.log('Request OOB Number : ');
        app.showMessage("Request OOB Number :");

        var input = prompt("Please enter OOB Number", "------");
        if (isNaN(input)) {
          console.log('This is not a number');
          reject();
          return;
        }

        document.getElementById("InputOOB").innerHTML =
        "Input OOB is : " + input;

        this.OOB = parseInt(input);
        console.log('This is a number : ' + this.OOB);
        resolve();



        // process.stdin.setEncoding('utf8');
        // process.stdin.on('readable', () => {
        //     //  console.log(`you entered : ${chunk}`);
        //     const chunk = process.stdin.read();
        //     if (chunk !== null) {
        //         // process.stdout.write(`data: ${chunk}`);
        //         console.log(`data: ${chunk}`);
        //         //
        //         if (isNaN(chunk)) {
        //
        //             console.log('This is not number');
        //             return;
        //         }
        //         this.OOB = parseInt(chunk);
        //         console.log('This is a number : ' + this.OOB);
        //         resolve();
        //     }
        //
        // });
        // process.stdin.on('end', () => {
        //     process.stdout.write('end');
        // });
    }

    PROV_NO_OOB_Complete() {
        return new Promise((resolve, reject) => {
            console.log('PROV_NO_OOB_Complete');
            resolve();
        });
    }

    PROV_STATIC_OOB_Complete() {
        return new Promise((resolve, reject) => {
            console.log('PROV_STATIC_OOB_Complete');
            resolve();
        });
    }

    PROV_OUTPUT_OOB_Complete() {
        return new Promise((resolve, reject) => {
            console.log('PROV_OUTPUT_OOB_Complete');
            this.Get_OOB_FromUser(resolve, reject);
        });
    }

    PROV_INPUT_OOB_Complete() {
        return new Promise((resolve, reject) => {
            console.log('PROV_INPUT_OOB_Complete');
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_PROV_INPUT_OOB;

            //TODO :Set a timeout ?
        });
    };


    ProcessPDU(PDU) {
        console.log('Get a complete PDU ' + new Uint8Array(PDU));

        if (this.CurrentStepProcess && typeof (this.CurrentStepProcess) === "function") {
            this.CurrentStepProcess(PDU);
        } else {
            console.log('error : no CurrentBehaviorProcess Callback');
        }
        return;
    };


    SetListening(characteristic) {
        console.log('SetListening : ' + characteristic.uuid);
        this.ProxyPDU_1.SetPDU_Callback(PDU => this.ProcessPDU(PDU));
        return new Promise((resolve, reject) => {
            return characteristic.startNotifications()
                .then(characteristic => {
                    console.log('Notifications started');
                    characteristic.addEventListener("characteristicvaluechanged", event => this.ProxyPDU_1.EventListener(event));
                    resolve();
                })
                .catch(error => {
                    reject(`Notifications error: ${error}`);
                });
        });
    };



    StartProvision(characteristicIn, characteristicOut) {
        this.In = characteristicIn;
        this.Out = characteristicOut;

        return new Promise((resolve, reject) => {
            // this.ProvisionFinished = resolve;
            // this.ProvisionFailed = reject;

            console.log('Start Provisionning');

            this.SetListening(this.Out)
                .then(() => {
                    //Send Invite
                    return this.IN_Invite();
                })
                .then(() => {
                    //Send Start
                    return this.IN_Start();
                })
                .then(() => {
                    //Send Public Key
                    return this.IN_Public_Key();
                })
                .then(() => {
                    //Authentication
                    if (this.Prov_Start.auth_method == PROV_NO_OOB) {
                        console.log('Authentication use PROV_NO_OOB');
                        return this.PROV_NO_OOB_Complete();

                    } else if (this.Prov_Start.auth_method == PROV_STATIC_OOB) {
                        console.log('Authentication use PROV_STATIC_OOB');
                        return this.PROV_STATIC_OOB_Complete();

                    } else if (this.Prov_Start.auth_method == PROV_OUTPUT_OOB) {
                        console.log('Authentication use PROV_OUTPUT_OOB');
                        return this.PROV_OUTPUT_OOB_Complete();

                    } else if (this.Prov_Start.auth_method == PROV_INPUT_OOB) {
                        console.log('Authentication use PROV_INPUT_OOB');
                        return this.PROV_INPUT_OOB_Complete();
                    }
                    reject(`Provision error: No valid auth_method`);
                })
                .then(() => {
                    console.log('STEP : Provisioning Confirmation');
                    //Provisioning Confirmation
                    return this.IN_Confirmation();
                })
                .then(() => {
                    console.log('STEP : Provisioning Random');
                    //Provisioning Random
                    return this.IN_Random();
                })
                .then(() => {
                    console.log('STEP : Check Confirmation');
                    return this.CheckConfirmation();
                })
                .then(() => {
                    const os = require('os');
                    console.log('OS endianness is : ' + os.endianness());
                    console.log('5.1 Endianness \n ' +
                        'Unless stated otherwise, all multiple-octet numeric values in this layer shall be “big endian”, as described in Section 3.1.1.1. : ');

                    //
                    {
                        //Obtain a net address

                    }

                    console.log('End of procedure');
                    resolve();
                })
                .catch(error => {
                    reject(`Provision error: ${error}`);
                });
        });
    };
};




//module.exports = Provisionner;
