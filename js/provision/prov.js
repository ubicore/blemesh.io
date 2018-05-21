/*
.
*/

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
        this.ProxyPDU_OUT = null;
        this.ProxyPDU_IN = null;

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

    OUT_Capabilities(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        //Check PDU Type
        var PDU_Type = new Uint8Array(PDU_DATA)[0];
        if (PDU_Type != PROV_CAPS) {
            this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }
        //Get PDU Parameters
        this.ProvisioningCapabilitiesPDUValue = PDU_DATA.slice(1);;
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

    OUT_Public_Key(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU_DATA);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_PUB_KEY) {
          this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }

        //Get PDU Parameters
        var key =  PDU_view.slice(1);//skip PDU tag
        if (key.length != 64) {
            this.CurrentStepReject("error : Invalid Dev_PublicKey")
            return;
        }

        this.Ecc_1.DevPubKey = '04'+ utils.bytesToHex(key);

        console.log('this.Ecc_1.DevPubKey : ' + this.Ecc_1.DevPubKey);

        //Compute ECDH secret
        this.Ecc_1.ComputeSecret()
        .then(() => {
                  //Step Finished
                  this.CurrentStepResolve();
        })
    };

    OUT_Confirmation(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU_DATA);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_CONFIRM) {
          this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }

        //Get PDU Parameters
        var Dev_Confirmation = PDU_view.slice(PDU_Parameters_Offset);
        this.Dev_Confirmation = utils.bytesToHex(Dev_Confirmation);
        console.log('this.DevConfirmation : ' + this.Dev_Confirmation);

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_PROV_INPUT_OOB(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        //Check PDU Type
        var PDU_Type = PDU_DATA[0];
        if (PDU_Type != PROV_INP_CMPLT) {
          this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }

        console.log('Get a PROV_INP_CMPLT PDU');

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_PROV_RANDOM(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU_DATA);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_RANDOM) {
          this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }

        //Get PDU Parameters
        var Dev_RandomBuff = PDU_view.slice(PDU_Parameters_Offset);
        this.Ecc_1.Dev_Random = utils.bytesToHex(Dev_RandomBuff);
        console.log('this.Ecc_1.Dev_RandomBuff : ' + this.Ecc_1.Dev_Random);

        console.log('Get a PROV_INP_CMPLT PDU');

        //Step Finished
        this.CurrentStepResolve();
    };

    OUT_COMPLETE(PDU_DATA) {
        if (!this.CurrentStepResolve || !typeof (this.CurrentStepResolve) === "function") {
            console.log('error : no CurrentBehaviorResolve Callback');
            return;
        }
        if (!this.CurrentStepReject || !typeof (this.CurrentStepReject) === "function") {
            console.log('error : no CurrentBehaviorReject Callback');
            return;
        }

        var PDU_view = new Uint8Array(PDU_DATA);
        //Check PDU Type
        var PDU_Type = PDU_view[0];
        if (PDU_Type != PROV_COMPLETE) {
          this.CurrentStepReject("error : Invalid PDU_Type: " + PDU_Type)
            return;
        }

        //Get PDU Parameters
        //NO parameters for this PDU
        console.log('Get a PROV_COMPLETE PDU');

        //Step Finished
        this.CurrentStepResolve();
    };


    IN_Invite() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_Capabilities;

            var index = 0
            var PDU = new Uint8Array(1 + 1 + 1);

            //Fill PDU_Invite
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_INVITE;
            //PDU_Invite Data
            PDU[index++] = PROV_Attention_Duration;

            console.log('Invite PDU ' + PDU);
            console.log('Invite PDU ' + PDU.length);
            this.PDU_Invite = PDU;

            this.ProxyPDU_IN.Send(PDU, null, reject)
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
            this.CurrentStepResolve = null;
            this.CurrentStepReject = null;
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

            console.log('Start PDU ' + PDU);
            console.log('Start PDU ' + PDU.length);
            this.PDU_Start = PDU;

            this.ProxyPDU_IN.Send(PDU, resolve, reject)
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
            PDU.set(ProvPublicKey.slice(1), index); //Skip key tag

            console.log('Public_Key PDU : ' + PDU);
            console.log('Public_Key PDU : ' + PDU.length);

            this.ProxyPDU_IN.Send(PDU, null, reject)
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
            this.ProxyPDU_IN.Send(PDU, null, reject)
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
            this.ProxyPDU_IN.Send(PDU, null, reject)
        });
    };

    IN_DATA() {
        return new Promise((resolve, reject) => {
            this.CurrentStepResolve = resolve;
            this.CurrentStepReject = reject;
            this.CurrentStepProcess = this.OUT_COMPLETE;

            var PDU = new Uint8Array(1 + 1 + 25 + 8);
            var index = 0
            //Fill PDU_Random
            PDU[index++] = PROXY_PROVISIONING_PDU;
            PDU[index++] = PROV_DATA;

            this.Ecc_1.Create_Session_Key();
            this.Ecc_1.Create_Nonce();

            // The provisioning data shall be encrypted and authenticated using:
            // Provisioning Data = Network Key || Key Index || Flags || IV Index || Unicast Address
            //var Key_Index = '0000';
            var Flags = '00'
            var ProvDATAHex = N.key + N.index + Flags + I + Prov.unicastAddress;
            console.log('ProvDATAHex : ' + ProvDATAHex);

            var EncProvDATAHex = this.Ecc_1.Encrypt_Provision_DATA(ProvDATAHex);
            var Payload = new Uint8Array(utils.hexToBytes(EncProvDATAHex));
            PDU.set(Payload, index);

            console.log('PDU_Random len ' + PDU.length + '\n' + PDU);
            this.ProxyPDU_IN.Send(PDU, null, reject)
        });
    };

    CheckConfirmation() {
        return new Promise((resolve, reject) => {
            var Calc_ConfirmationDevice = this.Ecc_1.ConfirmationDevice();
            if (Calc_ConfirmationDevice != this.Dev_Confirmation) {
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
        prov_trace.appendMessage("Request OOB Number :");

//        var img = '/to-do-notifications/img/icon-128.png';
        var text = 'Please enter OOB Number Output from device';
//        var notification = new Notification('To do list', { body: text, icon: img });
        //var notification = new Notification('To do list', { body: text});
        //ServiceWorkerRegistration.showNotification('To do list', { body: text});

        var input = prompt("Please enter OOB Number", "");
        if (isNaN(input)) {
          console.log('This is not a number');
          reject();
          return;
        }

        prov_trace.appendMessage("Input OOB is : " + input);

        this.OOB = parseInt(input);
        console.log('This is a number : ' + this.OOB);
        resolve();
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
      var PDU_view = new Uint8Array(PDU);
      console.log('ProcessPDU: ' + PDU_view);

        if(PDU_view[0] != PROXY_PROVISIONING_PDU){
          console.log('error : Provisionner should process only provisioning PDU');
          return;
        }

        var PDU_DATA = PDU.slice(1);

        if (this.CurrentStepProcess && typeof (this.CurrentStepProcess) === "function") {
            this.CurrentStepProcess(PDU_DATA);
        } else {
            console.log('error : no CurrentBehaviorProcess Callback');
        }
        return;
    };



    StartProvision(characteristicIn, characteristicOut) {

        return new Promise((resolve, reject) => {
            console.log('Start Provisionning');
            prov_trace.clearMessage();
            prov_trace.appendMessage('STEP : Start Provisionning');
            // Remove all saved data from sessionStorage
          	sessionStorage.clear();
          	console.log('sessionStorage cleared...');

            this.ProxyPDU_IN = new ProxyPDU_IN(characteristicIn);

            //
            this.ProxyPDU_OUT = new ProxyPDU_OUT();
            this.ProxyPDU_OUT.SetProvisionnerCb(PDU => this.ProcessPDU(PDU))
            this.ProxyPDU_OUT.SetListening(characteristicOut)
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
                    prov_trace.appendMessage('STEP : Authentication');

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
                    prov_trace.appendMessage('STEP : Provisioning Confirmation');

                    //Provisioning Confirmation
                    return this.IN_Confirmation();
                })
                .then(() => {
                    console.log('STEP : Provisioning Random');
                    prov_trace.appendMessage('STEP : Provisioning Random');

                    //Provisioning Random
                    return this.IN_Random();
                })
                .then(() => {
                    console.log('STEP : Check Confirmation');
                    prov_trace.appendMessage('STEP : Check Confirmation');

                    return this.CheckConfirmation();
                })
                .then(() => {
                    console.log('STEP : Provisioning DATA');
                    prov_trace.appendMessage('STEP : Provisioning DATA');

                    //TODO : Dynamic genration of provision data's
                    return this.IN_DATA();
                })
                .then(() => {
                  console.log('Device_Key =>');
                    this.Ecc_1.Create_Device_Key();

                    //Create empty node struct in db
                    var NodeIndex = db.Add_Node();
                    db.data.nodes[NodeIndex].deviceKey = this.Ecc_1.DeviceKey;
                    console.log('Add new Node index ' + NodeIndex + ' with devicekey ' + db.data.nodes[NodeIndex].deviceKey);

                    console.log('End of provision procedure');
                    prov_trace.appendMessage('End of provision procedure');

                    resolve();
                })
                .catch(error => {
                    reject(`Provision error: ${error}`);
                });
        });
    };
};
