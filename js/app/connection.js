var connected = false;
var connected_server;

// cached characteristics
var mesh_proxy_data_in;
var mesh_proxy_data_out;

var connection = {};

connection.MESH_PROXY_SERVICE = '00001828-0000-1000-8000-00805f9b34fb';
connection.MESH_PROXY_DATA_IN = '00002add-0000-1000-8000-00805f9b34fb';
connection.MESH_PROXY_DATA_OUT = '00002ade-0000-1000-8000-00805f9b34fb';

var has_mesh_proxy_service = false;
var has_mesh_proxy_data_out = false;
var has_mesh_proxy_data_in = false;
var valid_pdu = false;

var src = "";


var Provisioner;
var selected_device = null;



connection.initialize = function () {

};

connection.findProxies = function () {
    if (HMI.buttonIsDisabled('btn_scan')) {
        return;
    }
    console.log('Scanning....');
    connection.startScan();
}


connection.startScan = function () {
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
            connection.connect();
        })
        .catch(error => {
            HMI.showMessageRed(error);
            console.log('ERROR: ' + error);
        });
};

connection.connect = function () {
    if (connected == false) {
        return selected_device.gatt.connect()
        .then(
            function (server) {
                console.log("Connected to " + server.device.id);
                connected = true;
                connected_server = server;
                HMI.displayConnectionStatus();
                HMI.setBluetoothButtons();
                selected_device.addEventListener('gattserverdisconnected', connection.onDisconnected);
                return connection.discoverSvcsAndChars()
            },
            function (error) {
                console.log("ERROR: could not connect - " + error);
                HMI.showMessageRed("ERROR: could not connect - " + error);
                connected = false;
                HMI.displayConnectionStatus();
                HMI.setBluetoothButtons();
            })
            .then( () => {
                console.log("service discovery has completed");

                if (!has_mesh_proxy_service || !has_mesh_proxy_data_in || !has_mesh_proxy_data_out) {
                  HMI.showMessageRed("ERROR: connected device does not have the required GATT service and characteristic");
                  return;
                }

                this.ProxyPDU_OUT = new ProxyPDU_OUT;
                return this.ProxyPDU_OUT.SetListening(mesh_proxy_data_out)
            })
            .then( () => {
                connection.ProxyPDU_IN = new ProxyPDU_IN(mesh_proxy_data_in);
                HMI.clearMessage();
                HMI.setBluetoothButtons();
                //
                Node.SelectbyNodeID(selected_device.id);
                //
                app.GetPage0();
                HMI.DisplayNodeModels();
            })
            .catch(error => {
              console.log('The error is: ' + error);
            });
    }
}

connection.disconnect = function () {
    console.log("disconnect");
    selected_device.gatt.disconnect();
};

connection.onDisconnected = function () {
    console.log("onDisconnected");
    connected = false;
    HMI.displayConnectionStatus();
    HMI.setBluetoothButtons();
};

connection.connection = function () {
    if (HMI.buttonIsDisabled('btn_connection')) {
        return;
    }
    if (connected == true) {
        connection.disconnect();
    } else {
        connection.connect();
    }
}

connection.discoverSvcsAndChars = function () {
    return new Promise(function (resolve, reject) {
        console.log("discoverSvcsAndChars on " + connected_server.device.name + ', ' + connected_server.device.id);
        connected_server.getPrimaryServices()
            .then(services => {
                console.log('Getting Characteristics...');
                has_mesh_proxy_service = false;
                services.forEach(function (service, sv_index, sv_array) {
                    console.log('> Service: ' + service.uuid);
                    if (service.uuid == connection.MESH_PROXY_SERVICE) {
                        has_mesh_proxy_service = true;
                    }
                    service.getCharacteristics().then(characteristics => {
                        characteristics.forEach(function (characteristic, ch_index, ch_array) {
                            console.log('>> Characteristic: ' + characteristic.uuid);
                            if (characteristic.uuid == connection.MESH_PROXY_DATA_IN) {
                                mesh_proxy_data_in = characteristic;
                                has_mesh_proxy_data_in = true;
                            }
                            if (characteristic.uuid == connection.MESH_PROXY_DATA_OUT) {
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
                HMI.showMessageRed('Error: ' + error);
                console.log('Error: ' + error);
                reject(error);
            });
    });
}
