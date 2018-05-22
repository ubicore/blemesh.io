//var selected_device = null;
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

var src = "";

var msg;

var Provisioner;


app.initialize = function () {
    db.initialize();

    //TODO : select provisioner
    {
      Provisioner = db.data.provisioners[0];
      src = Provisioner.unicastAddress;
      console.log('Select Provisioner: ' + Provisioner.provisionerName + ' @' + src);
    }

    //TODO : add entry to select Node => identify Node by other method ???
    Node.Select(0);

    msg = document.getElementById('message');
    selected_device = null;
    app.setBluetoothButtons();
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
                          this.ProxyPDU_OUT = new ProxyPDU_OUT;
                          this.ProxyPDU_OUT.SetListening(mesh_proxy_data_out);
                        }
                        if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
                            app.ProxyPDU_IN = new ProxyPDU_IN(mesh_proxy_data_in);
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

app.disconnect = function () {
    console.log("disconnect");
    selected_device.gatt.disconnect();
};

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
       db.Save();
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
    Config.IN.AppKeyAdd(NetKey.index, AppKey.index, AppKey.key)
    .then(() =>{
      console.log("SendAppKey FINISH WITH SUCCESS !");
    })
    .catch(error => {
      app.showMessageRed(error);
      console.log('ERROR: ' + error);
    });
  }


  app.PublicationSet = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '',
      //          PublishAddress: 'ABCDEF0000000001ABCDEF0000000001',
      PublishAddress: 'c000',
      //AppKeyIndex: 0,
      // CredentialFlag: 0,
      // PublishTTL: 0,
      // PublishPeriod : 0,
      // PublishRetransmitCount : 0x7,
      // PublishRetransmitIntervalSteps : 0x10,
      ModelIdentifier: '1001',//Client : switch
      //      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;
    parameters.AppKeyIndex = AppKey.index;


    Config.IN.Model_Publication_Set(parameters)
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS !");
    })
    .catch(error => {
      app.showMessageRed(error);
      console.log('ERROR: ' + error);
    });
  }

  app.SubscriptionAdd = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '0b0c',
      Address: 'c000',
      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;

    Config.IN.Model_Subscription_Add(parameters)
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS ! " + parameters.ElementAddress);
      parameters.ElementAddress = '0101';
      return Config.IN.Model_Subscription_Add(parameters)
    })
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS ! " + parameters.ElementAddress);
    })
    .catch(error => {
      app.showMessageRed(error);
      console.log('ERROR: ' + error);
    });

  }

  app.AppBind = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      app.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '0b0c',
      //AppKeyIndex: 0,
      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;
    parameters.AppKeyIndex = AppKey.index;

    Config.IN.Model_App_Bind(parameters)
    .then(() =>{
      console.log("AppBind FINISH WITH SUCCESS ! " + parameters.ElementAddress);

      var NewDST = utils.toHex(parseInt(Node.dst, 16) + 1 , 2);
      parameters.ElementAddress =  NewDST;
      return Config.IN.Model_App_Bind(parameters)
    })
    .then(() =>{
      console.log("AppBind FINISH WITH SUCCESS ! " + parameters.ElementAddress);
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
