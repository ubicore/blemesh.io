


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



class ProxyPDU {
    constructor() {
        this.gatt_pkt = new ArrayBuffer(MAX_GATT_SIZE);
        this.gatt_pkt_Uint8view = new Uint8Array(this.gatt_pkt);
        this.size = 0;
        this.PDU_IN_CallBack = function(){};
    };

    SetPDU_Callback(CallBack){
        this.PDU_IN_CallBack = CallBack;
    }

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
                    console.log('Call PDU_IN_CallBack ');
                    var PDU = this.gatt_pkt.slice(SAR_DataOffset, this.size);
                    this.PDU_IN_CallBack(PDU);
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
}
