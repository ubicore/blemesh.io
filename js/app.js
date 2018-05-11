var selected_device = null;
var connected = false;
var connected_server;

// cached characteristics
var mesh_proxy_data_in;
var mesh_proxy_data_out;
var app = {};

app.MESH_PROXY_SERVICE = '00001828-0000-1000-8000-00805f9b34fb';
app.MESH_PROXY_DATA_IN = '00002add-0000-1000-8000-00805f9b34fb';
app.MESH_PROXY_DATA_OUT = '00002ade-0000-1000-8000-00805f9b34fb';

var has_mesh_proxy_service = false;
var has_mesh_proxy_data_out = false;
var has_mesh_proxy_data_in = false;
var valid_pdu = false;

var iv_index = "12345677";

var NetKeyIndex =0;
var netkey = "7dd7364cd842ad18c17c2b820c84c3d6";

var AppKeyIndex = 0;
var appkey = "63964771734fbd76e3b40519d1d94a48";


var devkey = "224a0049582f22a672c2be94b3194b34";

//var encryption_key = "";
//var privacy_key = "";
//var network_id = "";

var sar = 0;
var src = "1234";
var dst = "0b0c";

//var opcode;
var opparams;
var access_payload;
var transmic;
var netmic;

var mtu = 33;

var proxy_pdu;

var msg;

app.initialize = function () {

    //this.ProxyPDU_1 = new ProxyPDU;
    //this.MeshTransport = new UpperTransport;
    UpperTransport.initialize();

    msg = document.getElementById('message');
    // document.getElementById("nid").innerHTML = "0x" + nid;
    // document.getElementById("aid").innerHTML = "0x" + aid;
    // document.getElementById("encryption_key").innerHTML = "0x" + encryption_key;
    // document.getElementById("privacy_key").innerHTML = "0x" + privacy_key;
    // document.getElementById("network_id").innerHTML = "0x" + network_id;
    // document.getElementById("seq").innerHTML = "0x07080a";
    // document.getElementById("ivi").innerHTML = "0x" + ivi.toString();
    document.getElementById("access_payload_section").hidden = false;
    selected_device = null;
    app.setBluetoothButtons();
    // app.deriveProxyPdu();
};

app.findProxies = function () {
    if (app.buttonIsDisabled('btn_scan')) {
        return;
    }
    console.log('Scanning....');
    app.startScan();
}


app.startScan = function () {
    console.log("startScan");
    connected = false;
    var options = {
        filters: [{ services: [0x1828] }]
    }
    navigator.bluetooth.requestDevice(options)
        .then(device => {
            console.log('> Name: ' + device.name);
            console.log('> Id: ' + device.id);
            console.log('> Connected: ' + device.gatt.connected);
            selected_device = device;
            console.log(selected_device);
            app.connect();
        })
        .catch(error => {
            app.showMessageRed(error);
            console.log('ERROR: ' + error);
        });
};

app.connect = function () {
    if (connected == false) {
        selected_device.gatt.connect().then(
            function (server) {
                console.log("Connected to " + server.device.id);
                connected = true;
                connected_server = server;
                app.displayConnectionStatus();
                app.setBluetoothButtons();
                selected_device.addEventListener('gattserverdisconnected', app.onDisconnected);
                app.discoverSvcsAndChars()
                    .then(function (result) {
                        console.log("service discovery has completed");
                        if (has_mesh_proxy_service && has_mesh_proxy_data_out) {
                            this.UpperTransport.ProxyPDU_1.SetListening(mesh_proxy_data_out, PDU => app.ProcessPDU(PDU))
                        }
                        if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
                            app.clearMessage();
                        } else {
                            app.showMessageRed("ERROR: connected device does not have the required GATT service and characteristic");
                        }
                        app.setBluetoothButtons();

                        //
                        if (!has_mesh_proxy_service || !has_mesh_proxy_data_in) {
                          return;
                        }
                    });
            },
            function (error) {
                console.log("ERROR: could not connect - " + error);
                app.showMessageRed("ERROR: could not connect - " + error);
                connected = false;
                app.displayConnectionStatus();
                app.setBluetoothButtons();
            });
    }
}

