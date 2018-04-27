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
var netkey = "7dd7364cd842ad18c17c2b820c84c3d6";
var appkey = "63964771734fbd76e3b40519d1d94a48";
var encryption_key = "";
var privacy_key = "";
var network_id = "";

var sar = 0;
var msg_type = 0;
// network PDU fields
var ivi = 0;
var nid = "00";
var ctl = 0;
var ttl = "03";
var seq = 460810; // 0x0x07080a
var src = "1234";
var dst = "0b0c";
var seg = 0;
//var akf = 1;
var akf = 0;

var aid = 0;
var opcode;
var opparams;
var access_payload;
var transmic;
var netmic;

var mtu = 33;

var proxy_pdu;

var msg;

app.initialize = function () {

    this.ProxyPDU_1 = new ProxyPDU;


    N = utils.normaliseHex(netkey);
    P = "00";
    A = utils.normaliseHex(appkey);
    k2_material = crypto.k2(netkey, "00");
    hex_encryption_key = k2_material.encryption_key;
    hex_privacy_key = k2_material.privacy_key;
    hex_nid = k2_material.NID;
    network_id = crypto.k3(netkey);
    aid = crypto.k4(appkey);
    I = utils.normaliseHex(iv_index);
    ivi = utils.leastSignificantBit(parseInt(I, 16));
    msg = document.getElementById('message');
    document.getElementById("nid").innerHTML = "0x" + nid;
    document.getElementById("aid").innerHTML = "0x" + aid;
    document.getElementById("encryption_key").innerHTML = "0x" + encryption_key;
    document.getElementById("privacy_key").innerHTML = "0x" + privacy_key;
    document.getElementById("network_id").innerHTML = "0x" + network_id;
    document.getElementById("seq").innerHTML = "0x07080a";
    document.getElementById("ivi").innerHTML = "0x" + ivi.toString();
    document.getElementById("access_payload_section").hidden = false;
    selected_device = null;
    app.setBluetoothButtons();
    app.deriveProxyPdu();
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
                        if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
                            app.clearMessage();
                        } else {
                            app.showMessageRed("ERROR: connected device does not have the required GATT service and characteristic");
                        }
                        app.setBluetoothButtons();
                        app.clearMessage();
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

app.deriveAccessPayload = function () {
    access_payload = "";
    if (document.getElementById("opcode_selection").value == "0000") {
        access_payload = document.getElementById("access_payload_hex").value;
    } else {
        access_payload = document.getElementById("opcode_selection").value;
        if (access_payload == "8202" || access_payload == "8203") {
            access_payload = access_payload + document.getElementById("onoff_selection").value;
            access_payload = access_payload + document.getElementById("tid_hex").value;
            tt = document.getElementById("trans_time_hex").value;
            if (tt != "00") {
                access_payload = access_payload + tt;
                access_payload = access_payload + document.getElementById("delay_hex").value;
            }
        }
    }
    return access_payload;
};

app.deriveSecureUpperTransportPdu = function (access_payload) {
    upper_trans_pdu = {};
    // derive Application Nonce (ref 3.8.5.2)
    app_nonce = "0100" + utils.toHex(seq, 3) + src + dst + iv_index;
    upper_trans_pdu = crypto.meshAuthEncAccessPayload(A, app_nonce, access_payload);
    return upper_trans_pdu;
}

app.deriveLowerTransportPdu = function (upper_transport_pdu) {
    lower_transport_pdu = "";
    // seg=0 (1 bit), akf=1 (1 bit), aid (6 bits) already derived from k4
    seg_int = parseInt(seg, 16);
    akf_int = parseInt(akf, 16);
    aid_int = parseInt(aid, 16);
    ltpdu1 = (seg_int << 7) | (akf_int << 6) | aid_int;
    lower_transport_pdu = utils.intToHex(ltpdu1) + upper_transport_pdu.EncAccessPayload + upper_transport_pdu.TransMIC;
    return lower_transport_pdu;
};

