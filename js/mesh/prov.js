/*
.
*/

var ecc = require("./ecc.js");



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


// use it as module
var Enum = require('enum');
//Output OOB
var Output_OOB_Action = new Enum([
    'Output_OOB_Action_Blink',
    'Output_OOB_Action_Beep',
    'Output_OOB_Action_Vibrate',
    'Output_OOB_Action_Output_Numeric',
    'Output_OOB_Action_Output_Alphanumeric',
]);


//Input OOB
var Input_OOB_Action = new Enum([
    'Input_OOB_Action_Push',
    'Input_OOB_Action_Twist',
    'Input_OOB_Action_Input_Number',
    'Input_OOB_Action_Input_Alphanumeric',
]);

//
const PDU_Parameters_Offset = 1;

const PROV_Attention_Duration = 0x10;

const ProxyPDU = require("./ProxyPDU.js");

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
        this.Ecc_1 = new ecc;

        this.Dev_Confirmation;


        this.Prov_PublicKey = this.Ecc_1.GetPublic();
        this.Dev_PublicKey;
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
        var PDU_Type = PDU[0];
        if (PDU_Type != PROV_CAPS) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        var PDU_Parameter = PDU.subarray(PDU_Parameters_Offset);
        this.ProvisioningCapabilitiesPDUValue = Buffer.from(PDU_Parameter);
        console.log('ProvisioningCapabilitiesPDUValue : ' + this.ProvisioningCapabilitiesPDUValue.toString('hex'));

        //Save caps value
        this.IN_Conf_Caps.num_ele = this.ProvisioningCapabilitiesPDUValue.readUInt8(0);
        this.IN_Conf_Caps.algorithms = this.ProvisioningCapabilitiesPDUValue.readUInt16BE(1);
        this.IN_Conf_Caps.pub_type = this.ProvisioningCapabilitiesPDUValue.readUInt8(3);
        this.IN_Conf_Caps.static_type = this.ProvisioningCapabilitiesPDUValue.readUInt8(4);
        this.IN_Conf_Caps.output_size = this.ProvisioningCapabilitiesPDUValue.readUInt8(5);
        this.IN_Conf_Caps.output_action = this.ProvisioningCapabilitiesPDUValue.readUInt16BE(6);
        this.IN_Conf_Caps.input_size = this.ProvisioningCapabilitiesPDUValue.readUInt8(8);
        this.IN_Conf_Caps.input_action = this.ProvisioningCapabilitiesPDUValue.readUInt16BE(9);

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

        //Check PDU Type
        var PDU_Type = PDU[0];
        if (PDU_Type != PROV_PUB_KEY) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        this.Dev_PublicKey = Buffer.alloc(1 + 64);
        this.Dev_PublicKey[0] = 0x04; //PubKey Tag uncompressed = 0x04
        this.Dev_PublicKey.fill(PDU.subarray(PDU_Parameters_Offset), 1);

        console.log('this.Dev_PublicKey : ' + this.Dev_PublicKey.toString('hex'));

        if (this.Dev_PublicKey.length != 65) {

            this.CurrentStepReject("error : Invalid Dev_PublicKey")
            return;
        }

        //Compute ECDH secret
        this.Ecc_1.ComputeSecret(this.Dev_PublicKey);

        //Step Finished
        this.CurrentStepResolve();
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

        //Check PDU Type
        var PDU_Type = PDU[0];
        if (PDU_Type != PROV_CONFIRM) {
            this.CurrentStepReject("error : Invalid PDU : " + PDU)
            return;
        }

        //Get PDU Parameters
        this.Dev_Confirmation = Buffer.alloc(16);
        this.Dev_Confirmation.fill(PDU.subarray(PDU_Parameters_Offset));

        console.log('this.DevConfirmation : ' + this.Dev_Confirmation.toString('hex'));
  
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
        this.Ecc_1.Dev_RandomBuff = Buffer.alloc(16);
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
            this.PDU_Invite = Buffer.alloc(1 + 1 + 1);

            //Fill PDU_Invite
            this.PDU_Invite[index++] = PROXY_PROVISIONING_PDU;
            this.PDU_Invite[index++] = PROV_INVITE;
            //PDU_Invite Data
            this.PDU_Invite[index++] = PROV_Attention_Duration;
        
            var PDU = new Uint8Array(this.PDU_Invite);
            console.log('Invite PDU ' + PDU);
            console.log('Invite PDU ' + PDU.length);
    
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

        console.log('Output_OOB_Action availables : ')
        console.log(Output_OOB_Action.get(OOB).value + '=> ' + Output_OOB_Action.get(OOB).key);

        var res = this.Get_highest_bit_u16(OOB);
        console.log('Output_OOB_Action select : ')
        console.log(Output_OOB_Action.get(res).value + '=> ' + Output_OOB_Action.get(res).key);

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

        console.log('Input_OOB_Action availables : ')
        console.log(Input_OOB_Action.get(OOB).value + '=> ' + Input_OOB_Action.get(OOB).key);

        var res = this.Get_highest_bit_u16(OOB);
        console.log('Input_OOB_Action select : ')
        console.log(Input_OOB_Action.get(res).value + '=> ' + Input_OOB_Action.get(res).key);

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
            this.PDU_Start = Buffer.alloc(1 + 1 + 5);

            //Fill PDU_Start
            this.PDU_Start[index++] = PROXY_PROVISIONING_PDU;
            this.PDU_Start[index++] = PROV_START;
            //PDU Start Data
            this.PDU_Start[index++] = this.Prov_Start.algorithm;
            this.PDU_Start[index++] = this.Prov_Start.pub_key;
            this.PDU_Start[index++] = this.Prov_Start.auth_method;
            this.PDU_Start[index++] = this.Prov_Start.auth_action;
            this.PDU_Start[index++] = this.Prov_Start.auth_size;

            //PDU_Start.set (Object.values(Prov_Start_1), 1+1);

            var PDU = new Uint8Array(this.PDU_Start);
            console.log('Start PDU ' + PDU);
            console.log('Start PDU ' + PDU.length);

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

            var PDU_Public_Key = Buffer.alloc(1 + 1 + 64);

            var index = 0
            //Fill PDU_Public_Key
            PDU_Public_Key[index++] = PROXY_PROVISIONING_PDU;
            PDU_Public_Key[index++] = PROV_PUB_KEY;

            console.log('PubKey : ' + this.Prov_PublicKey.toString('hex'));

            // const tmpKey = Buffer.from([0x3f, 0x76 , 0x78 , 0x89 , 0x14 , 0x7d , 0x27 , 0x90 , 0x83 , 0xd4 , 0xbf , 0xb7 , 0xd5 , 0xb0 , 0xbc , 0xac , 0x02 , 0x20 , 0x50 , 0xe6
            //     , 0xc3 , 0xc4 , 0x91 , 0xba , 0x27 , 0x43 , 0xf0 , 0xba , 0x97 , 0xdf , 0xfd , 0x4b , 0x0e , 0xb1 , 0x49 , 0x57 , 0x99 , 0x40 , 0xe9 , 0x5f , 0x04 , 0x9e ,
            //      0x81 , 0xc5 , 0x2e , 0x6c , 0x04 , 0x43 , 0x47 , 0xf5 , 0xaa , 0x0b , 0x70 , 0xd7 , 0xd4 , 0xe4 , 0x9e , 0x3a , 0x69 , 0x5b , 0xc3 , 0x63 , 0xbb , 0x96]);


            //PubKey is already recorded in Big endian
            //           //Swap the 256 bytes of the two half Public key parameters (X and Y) to mesh byte order
            //           var tmpKey = Buffer.alloc(64);
            //           this.copy_and_swap_PublicKey(tmpKey, this.Prov_PublicKey.slice(1));//skip PubKeyTag
            //           var copied = tmpKey.copy(PDU_Public_Key, index, 0); //Copy to PDU parameters
            var copied = this.Prov_PublicKey.copy(PDU_Public_Key, index, 1); //Copy to PDU parameters

            var PDU = new Uint8Array(PDU_Public_Key);
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

            var PDU_Confirmation = Buffer.alloc(1 + 1 + 16);

            var index = 0
            //Fill PDU_Public_Key
            PDU_Confirmation[index++] = PROXY_PROVISIONING_PDU;
            PDU_Confirmation[index++] = PROV_CONFIRM;


            var ConfirmationInputs = Buffer.alloc(1 + 11 + 5 + 64 + 64);
            ConfirmationInputs.fill(this.PDU_Invite.slice(2), 0); //size 1
            ConfirmationInputs.fill(this.ProvisioningCapabilitiesPDUValue, 1); //size 11
            ConfirmationInputs.fill(this.PDU_Start.slice(2), 1 + 11);
            ConfirmationInputs.fill(this.Prov_PublicKey.slice(1), 1 + 11 + 5);//Skip Tag
            ConfirmationInputs.fill(this.Dev_PublicKey.slice(1), 1 + 11 + 5 + 64);//Skip Tag

            this.Ecc_1.Set_AuthValue(this.OOB);
            this.Ecc_1.CreateRandomProvisionner();
            console.log('CreateConfirmationKey  =>');
            this.Ecc_1.CreateConfirmationKey(ConfirmationInputs);

            console.log('ConfirmationProvisioner =>');
            var ConfirmationProvisioner = this.Ecc_1.ConfirmationProvisioner();
            
            PDU_Confirmation.fill(ConfirmationProvisioner, index);

            var PDU = new Uint8Array(PDU_Confirmation);
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

            var PDU_Random = Buffer.alloc(1 + 1 + 16);

            var index = 0
            //Fill PDU_Random
            PDU_Random[index++] = PROXY_PROVISIONING_PDU;
            PDU_Random[index++] = PROV_RANDOM;

            PDU_Random.fill(this.Ecc_1.Prov_RandomBuff, index);

            var PDU = new Uint8Array(PDU_Random);
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

            if (Buffer.compare(Calc_ConfirmationDevice, this.Dev_Confirmation) != 0) {
                console.log('Error : Calc_ConfirmationProvisioner is diff! ');
                console.log('Calc_ConfirmationDevice: \n' + Calc_ConfirmationDevice.toString('hex'));
                console.log('this.Dev_Confirmation: \n' + this.Dev_Confirmation.toString('hex'));
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

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            //  console.log(`you entered : ${chunk}`);
            const chunk = process.stdin.read();
            if (chunk !== null) {
                // process.stdout.write(`data: ${chunk}`);
                console.log(`data: ${chunk}`);
                //
                if (isNaN(chunk)) {

                    console.log('This is not number');
                    return;
                }
                this.OOB = parseInt(chunk);
                console.log('This is a number : ' + this.OOB);
                resolve();
            }

        });
        process.stdin.on('end', () => {
            process.stdout.write('end');
        });
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
        console.log('Get a complete PDU ' + PDU);

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

}


module.exports = Provisionner;


















