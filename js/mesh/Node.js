

var Node = {};

Node.SelectedNode = null;


Node.SelectbyNodeID = function (ID) {

  var index = db.data.nodes.findIndex(function(node) {
    return node.id == ID;
  })

  if(index >= 0){
    Node.SelectedNode = db.data.nodes[index];
    console.log('Found Node: ' + Node.SelectedNode.name + ', ' + Node.SelectedNode.id);
    Node.dst = Node.SelectedNode.configuration.BaseAddress;
  }

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
        "elements":[],
        "appKeys":[],
      },
      "composition":{},
     "IVindex":0,
     "sequenceNumber":0
  }

  console.log('Search previous record for this Node');
  var index = Node.SelectbyNodeID(device.id);
  if( index >= 0 ){
    console.log('Node already exist in db !');
  } else {
    console.log('Create a new entry for this Node');
    index = db.data.nodes.length;
    db.data.nodes.push(node);
  }
  Node.SelectedNode = db.data.nodes[index];

  var StartAddress = parseInt(Provisioner.allocatedUnicastRange[0].lowAddress, 16);
  var BaseAddress = utils.toHex(StartAddress + (0x100 * index), 2);
  Node.SelectedNode.configuration.BaseAddress = BaseAddress;
  Node.dst = Node.SelectedNode.configuration.BaseAddress;

  return;
}
