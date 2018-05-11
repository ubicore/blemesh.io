




var Config = {};
Config.IN = {};
Config.OUT = {};

/***************************************************************************************************/

Config.OUT.Composition_Data_Status = function (parameters){
  //example data page 0 parsing, See : p330
  //8.10 Composition Data sample data
  //4.2.1 Composition Data
  //4.2.1.1 Composition Data Page 0
  console.log('Config.Composition_Data_Status processing');
  var PageNumber = parameters.substring(0, 1*2);

  if(PageNumber != 0){
    console.log('Only Page0 is supported');
    return;
  }
  //skip page PageNumber
  var data = parameters.substring(1*2);

  //Page0
  var result = {
		CID: '',
		PID: '',
		VID: '',
		CRPL: '',
		Features:{
      Relay: false,
      Proxy: false,
      Friend: false,
      Low_Power: false,
    } ,
		Elements:[],
	}
  result.CID = utils.getUint16fromhex(data.substring(0, 2*2)).toString(16);
  result.PID = utils.getUint16fromhex(data.substring(2*2, 4*2)).toString(16);
  result.VID = utils.getUint16fromhex(data.substring(4*2, 6*2)).toString(16);
  result.CRPL = utils.getUint16fromhex(data.substring(6*2, 8*2)).toString(16);

  var Features = utils.getUint16fromhex(data.substring(8*2, 10*2));
  result.Features.Relay = (Features & (1<<0))?true:false;
  result.Features.Proxy = (Features & (1<<1))?true:false;
  result.Features.Friend = (Features & (1<<2))?true:false;
  result.Features.Low_Power = (Features & (1<<3))?true:false;


  // Loc 2 Contains a location descriptor
  // NumS 1 Contains a count of SIG Model IDs in this element
  // NumV 1 Contains a count of Vendor Model IDs in this element
  // SIG Models variable Contains a sequence of NumS SIG Model IDs
  // Vendor Models variable Contains a sequence of NumV Vendor Model IDs
  //SIG Model ID (16-bit) or a Vendor Model ID (32-bit)
  data = data.substring(10*2);

  while (data.length) {
    var Element = {
      Loc: '',
      NumS: 0,
      NumV: 0,
      SIG_Models:[],
      Vendor_Models:[],
    }

    //Element description header
    Element.Loc = utils.getUint16fromhex(data.substring(0, 2*2)).toString(16);
    Element.NumS = utils.getUint16fromhex(data.substring(2*2, 3*2));
    Element.NumV = utils.getUint16fromhex(data.substring(3*2, 4*2));

     data = data.substring(4*2);

    //SIG_Models
    for (var i = 0; i < Element.NumS; i++) {
      Element.SIG_Models[i] = utils.getUint16fromhex(data.substring(0, 2*2)).toString(16);
      data = data.substring(2*2);
    }

    //Vendor_Models
    for (var i = 0; i < Element.NumV; i++) {
      Element.Vendor_Models[i] = utils.getUint16fromhex(data.substring(0, 4*2)).toString(16);
      data = data.substring(4*2);
    }
    //
    result.Elements.push(
      Element
    );
  }
    console.log('Composition_Data_Status Page 0 : ' + JSON.stringify(result));
}

/***************************************************************************************************/
Config.IN.Composition_Data_Get = function (page){
  //4.3.2.4 Config Composition Data Get
  var opcode = OPCODE.FindByName('Config_Composition_Data_Get');
  var access_payload = utils.toHex(opcode.id, opcode.size) + utils.toHex(page, 1);

  UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
}

Config.IN.AppKeyAdd = function (NetKeyIndex, AppKeyIndex, AppKey){
  //4.3.2.37 Config AppKey Add
  //3.8.6.4 Global key indexes
  var opcode = OPCODE.FindByName('Config_AppKey_Add');
  var NetKeyIndexAndAppKeyIndex = ((NetKeyIndex & 0xFFF) << 12) + (AppKeyIndex & 0xFFF);
  var access_payload = utils.toHex(opcode.id, opcode.size) + utils.toHex(NetKeyIndexAndAppKeyIndex, 3) + AppKey;

  UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
}
