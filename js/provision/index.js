

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

var prov = {};

prov.start = function () {
	provisionner_1 = new Provisionner;

	console.log('Requesting Bluetooth Devices...');
	bluetooth.requestDevice({
		filters: [{ services: [0x1827] }]
	})
	.then(device => {
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
		NodeServer.disconnect()
		console.log('disconnected');
		return;
	})
	.catch(error => {
		console.log('The error is: ' + error);

		if (NodeServer != null) {
			NodeServer.disconnect()
			console.log('disconnected');
		}
	});

};
