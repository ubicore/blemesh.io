

var bluetooth = navigator.bluetooth;

/****************************/
var MESH_ProvisioninigService_UUID = 0x1827;
var MESH_ProvisioninigDataIn_UUID = 0x2ADB;
var MESH_ProvisioninigDataOut_UUID = 0x2ADC;

var connected = false;

var charIn;
var charOut;
var characteristicOut;
var characteristicInt;
var selected_device = null;
var NodeServer = null;

var prov_app = {};
var provisionner_1 = null;

prov_app.start = function () {
	if(connected != false){
		prov_app.disconnect();
		return;
	}

	provisionner_1 = new Provisionner;

	console.log("startScan");
	bluetooth.requestDevice({
//		filters: [{ services: [0x1827] }],
		 acceptAllDevices: true,
		 optionalServices: [0x1827],
	})
	.then(device => {
		console.log('> Name: ' + device.name);
		console.log('> Id: ' + device.id);
		console.log('> Connected: ' + device.gatt.connected);
		selected_device = device;
		return selected_device.gatt.connect()
	})
	.then(server => {
		NodeServer = server;
		console.log("Connected to " + NodeServer.device.id);
		selected_device.addEventListener('gattserverdisconnected', prov_app.onDisconnected);
		return NodeServer.getPrimaryService(MESH_ProvisioninigService_UUID);
	})
	.then(service => {
		NodeService = service;
		console.log('Primary service: ' + NodeService.uuid);

		//Get Out
		return NodeService.getCharacteristic(MESH_ProvisioninigDataOut_UUID)
	})
	.then(characteristic => {
		characteristicOut = characteristic;
		console.log('characteristicOut: ' + characteristicOut.uuid);

		//Get In
		return NodeService.getCharacteristic(MESH_ProvisioninigDataIn_UUID)
	})
	.then(characteristic => {
		characteristicIn = characteristic;
		console.log('characteristicIn: ' + characteristicIn.uuid);
		return provisionner_1.StartProvision(characteristicIn, characteristicOut);
	})
	.then(() => {
		console.log('Provision completed');
		NodeServer.disconnect();
		prov_app.disconnect();
		console.log('disconnected');
		return;
	})
	.catch(error => {
		console.log('The error is: ' + error);
		if (NodeServer != null) {
			prov_app.disconnect();
		}
	});
};

prov_app.disconnect = function () {
		if(connected != true){
			return;
		}
	  console.log("disconnect");
    selected_device.gatt.disconnect();
};
prov_app.onDisconnected = function () {
    console.log("onDisconnected");
		connected = false;
		provisionner_1 = null;
};
