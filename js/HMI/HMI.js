var HMI = {};

var msg;

HMI.initialize = function () {
  msg = document.getElementById('message');
  HMI.setBluetoothButtons();

  GroupView.Refresh($("#GroupAddress-list"));
}

HMI.displayConnectionStatus = function () {
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

HMI.setBluetoothButtons = function () {
  console.log("setBluetoothButtons: connected=" + connected + ",selected_device=" + selected_device);
  btn_connection = document.getElementById('btn_connection');
  if (connected == false && selected_device == null) {
      btn_connection.innerHTML = "Connect";
      HMI.enableButton('btn_scan');
      HMI.disableButton('btn_connection');
//      HMI.disableButton('btn_submit');
      return;
  }
  if (connected == false && selected_device != null) {
      btn_connection.innerHTML = "Connect";
      HMI.enableButton('btn_scan');
      HMI.enableButton('btn_connection');
//      HMI.disableButton('btn_submit');
      return;
  }
  btn_connection.innerHTML = "Disconnect";
  HMI.disableButton('btn_scan');
  HMI.enableButton('btn_connection');
  if (has_mesh_proxy_service && has_mesh_proxy_data_in) {
      //HMI.enableButton('btn_submit');
  }
};

HMI.clearMessage = function () {
  console.log("clearMessage");
  msg.style.color = "#ffffff";
  msg.innerHTML = "&nbsp;";
  msg.hidden = false;
};

HMI.showMessage = function (msg_text) {
  msg.style.color = "#0000ff";
  msg.innerHTML = msg_text;
  document.getElementById('message').hidden = false;
};

HMI.showMessageRed = function (msg_text) {
  msg.style.color = "#ff0000";
  msg.innerHTML = msg_text;
  document.getElementById('message').hidden = false;
};

HMI.disableButton = function (btn_id) {
  console.log("disableButton: " + btn_id);
  var btn = document.getElementById(btn_id);
  btn.style.color = "gray";
}

HMI.enableButton = function (btn_id) {
  console.log("enableButton: " + btn_id);
  var btn = document.getElementById(btn_id);
  btn.style.color = "white";
}

HMI.buttonIsDisabled = function (btn_id) {
  var btn = document.getElementById(btn_id);
  return (btn.style.color === "gray");
}

HMI.wrongServices = function () {
  HMI.showMessageRed("Error: peripheral device is not running the required Bluetooth services");
  selected_device.gatt.disconnect();
}
