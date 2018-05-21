

var bluetooth = navigator.bluetooth;

/****************************/
var MESH_ProvisioninigService_UUID = 0x1827;
var MESH_ProvisioninigDataIn_UUID = 0x2ADB;
var MESH_ProvisioninigDataOut_UUID = 0x2ADC;

var charIn;
var charOut;
var characteristicOut;
var characteristicInt;
var NodeServer = null;
var selected_device = null;

var prov_app = {};

prov_app.start = function () {

	Notification.requestPermission().then(function(result) {
	  console.log(result);
	});

	provisionner_1 = new Provisionner;

	console.log('Requesting Bluetooth Devices...');
	bluetooth.requestDevice({
		filters: [{ services: [0x1827] }]
	})
	.then(device => {
		selected_device = device;
		console.log('Found device: ' + device.name);
		return device.gatt.connect();
	})
	.then(server => {
		NodeServer = server;
		console.log('Gatt server connected: ' + server.connected);
		return server.getPrimaryService(MESH_ProvisioninigService_UUID);
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
		selected_device.gatt.disconnect();
		console.log('disconnected');
		return;
	})
	.catch(error => {
		console.log('The error is: ' + error);
		if (NodeServer != null) {
			selected_device.gatt.disconnect();
		}

		if (NodeServer != null) {
			NodeServer.disconnect()
			console.log('disconnected');
		}
	});

};
