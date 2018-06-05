var HMI = {};

var msg;

HMI.initialize = function () {
  msg = document.getElementById('message');
  HMI.setBluetoothButtons();
  HMI.GroupAddress.Refresh();
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
  msg.style.color = "#ffffff";
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

HMI.DisplayMessageBox = function (opcode) {
  console.log('opcode: ' + opcode);
  var message = OPCODE.FindByID(opcode);
  console.log('message: ' + message.name);
}

HMI.DisplayNodeModels = function () {
  ModelElmt.renderModels(Node.SelectedNode.composition.Elements, $('#tree'));

  //Get clicked model and message index
  $('#tree li ul li a').click(function() {
//      var MessageIndex = $(this).parent('li').index();
//      var ElementIndex = $(this).parent('li').parent('ul').parent('li').index();
      var opcode = $(this).parent('li').attr("opcode");
      HMI.DisplayMessageBox(opcode);
  });

  ModelTree.walk();
  $('ul > li').has('ul').addClass('sub');
}



/*************************************************************/

HMI.GroupAddress = {};


HMI.GroupAddress.addItem = function () {
	var candidate = document.getElementById("candidate");

  var found = HMI.GroupAddress.FindByName(candidate.value);

  if(found != undefined){
    alert('This GroupAddress Name already exist in db !');
    return;
  }

	var GroupAddress =
    {
      "name": candidate.value,
      "address": db.data.GroupAddress_NextAddress,
  	}

  db.data.GroupAddress_NextAddress++;
	db.data.GroupAddress.push(GroupAddress);
  console.log("Add new db.data.GroupAddress : \n" + JSON.stringify(GroupAddress));

	db.Save();
	HMI.GroupAddress.Refresh();
}

HMI.GroupAddress.removeItem = function () {
	var ul = document.getElementById("GroupAddress-list");
	db.data.GroupAddress.splice(ul.selectedIndex, 1);
	db.Save();
	HMI.GroupAddress.Refresh();
}

HMI.GroupAddress.empty = function () {
	db.data.GroupAddress = [];
	db.Save();
	HMI.GroupAddress.Refresh();
}


HMI.GroupAddress.Refresh = function () {
	var ul = document.getElementById("GroupAddress-list");
	$(ul).empty();

  $.each(db.data.GroupAddress, function (index, val) {
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(val.name));
  	opt.value = val.address;

	  ul.appendChild(opt);
  });
}

HMI.GroupAddress.FindByName = function (name) {
  var obj = db.data.GroupAddress.find(function (obj) {
    return obj.name == name;
  });
  return obj;
};



/*************************************************************/