app.onDisconnected = function () {
    console.log("onDisconnected");
    connected = false;
    app.displayConnectionStatus();
    app.setBluetoothButtons();
};

app.connection = function () {
    if (app.buttonIsDisabled('btn_connection')) {
        return;
    }
    if (connected == true) {
        app.disconnect();
    } else {
        app.connect();
    }
}

app.discoverSvcsAndChars = function () {
    return new Promise(function (resolve, reject) {
        console.log("discoverSvcsAndChars server=" + connected_server);
        connected_server.getPrimaryServices()
            .then(services => {
                console.log('Getting Characteristics...');
                has_mesh_proxy_service = false;
                services.forEach(function (service, sv_index, sv_array) {
                    console.log('> Service: ' + service.uuid);
                    if (service.uuid == app.MESH_PROXY_SERVICE) {
                        has_mesh_proxy_service = true;
                    }
                    service.getCharacteristics().then(characteristics => {
                        characteristics.forEach(function (characteristic, ch_index, ch_array) {
                            console.log('>> Characteristic: ' + characteristic.uuid);
                            if (characteristic.uuid == app.MESH_PROXY_DATA_IN) {
                                mesh_proxy_data_in = characteristic;
                                has_mesh_proxy_data_in = true;
                            }
                            if (characteristic.uuid == app.MESH_PROXY_DATA_OUT) {
                                mesh_proxy_data_out = characteristic;
                                has_mesh_proxy_data_out = true;
                            }
                            if ((sv_index === sv_array.length - 1) && (ch_index === ch_array.length - 1)) {
                                console.log("Last characteristic discovered");
                                resolve();
                            }
                        });
                    });
                });
            })
            .catch(error => {
                app.showMessageRed('Error: ' + error);
                console.log('Error: ' + error);
                reject(error);
            });
    });
}

app.submitPdu = function () {
    if (!connected) {
        return;
    }
    if (!has_mesh_proxy_data_in) {
        app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
        console.log("Error: mesh_proxy_data_in characteristic not discovered");
        return;
    }
    //
    access_payload = document.getElementById("access_payload_hex").value
    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
 }

 app.GetPage0 = function () {
     if (!connected) {
         return;
     }
     if (!has_mesh_proxy_data_in) {
         app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
         console.log("Error: mesh_proxy_data_in characteristic not discovered");
         return;
     }
     //Get Page0
     Config.IN.Composition_Data_Get(0)
     .then(() =>{
       console.log("GetPage0 FINISH WITH SUCCESS !");


     })
     .catch(error => {
         app.showMessageRed(error);
         console.log('ERROR: ' + error);
     });
  }

app.SendAppKey = function () {
      if (!connected) {
          return;
      }
      if (!has_mesh_proxy_data_in) {
          app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
          console.log("Error: mesh_proxy_data_in characteristic not discovered");
          return;
      }
      //
      //Add AppKeyAdd
      Config.IN.AppKeyAdd(NetKeyIndex, AppKeyIndex, appkey)
      .then(() =>{
        console.log("SendAppKey FINISH WITH SUCCESS !");


      })
      .catch(error => {
          app.showMessageRed(error);
          console.log('ERROR: ' + error);
      });
  }

app.displayConnectionStatus = function () {
    if (connected) {
        document.getElementById('bluetooth_status').innerHTML = "CONNECTED";
        devname = "";
        if (selected_device.name != undefined) {
            devname = selected_device.name + " --> ";
        }
        document.getElementById('selected_device').innerHTML = devname + selected_device.id;
    } else {
        document.getElementById('bluetooth_status').innerHTML = "DISCONNECTED";
    }
}

app.ProcessPDU = function (PDU) {
    var PDU_view = new Uint8Array(PDU);
    console.log('Get a complete PDU ' + PDU_view);

    ProxyPDU_OUT.ProcessPDU(PDU);
    return;
};


