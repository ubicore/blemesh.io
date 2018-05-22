

var Node = {};

Node.Select = function (index) {
  if(db.data.nodes.length > index){
    Node.SelectedNode = db.data.nodes[index];
    Node.dst = Node.SelectedNode.configuration.BaseAddress;
    console.log('Select Node: ' + index + ' @' + Node.dst);
  } else {
    console.log('Invalid Node Index: ' + index);
  }
}
