
var Fundation_models_layer = {};

Fundation_models_layer.receiver = function (result){
  //4.3.4.1 Alphabetical summary of opcodes
  var opcode_obj = OPCODE.FindByID(result.OP);
  console.log('Opcode : ' + JSON.stringify(opcode_obj));


  if(opcode_obj.process){
    //
    opcode_obj.process(opcode_obj, result.parameters);
  }
}