app.setBluetoothButtons = function () {
    console.log("setBluetoothButtons: connected=" + connected + ",selected_device=" + selected_device);
    btn_connection = document.getElementById('btn_connection');
    if (connected == false && selected_device == null) {
        btn_connection.innerHTML = "Connect";
        app.enableButton('btn_scan');
        app.disableButton('btn_connection');
        app.disableButton('btn_submit');
        return;
    }
    if (connected == false && selected_device != null) {
        btn_connection.innerHTML = "Connect";
        app.enableButton('btn_scan');
        app.enableButton('btn_connection');
        app.disableButton('btn_submit');
        return;
    }
    btn_connection.innerHTML = "Disconnect";
    app.disableButton('btn_scan');
    app.enableButton('btn_connection');
    if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
        app.enableButton('btn_submit');
    }
};

app.clearMessage = function () {
    console.log("clearMessage");
    msg.style.color = "#ffffff";
    msg.innerHTML = "&nbsp;";
    msg.hidden = false;
};

app.showMessage = function (msg_text) {
    msg.style.color = "#ffffff";
    msg.innerHTML = msg_text;
    document.getElementById('message').hidden = false;
};

app.showMessageRed = function (msg_text) {
    msg.style.color = "#ff0000";
    msg.innerHTML = msg_text;
    document.getElementById('message').hidden = false;
};

app.disableButton = function (btn_id) {
    console.log("disableButton: " + btn_id);
    var btn = document.getElementById(btn_id);
    btn.style.color = "gray";
}

app.enableButton = function (btn_id) {
    console.log("enableButton: " + btn_id);
    var btn = document.getElementById(btn_id);
    btn.style.color = "white";
}

app.buttonIsDisabled = function (btn_id) {
    var btn = document.getElementById(btn_id);
    return (btn.style.color === "gray");
}

app.wrongServices = function () {
    app.showMessageRed("Error: peripheral device is not running the required Bluetooth services");
    selected_device.gatt.disconnect();
}

app.onOpcodeSelect = function (selected) {
    onoff_set_params_visible = false;
    access_payload_visible = false;
    if (selected.value == "0000") {
        access_payload_visible = true;
    }
    if (selected.value == "8202") {
        onoff_set_params_visible = true;
    }
    if (selected.value == "8203") {
        onoff_set_params_visible = true;
    }
    document.getElementById("access_payload_section").hidden = !access_payload_visible;
    document.getElementById("generic_onoff_params_onoff").hidden = !onoff_set_params_visible;
    document.getElementById("generic_onoff_params_tid").hidden = !onoff_set_params_visible;
    document.getElementById("generic_onoff_params_trans_time").hidden = !onoff_set_params_visible;
    document.getElementById("generic_onoff_params_delay").hidden = !onoff_set_params_visible;
};

app.onNetKeyChanged = function () {
    netkey = document.getElementById("netkey").value;
};

app.onAppKeyChanged = function () {
    appkey = document.getElementById("appkey").value;
};

app.onDevKeyChanged = function () {
    devkey = document.getElementById("devkey").value;
};

app.onIvIndexChanged = function () {
    iv_index = document.getElementById("iv_index").value;
};

app.onTtlChanged = function () {
    ttl = document.getElementById("ttl").value;
};

app.onSrcChanged = function () {
    src = document.getElementById("src").value;
};

app.onDstChanged = function () {
    dst = document.getElementById("dst").value
};

app.onSarSelect = function (selected) {
    var selected_sar = document.getElementById("sar_selection");
    sar = parseInt(selected_sar.options[selected_sar.selectedIndex].value);
};

app.onMsgTypeSelect = function (selected) {
};

app.onOnOffSelect = function (selected) {
};

app.onAccessPayloadChanged = function () {
    //access_payload = document.getElementById("access_payload_hex").value
};

app.onTidChange = function (selected) {
};

app.onTransTimeChange = function (selected) {
};

app.onDelayChange = function (selected) {
};

app.onMtuChanged = function () {
    mtu = parseInt(document.getElementById("mtu").value);
};
