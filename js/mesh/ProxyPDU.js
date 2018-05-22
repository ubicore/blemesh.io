


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


class ProxyPDU_OUT {
    constructor() {
        this.gatt_pkt = new ArrayBuffer(MAX_GATT_SIZE);
        this.gatt_pkt_Uint8view = new Uint8Array(this.gatt_pkt);
        this.size = 0;

        this.ProvisionnerINCb = function(){};
    };

    Failed() {
        this.size = 0;
        /* Invalidate packet and return failure */
        /* Disconnect GATT per last paragraph sec 6.6 */
        console.log('Prov abord');
    };

    Reassembly(value) {
        var sarBits = value.getUint8(0) & GATT_SAR_MASK;
        var type = value.getUint8(0) & GATT_TYPE_MASK;
        var SAR_data = new Uint8Array(value.buffer, SAR_DataOffset);

        console.log('buffer.byteLength : ' + value.buffer.byteLength);
        //console.log('data : ' + SAR_data);
        //console.log('type : ' + type);

         switch (sarBits) {
            case GATT_SAR_FIRST:
                console.log('GATT_SAR_FIRST');
                this.gatt_pkt_Uint8view.fill(0);
                this.gatt_pkt_Uint8view[0] = type;
                this.size = 1;
            /* TODO: Start Proxy Timeout */
            /* fall through */

            case GATT_SAR_CONTINUE:
                console.log('GATT_SAR_CONTINUE');

                if (this.gatt_pkt_Uint8view[0] != type ||
                    (this.gatt_pkt.length + value.length) > MAX_GATT_SIZE) {
                    mesh_gatt_sar_fail();
                    return;
                }
                this.gatt_pkt_Uint8view.set(SAR_data, this.size);
                this.size += SAR_data.length;
                console.log('this.gatt_pkt : ' + this.gatt_pkt_Uint8view);
                console.log('size : ' + this.size);
                /* We are good to this point, but incomplete */
                return;

            default:
            case GATT_SAR_COMPLETE:
                console.log('GATT_SAR_COMPLETE');
                this.gatt_pkt_Uint8view.fill(0);
                this.gatt_pkt_Uint8view[0] = type;
                this.size = 1;
            /* fall through */

            case GATT_SAR_LAST:
                console.log('GATT_SAR_LAST');

                if (this.gatt_pkt_Uint8view[0] != type ||
                    (this.gatt_pkt.length + value.length) > MAX_GATT_SIZE) {
                    mesh_gatt_sar_fail();
                    return;
                }

                this.gatt_pkt_Uint8view.set(SAR_data, this.size);

                this.size += SAR_data.length;
                console.log('size : ' + this.size);

                var PDU = this.gatt_pkt.slice(0, this.size);
                var Proxy_PDU_Type = (new Uint8Array(PDU))[0];
                //
                if( Proxy_PDU_Type < Proxy_PDU_Type_List.length){
                  console.log('===> ' + Proxy_PDU_Type_List[Proxy_PDU_Type]);
                  this.ProcessPDU(PDU);
                } else {
                  console.log('Proxy get a unknow message type: ' + Proxy_PDU_Type);
                }

                this.size = 0;
                return;
        }
    };

    EventListener(event) {
        console.log('Event');

        if (event.target.value.buffer.byteLength) {
            this.Reassembly(event.target.value);
        } else {
            this.Failed();
        }
    }

    SetListening(characteristic) {
        console.log('SetListening');

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

    SetProvisionnerCb(Callback){
      this.ProvisionnerINCb = Callback;
    }

    ProcessPDU (PDU) {
        console.log("ProcessPDU");

        var proxy_pdu = new Uint8Array(PDU)

        //PDU type
        var Proxy_PDU_Type = proxy_pdu[0];
        var Net_pdu_bytes = utils.bytesToHex(proxy_pdu.slice(1));//Skip PDU Type

        //
        switch (Proxy_PDU_Type) {
          case 0x00 :
            console.log("Network PDU");
            Network.receive(Net_pdu_bytes);
            break;
          case 0x01:
            console.log("Mesh Beacon");
            break;
          case 0x02:
            console.log("Proxy Configuration");
            break;
          case 0x03:
            console.log("Provisioning PDU");
            if(this.ProvisionnerINCb  && typeof(this.ProvisionnerINCb) === "function"){
              this.ProvisionnerINCb(PDU);
            }
            break;
          default:
            console.log("RFU");
        }
    }

}

const MTU = 18;

class ProxyPDU_IN {
    constructor(characteristicIn) {
      this.IN = characteristicIn;





    };

    Send(PDU, CbOnSuccess, CbOnFail) {
      this.CbOnSuccess = CbOnSuccess;
      this.CbOnFail = CbOnFail;

      this.PDU_Type = PDU[0] & 0x3F;
      this.RemainingDATA = PDU.slice(1);
      var Remaining = this.RemainingDATA.length;

      this.ToSend = (Remaining > (MTU-1))? (MTU-1) : Remaining;
      var SAR = (Remaining > this.ToSend) ? 0b01 : 0;

      var proxy_pdu = new Uint8Array(1+this.ToSend)
      proxy_pdu[0] = (SAR << 6) +  this.PDU_Type;
      proxy_pdu.set(this.RemainingDATA.slice(0, this.ToSend), 1);

      console.log('Write Fisrt segment:' + proxy_pdu);
      this.Write(proxy_pdu);
    }

    Write(ProxyPDU) {
      this.IN.writeValue(ProxyPDU)
      .then(() => {
        console.log('Write OK');
        this.RemainingDATA = this.RemainingDATA.slice(this.ToSend);
        var Remaining = this.RemainingDATA.length;

        if(Remaining > 0){
          this.ToSend = (Remaining > (MTU-1))? (MTU-1) : Remaining;
          var SAR = (Remaining > this.ToSend) ? 0b10 : 0b11;

          var proxy_pdu = new Uint8Array(1+this.ToSend)
          proxy_pdu[0] = (SAR << 6) +  this.PDU_Type;
          proxy_pdu.set(this.RemainingDATA.slice(0, this.ToSend), 1);

          console.log('Write n segment : ' + proxy_pdu);
          this.Write(proxy_pdu);
        }else {
          console.log('Send is finish');

          if(this.CbOnSuccess  && typeof(this.CbOnSuccess) === "function"){
            console.log('typeof is function ');
            this.CbOnSuccess();
          }
        }
      })
      .catch(error => {
        console.log('Write Fail');

        if(this.CbOnFail  && typeof(this.CbOnFail) === "function"){
          this.CbOnFail(`writeValue error: ${error}`);
        }
      });

    };



}