app.deriveSecureNetworkLayer = function (hex_dst, lower_transport_pdu) {
    network_pdu = "";
    ctl_int = parseInt(ctl, 16);
    ttl_int = parseInt(ttl, 16);
    ctl_ttl = (ctl_int | ttl_int);
    npdu2 = utils.intToHex(ctl_ttl);
    N = utils.normaliseHex(hex_encryption_key);
    net_nonce = "00" + npdu2 + utils.toHex(seq, 3) + src + "0000" + iv_index;
    network_pdu = crypto.meshAuthEncNetwork(N, net_nonce, hex_dst, lower_transport_pdu);
    return network_pdu;
};

app.obfuscateNetworkPdu = function (network_pdu) {
    obfuscated = "";
    obfuscated = crypto.obfuscate(network_pdu.EncDST, network_pdu.EncTransportPDU, network_pdu.NetMIC, ctl, ttl, utils.toHex(seq, 3), src, iv_index, hex_privacy_key);
    return obfuscated;
};

app.finaliseNetworkPdu = function (ivi, nid, obfuscated_ctl_ttl_seq_src, enc_dst, enc_transport_pdu, netmic) {
    ivi_int = parseInt(ivi, 16);
    nid_int = parseInt(nid, 16);
    npdu1 = utils.intToHex((ivi_int << 7) | nid_int);
    netpdu = npdu1 + obfuscated_ctl_ttl_seq_src + enc_dst + enc_transport_pdu + netmic;
    return netpdu;
};

app.finaliseProxyPdu = function (finalised_network_pdu) {
    proxy_pdu = "";
    sm = (sar << 6) | msg_type;
    i = 0;
    proxy_pdu = proxy_pdu + utils.intToHex(sm);
    proxy_pdu = proxy_pdu + finalised_network_pdu;
    return proxy_pdu;
};

