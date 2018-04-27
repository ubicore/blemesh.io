


/* Largest Possible GATT Packet: Provisioning Public Key + type + sar */
const MAX_GATT_SIZE = (64 + 1 + 1);

const GATT_SAR_MASK = 0xc0;
const GATT_SAR_COMPLETE = 0x00;
const GATT_SAR_FIRST = 0x40;
const GATT_SAR_CONTINUE = 0x80;
const GATT_SAR_LAST = 0xc0;
const GATT_TYPE_INVALID = 0xff;
const GATT_TYPE_MASK = 0x3f;

const SAR_DataOffset = 1;

// 0x00 Network PDU The message is a Network PDU as defined in Section 3.4.4.
// 0x01 Mesh Beacon The message is a mesh beacon as defined in Section 3.9.
// 0x02 Proxy Configuration The message is a proxy configuration message as defined in Section 6.5.
// 0x03 Provisioning PDU The message is a Provisioning PDU as defined in Section 5.4.1.
// 0x04–0x3F RFU Reserved for Future Use.

const Proxy_PDU_Type_List = ['Network PDU', 'Mesh Beacon', 'Proxy Configuration', 'Provisioning PDU'];


class ProxyPDU {
    constructor() {
        this.gatt_pkt = new ArrayBuffer(MAX_GATT_SIZE);
        this.gatt_pkt_Uint8view = new Uint8Array(this.gatt_pkt);
        this.size = 0;
        this.PDU_IN_CallBack = function(){};
    };

    Failed() {
        this.size = 0;
        /* Invalidate packet and return failure */
        /* Disconnect GATT per last paragraph sec 6.6 */
        console.log('Prov abord');
    };

    sar(value) {
        var sarBits = value.getUint8(0) & GATT_SAR_MASK;
        var type = value.getUint8(0) & GATT_TYPE_MASK;
        var SAR_data = new Uint8Array(value.buffer, SAR_DataOffset);

        console.log('buffer.byteLength : ' + value.buffer.byteLength);
        //console.log('data : ' + SAR_data);
        //console.log('type : ' + type);

         switch (sarBits) {
            case GATT_SAR_FIRST:
                console.log('GATT_SAR_FIRST');
                var view = new Uint8Array(this.gatt_pkt);
                this.gatt_pkt_Uint8view.fill(0);
                this.gatt_pkt[0] = type;
                this.size = 1;
            /* TODO: Start Proxy Timeout */
            /* fall through */

            case GATT_SAR_CONTINUE:
                console.log('GATT_SAR_CONTINUE');

                if (this.gatt_pkt[0] != type ||
                    (this.gatt_pkt.length + value.length) > MAX_GATT_SIZE) {
                    mesh_gatt_sar_fail();
                    return;
                }
                this.gatt_pkt_Uint8view.set(SAR_data, this.size);
                this.size += SAR_data.length;
                console.log('this.gatt_pkt : ' + this.gatt_pkt);
                console.log('size : ' + this.size);
                /* We are good to this point, but incomplete */
                return;

            default:
            case GATT_SAR_COMPLETE:
                console.log('GATT_SAR_COMPLETE');
                this.gatt_pkt_Uint8view.fill(0);
                this.gatt_pkt[0] = type;
                this.size = 1;
            /* fall through */

            case GATT_SAR_LAST:
                console.log('GATT_SAR_LAST');

                if (this.gatt_pkt[0] != type ||
                    (this.gatt_pkt.length + value.length) > MAX_GATT_SIZE) {
                    mesh_gatt_sar_fail();
                    return;
                }

                this.gatt_pkt_Uint8view.set(SAR_data, this.size);

                this.size += SAR_data.length;
                console.log('size : ' + this.size);

                if(this.PDU_IN_CallBack && typeof( this.PDU_IN_CallBack) === "function") {
                    var PDU = this.gatt_pkt.slice(SAR_DataOffset, this.size);
                    var Proxy_PDU_Type = (new Uint8Array(PDU))[0];
                    //
                    if( Proxy_PDU_Type < Proxy_PDU_Type_List.length){
                      console.log('===> ' + Proxy_PDU_Type_List[Proxy_PDU_Type]);
                      this.PDU_IN_CallBack(PDU);
                    } else {
                      console.log('Proxy get a unknow message type: ' + Proxy_PDU_Type);
                    }
                } else {
                    console.log('error : no PDU Callback');
                }
                this.size = 0;
                return;
        }
    };

    EventListener(event) {
        console.log('Event');

        if (event.target.value.buffer.byteLength) {
            this.sar(event.target.value);
        } else {
            this.Failed();
        }
    }

    SetListening(characteristic, callback) {
        console.log('SetListening : ' + characteristic.uuid);
        //this.SetPDU_Callback(PDU => callback(PDU));
        this.PDU_IN_CallBack = callback;

        return new Promise((resolve, reject) => {
            return characteristic.startNotifications()
                .then(characteristic => {
                    console.log('Notifications started');
                    characteristic.addEventListener("characteristicvaluechanged", event => this.EventListener(event));
                    resolve();
                })
                .catch(error => {
                    reject(`Notifications error: ${error}`);
                });
        });
    };

}
