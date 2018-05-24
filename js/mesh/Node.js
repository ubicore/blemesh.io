

var Node = {};

Node.SelectedNode = null;


Node.SelectbyNodeID = function (ID) {

  var found = db.data.nodes.find(function(node) {
    return node.id == ID;
  })
  console.log('Found Node: ' + found.name + ', ' + found.id);
  Node.SelectedNode = found;
  Node.dst = Node.SelectedNode.configuration.BaseAddress;
}


Node.Add_Node = function (device) {
  if(!db.data){
    return;
  }

  var New_Index = db.data.nodes.length;

  var StartAddress = parseInt(Provisioner.allocatedUnicastRange[0].lowAddress, 16);
  var BaseAddress = utils.toHex(StartAddress + (0x100 * New_Index), 2);

  var node =
    {
      "id": device.id,
      "name": device.name,
      "deviceKey":"",
      "configuration":{
        "BaseAddress":BaseAddress,
        "netKeys":[],
        "elements":[],
        "appKeys":[],
      },
      "composition":{},
     "IVindex":0,
     "sequenceNumber":0
  }

  db.data.nodes.push(node);

  Node.SelectedNode = db.data.nodes[New_Index];
  Node.dst = Node.SelectedNode.configuration.BaseAddress;

  return;
}