app.deriveProxyPdu = function () {
    aid = 0;
    console.log("deriveProxyPdu");
    valid_pdu = true;
    // access payload
    access_payload = app.deriveAccessPayload();
    console.log("access_payload=" + access_payload);

    // upper transport PDU
    upper_transport_pdu_obj = app.deriveSecureUpperTransportPdu(access_payload);
    upper_transport_pdu = upper_transport_pdu_obj.EncAccessPayload + upper_transport_pdu_obj.TransMIC;
    console.log("upper_transport_pdu=" + upper_transport_pdu);
    transmic = upper_transport_pdu_obj.TransMIC;
    document.getElementById("trans_mic").innerHTML = "0x" + upper_transport_pdu_obj.TransMIC;

    // derive lower transport PDU
    lower_transport_pdu = app.deriveLowerTransportPdu(upper_transport_pdu_obj);
    console.log("lower_transport_pdu=" + lower_transport_pdu);

    // encrypt network PDU
    hex_dst = document.getElementById('dst').value;
    secured_network_pdu = app.deriveSecureNetworkLayer(hex_dst, lower_transport_pdu);
    console.log("EncDST=" + JSON.stringify(secured_network_pdu.EncDST) + " EncTransportPDU=" + JSON.stringify(secured_network_pdu.EncTransportPDU));
    netmic = secured_network_pdu.NetMIC;
    document.getElementById("net_mic").innerHTML = "0x" + secured_network_pdu.NetMIC;

    // obfuscate
    obfuscated = app.obfuscateNetworkPdu(secured_network_pdu);
    console.log("obfuscated_ctl_ttl_seq_src=" + JSON.stringify(obfuscated.obfuscated_ctl_ttl_seq_src));

    // finalise network PDU
    finalised_network_pdu = app.finaliseNetworkPdu(ivi, hex_nid, obfuscated.obfuscated_ctl_ttl_seq_src, secured_network_pdu.EncDST, secured_network_pdu.EncTransportPDU, network_pdu.NetMIC);
    console.log("finalised_network_pdu=" + finalised_network_pdu);
    document.getElementById("network_pdu_hex").innerHTML = "0x" + finalised_network_pdu;
    document.getElementById('hdg_network_pdu').innerHTML = "Network PDU - " + (finalised_network_pdu.length / 2) + " octets";

    // finalise proxy PDU
    proxy_pdu = app.finaliseProxyPdu(finalised_network_pdu);
    console.log("proxy_pdu=" + proxy_pdu);
    document.getElementById('proxy_pdu_hex').innerHTML = "0x" + proxy_pdu;
    document.getElementById('hdg_proxy_pdu').innerHTML = "Proxy PDU - " + (proxy_pdu.length / 2) + " octets";

    if (proxy_pdu.length > (mtu * 2)) { // hex chars
        app.showMessageRed("Segmentation required ( PDU length > MTU)");
        alert("Segmentation required ( PDU length > MTU)");
        valid_pdu = false;
        app.disableButton('btn_submit');
    }
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
    app.deriveProxyPdu();
    if (!valid_pdu) {
        app.showMessageRed("Error: PDU is not valid");
        console.log("Error: PDU is not valid");
        return;
    }

    proxy_pdu_bytes = utils.hexToBytes(proxy_pdu);
    proxy_pdu_data = new Uint8Array(proxy_pdu_bytes)
    mesh_proxy_data_in.writeValue(proxy_pdu_data.buffer)
        .then(_ => {
            console.log('sent proxy pdu OK');
            seq++;
        })
        .catch(error => {
            alert('Error: ' + error);
            app.showMessageRed('Error: ' + error);
            console.log('Error: ' + error);
            return;
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

    if (this.CurrentStepProcess && typeof (this.CurrentStepProcess) === "function") {
        this.CurrentStepProcess(PDU);
    } else {
        console.log('error : no CurrentBehaviorProcess Callback');
    }
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

    if (has_mesh_proxy_service && has_mesh_proxy_data_out) {
        this.ProxyPDU_1.SetListening(mesh_proxy_data_out, PDU => this.ProcessPDU(PDU))
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
    k2_material = crypto.k2(netkey, "00");
    hex_encryption_key = k2_material.encryption_key;
    hex_privacy_key = k2_material.privacy_key;
    hex_nid = k2_material.NID;
    network_id = crypto.k3(netkey);
    document.getElementById("nid").innerHTML = "0x" + hex_nid;
    document.getElementById("encryption_key").innerHTML = "0x" + encryption_key;
    document.getElementById("privacy_key").innerHTML = "0x" + privacy_key;
    app.deriveProxyPdu();
};

app.onAppKeyUpdate = function () {
    A = utils.normaliseHex(appkey);
    aid = crypto.k4(appkey);
    document.getElementById("appkey").innerHTML = "0x" + appkey;
    document.getElementById("aid").innerHTML = "0x" + aid;
    app.deriveProxyPdu();
};

app.onAppKeyChanged = function () {
    appkey = document.getElementById("appkey").value;
    A = utils.normaliseHex(appkey);
    aid = crypto.k4(appkey);
    document.getElementById("aid").innerHTML = "0x" + aid;
    app.deriveProxyPdu();
};

app.onIvIndexChanged = function () {
    iv_index = document.getElementById("iv_index").value;
    I = utils.normaliseHex(iv_index);
    ivi = utils.leastSignificantBit(parseInt(I, 16));
    document.getElementById("ivi").innerHTML = "0x" + ivi;
    app.deriveProxyPdu();
};

app.onTtlChanged = function () {
    ttl = document.getElementById("ttl").value;
    app.deriveProxyPdu();
};

app.onSrcChanged = function () {
    src = document.getElementById("src").value;
    app.deriveProxyPdu();
};

app.onDstChanged = function () {
    dst = document.getElementById("dst").value
    app.deriveProxyPdu();
};

app.onSarSelect = function (selected) {
    var selected_sar = document.getElementById("sar_selection");
    sar = parseInt(selected_sar.options[selected_sar.selectedIndex].value);
    app.deriveProxyPdu();
};

app.onMsgTypeSelect = function (selected) {
    app.deriveProxyPdu();
};

app.onOnOffSelect = function (selected) {
    app.deriveProxyPdu();
};

app.onAccessPayloadChanged = function () {
    access_payload = document.getElementById("access_payload_hex").value
    app.deriveProxyPdu();
};

app.onTidChange = function (selected) {
    app.deriveProxyPdu();
};

app.onTransTimeChange = function (selected) {
    app.deriveProxyPdu();
};

app.onDelayChange = function (selected) {
    app.deriveProxyPdu();
};

app.onMtuChanged = function () {
    mtu = parseInt(document.getElementById("mtu").value);
    app.deriveProxyPdu();
};
