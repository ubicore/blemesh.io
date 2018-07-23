var connected = false;
var connected_server;

// cached characteristics
var mesh_proxy_data_in;
var mesh_proxy_data_out;

var connection = {};

// connection.MESH_PROXY_SERVICE = '00001828-0000-1000-8000-00805f9b34fb';
// connection.MESH_PROXY_DATA_IN = '00002add-0000-1000-8000-00805f9b34fb';
// connection.MESH_PROXY_DATA_OUT = '00002ade-0000-1000-8000-00805f9b34fb';
connection.MESH_PROXY_SERVICE = 0x1828;

var MESH_ProxyService_UUID = 0x1828;
var MESH_ProxyDATA_IN_UUID = 0x2ADD;
var MESH_ProxyDATA_OUT_UUID = 0x2ADE;


//connection.MESH_PROXY_DATA_IN = 0x2ADD;
//connection.MESH_PROXY_DATA_OUT = 0x2ADE;
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
    bluetooth.requestDevice({
      filters: [{ services: [0x1828] }]
    })
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
                NodeServer = server;
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
                return app.CheckAndUpdateAppKeyOnNode()
            })
            .then( () => {
              return app.GetPage0()
            })
            .then( () => {
              NodeView.DisplayElementAndModel();
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
    NodeView.ResetElementList($('#tree'));
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
    connected_server.getPrimaryService(MESH_ProxyService_UUID)
    .then(service => {
      NodeService = service;
      console.log('Primary service: ' + NodeService.uuid);

      //Get Out
      return service.getCharacteristic(MESH_ProxyDATA_OUT_UUID)
    })
    .then(characteristic => {
      characteristicOut = characteristic;
      console.log('characteristicOut: ' + characteristic.uuid);

      //Get In
      return NodeService.getCharacteristic(MESH_ProxyDATA_IN_UUID)
    })
    .then(characteristic => {
      characteristicIn = characteristic;
      console.log('characteristicIn: ' + characteristic.uuid);

      //
      mesh_proxy_data_out = characteristicOut;
      mesh_proxy_data_in = characteristicIn;
      has_mesh_proxy_service = true;
      has_mesh_proxy_data_out = true;
      has_mesh_proxy_data_in = true;
      resolve();
    })
    .catch(error => {
      console.log('The error is: ' + error);
      if (NodeServer != null) {
        prov_device.gatt.disconnect();
      }

      if (NodeServer != null) {
        NodeServer.disconnect()
        console.log('disconnected');
      }
      reject(error);
    });
  });
}
