
GroupView = {};


GroupView.addItem = function () {
	var candidate = document.getElementById("candidate");

  var found = GroupView.FindByName(candidate.value);

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
	GroupView.Refresh($("#GroupAddress-list"));
}

GroupView.removeItem = function () {
	var ul = document.getElementById("GroupAddress-list");
  var index = ul.selectedIndex;

  if(index == 0){
    alert('Could not remove unassigned');
    return;
  }

	db.data.GroupAddress.splice(index, 1);
	db.Save();
	GroupView.Refresh($("#GroupAddress-list"));
}

GroupView.reset = function () {
  db.Reset_GroupAddress();
	GroupView.Refresh($("#GroupAddress-list"));
}


GroupView.Refresh = function (List) {
	List.empty();

  $.each(db.data.GroupAddress, function (index, val) {
    List.append($('<option></option>', {
      value: val.address,
      text: val.name ,
    }));
  });
}

GroupView.FindByName = function (name) {
  var obj = db.data.GroupAddress.find(function (obj) {
    return obj.name == name;
  });
  return obj;
};
