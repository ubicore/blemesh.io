var IHM = {};

var msg;

IHM.initialize = function () {
  msg = document.getElementById('message');
  IHM.setBluetoothButtons();
}

IHM.displayConnectionStatus = function () {
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

IHM.setBluetoothButtons = function () {
  console.log("setBluetoothButtons: connected=" + connected + ",selected_device=" + selected_device);
  btn_connection = document.getElementById('btn_connection');
  if (connected == false && selected_device == null) {
      btn_connection.innerHTML = "Connect";
      IHM.enableButton('btn_scan');
      IHM.disableButton('btn_connection');
//      IHM.disableButton('btn_submit');
      return;
  }
  if (connected == false && selected_device != null) {
      btn_connection.innerHTML = "Connect";
      IHM.enableButton('btn_scan');
      IHM.enableButton('btn_connection');
//      IHM.disableButton('btn_submit');
      return;
  }
  btn_connection.innerHTML = "Disconnect";
  IHM.disableButton('btn_scan');
  IHM.enableButton('btn_connection');
  if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
      //IHM.enableButton('btn_submit');
  }
};

IHM.clearMessage = function () {
  console.log("clearMessage");
  msg.style.color = "#ffffff";
  msg.innerHTML = "&nbsp;";
  msg.hidden = false;
};

IHM.showMessage = function (msg_text) {
  msg.style.color = "#ffffff";
  msg.innerHTML = msg_text;
  document.getElementById('message').hidden = false;
};

IHM.showMessageRed = function (msg_text) {
  msg.style.color = "#ff0000";
  msg.innerHTML = msg_text;
  document.getElementById('message').hidden = false;
};

IHM.disableButton = function (btn_id) {
  console.log("disableButton: " + btn_id);
  var btn = document.getElementById(btn_id);
  btn.style.color = "gray";
}

IHM.enableButton = function (btn_id) {
  console.log("enableButton: " + btn_id);
  var btn = document.getElementById(btn_id);
  btn.style.color = "white";
}

IHM.buttonIsDisabled = function (btn_id) {
  var btn = document.getElementById(btn_id);
  return (btn.style.color === "gray");
}

IHM.wrongServices = function () {
  IHM.showMessageRed("Error: peripheral device is not running the required Bluetooth services");
  selected_device.gatt.disconnect();
}
