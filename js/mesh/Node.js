

var Node = {};

Node.SelectedNode = null;


Node.SelectbyNodeID = function (ID) {

  var found = db.data.nodes.find(function(node) {
    return node.id == ID;
  })

  if(found !== undefined){
    Node.SelectedNode = found;
    console.log('Found Node: ' + Node.SelectedNode.name + ', ' + Node.SelectedNode.id);
    Node.dst = Node.SelectedNode.configuration.BaseAddress;
  } else {
    console.log('Node.SelectbyNodeID  : NOT FOUND');
  }
}

Node.FindNodeById = function (device) {

  var found = db.data.nodes.find(function(node) {
    return node.id == device.id;
  })
  return found;
}

Node.FindNodeIndex = function (A_Node) {

  var index = db.data.nodes.findIndex(function(node) {
    return node.id == A_Node.id;
  })
  return index;
}


Node.Add_Node = function (device) {
  if(!db.data){
    return;
  }
  var node =
    {
      "id": device.id,
      "name": device.name,
      "deviceKey":"",
      "configuration":{
        "BaseAddress":"",
        "netKeys":[],
        "appKeys":[],
        "Elements":[],
      },
      "composition":{},
     "IVindex":0,
     "sequenceNumber":0
  }

  console.log('Search previous record for this Node');
  var FoundNode = Node.FindNodeById(device);
  var index = null;
  if(FoundNode !== undefined ){
    console.log('Node already exist in db !');
    index = Node.FindNodeIndex(FoundNode);
  } else {
    console.log('Create a new entry for this Node');
    index = db.data.nodes.length;
    db.data.nodes.push(node);
  }

  var StartAddress = parseInt(Provisioner.allocatedUnicastRange[0].lowAddress, 16);
  var BaseAddress = utils.toHex(StartAddress + (0x100 * index), 2);
  db.data.nodes[index].configuration.BaseAddress = BaseAddress;

  return;
}

Node.Add_NetKey = function (onNode, NetKey) {

  var index = onNode.configuration.netKeys.findIndex(function(obj) {
    return  JSON.stringify(obj) === JSON.stringify(NetKey) ;
  })

  if(index >= 0){
    console.log('This NetKey already exist for this Node');
    return;
  }

  onNode.configuration.netKeys.push(NetKey);
  db.Save();
}

Node.Add_AppKey = function (onNode, AppKey) {

  var index = onNode.configuration.appKeys.findIndex(function(obj) {
    return  JSON.stringify(obj) === JSON.stringify(AppKey) ;
  })

  if(index >= 0){
    console.log('This AppKey already exist for this Node');
    return;
  }

  onNode.configuration.appKeys.push(AppKey);
  db.Save();
}

Node.Add_DevKey = function (onNode, DevKey) {
  onNode.deviceKey = DevKey;
  db.Save();
}
