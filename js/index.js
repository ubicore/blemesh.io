/*
* Node Web Bluetooth
* Copyright (c) 2017 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

//var bluetooth = require('webbluetooth').bluetooth;
var bluetooth = navigator.bluetooth;
//const Provisionner = require("./mesh/prov.js");
/****************************/
//Test scratch pad

if (0) {
	console.log('START test');
	var ecc = require("./mesh/ecc.js");
	var Ecc_test = new ecc;
	Ecc_test.test();
	process.exit();

}

// // Synchronous
// const crypto = require('crypto');
// const buf = crypto.randomBytes(256);
// console.log(
//   `${buf.length} bytes of random data: ${buf.toString('hex')}`);


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
		console.log('End');
		NodeServer.disconnect()
		console.log('disconnected');
		process.exit();
	})
	.catch(error => {
		console.log('The error is: ' + error);

		if (NodeServer != null) {
			NodeServer.disconnect()
			console.log('disconnected');
		}

		//process.exit();
	});

};
