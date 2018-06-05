var IHM = {};

var msg;

IHM.initialize = function () {
  msg = document.getElementById('message');
  IHM.setBluetoothButtons();
  IHM.GroupAddress.Refresh();
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

IHM.DisplayMessageBox = function (opcode) {
  console.log('opcode: ' + opcode);
  var message = OPCODE.FindByID(opcode);
  console.log('message: ' + message.name);


}

IHM.DisplayNodeModels = function () {
  ModelElmt.renderModels(Node.SelectedNode.composition.Elements, $('#tree'));

  //Get clicked model and message index
  $('#tree li ul li a').click(function() {
//      var MessageIndex = $(this).parent('li').index();
//      var ElementIndex = $(this).parent('li').parent('ul').parent('li').index();
      var opcode = $(this).parent('li').attr("opcode");
      IHM.DisplayMessageBox(opcode);
  });

  ModelTree.walk();
  $('ul > li').has('ul').addClass('sub');
}



/*************************************************************/

IHM.GroupAddress = {};


IHM.GroupAddress.addItem = function () {
	var candidate = document.getElementById("candidate");

  var found = IHM.GroupAddress.FindByName(candidate.value);

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
	IHM.GroupAddress.Refresh();
}

IHM.GroupAddress.removeItem = function () {
	var ul = document.getElementById("dynamic-list");
	db.data.GroupAddress.splice(ul.selectedIndex, 1);
	db.Save();
	IHM.GroupAddress.Refresh();
}

IHM.GroupAddress.empty = function () {
	db.data.GroupAddress = [];
	db.Save();
	IHM.GroupAddress.Refresh();
}


IHM.GroupAddress.Refresh = function () {
	var ul = document.getElementById("dynamic-list");
	$(ul).empty();

  $.each(db.data.GroupAddress, function (index, val) {
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(val.name));
  	opt.value = val.address;

	  ul.appendChild(opt);
  });
}

IHM.GroupAddress.FindByName = function (name) {
  var obj = db.data.GroupAddress.find(function (obj) {
    return obj.name == name;
  });
  return obj;
};






/*************************************************************/
