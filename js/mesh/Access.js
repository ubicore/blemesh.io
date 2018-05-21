var Access_Layer = {};

Access_Layer.receiver = function (dec_upper_transport_layer){
  //example data page 0 parsing, See : p330
  //8.10 Composition Data sample data
  //4.2.1 Composition Data
  //4.2.1.1 Composition Data Page 0

  var result = {
    OP: 0,
    parameters: '',
  };
  var octet0 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(0, 1*2))[0];
  var octet1 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(1*2, 2*2))[0];
  var octet2 = utils.hexToU8A(dec_upper_transport_layer.Payload.substring(2*2, 3*2))[0];
  var BIT7  = (octet0 & (1<<7))?1:0;
  var BIT6  = (octet0 & (1<<6))?1:0;

  console.log('BIT7: ' + BIT7 + 'BIT6: ' + BIT6);


  if(octet0 == 0x7F){
    //RFU

  } else if(!BIT7){
    //Opcode size = 1
    result.parameters = dec_upper_transport_layer.Payload.substring(1*2);
    result.OP = octet0;
  } else if(BIT7 && !BIT6){
    //Opcode size = 2
    result.parameters = dec_upper_transport_layer.Payload.substring(2*2);
    result.OP = (octet0 << 8) + octet1;
  } else if(BIT7 && BIT6){
    //Opcode size = 3
    result.parameters = dec_upper_transport_layer.Payload.substring(3*2);
    result.OP = (octet0 << 16) + (octet1 << 8) + octet2;
  } else {
    //
    alert('Error: Access_Layer, invalid opcode');
  }



  console.log('Access_Layer : ' + JSON.stringify(result));
  Fundation_models_layer.receiver(result);
}
