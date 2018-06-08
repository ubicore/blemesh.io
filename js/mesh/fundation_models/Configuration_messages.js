

// 3.1.1 Endianness and field ordering
// For the network layer, lower transport layer, upper transport layer, mesh beacons, and Provisioning, all
// multiple-octet numeric values shall be sent in big endian, as described in Section 3.1.1.1.
// For the access layer and Foundation Models, all multiple-octet numeric values shall be little endian as
// described in Section 3.1.1.2.


var Config = {};
Config.IN = {};
Config.OUT = {};

/***************************************************************************************************/
Config.std_callback = function(callback, status){
  if(callback){
    if(status == 0){
      if(callback.Success){
        console.log('callback.Success()');
        callback.Success();
      }
    } else {
      if(callback.Fail){
        console.log('callback.Fail()');
        callback.Fail();
      }
    }
  }
}



//4.3.2.40 Config AppKey Status
Config.OUT.AppKey_Status = function (obj, parameters){
  var result = {
  }
  var status = parseInt(parameters.substring(0, 1*2), 16);
  var NetKeyIndexAndAppKeyIndex = parameters.substring(1*2, 4*2);
  result.NetKeyIndex = (NetKeyIndexAndAppKeyIndex >> 12) & 0xFFF;
  result.AppKeyIndex = (NetKeyIndexAndAppKeyIndex & 0xFFF);

  //
  var Status_Code_obj = STATUS_CODE.FindByID(status);
  console.log('AppKey_Status status : ' + JSON.stringify(Status_Code_obj));

  Config.std_callback(obj.callback, status);
}


//4.3.2.5 Config Composition Data Status
Config.OUT.Composition_Data_Status = function (obj, parameters){
  //example data page 0 parsing, See : p330
  //8.10 Composition Data sample data
  //4.2.1.1 Composition Data Page 0
  //console.log('Config.Composition_Data_Status processing');
  var PageNumber = parameters.substring(0, 1*2);

  if(PageNumber != 0){
    console.log('Only Page0 is supported');
    return;
  }
  //skip page PageNumber
  var data = parameters.substring(1*2);

  //Page0
  var composition = {
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
  composition.CID = utils.getUint16LEfromhex(data.substring(0, 2*2)).toString(16);
  composition.PID = utils.getUint16LEfromhex(data.substring(2*2, 4*2)).toString(16);
  composition.VID = utils.getUint16LEfromhex(data.substring(4*2, 6*2)).toString(16);
  composition.CRPL = utils.getUint16LEfromhex(data.substring(6*2, 8*2)).toString(16);

  var Features = utils.getUint16LEfromhex(data.substring(8*2, 10*2));
  composition.Features.Relay = (Features & (1<<0))?true:false;
  composition.Features.Proxy = (Features & (1<<1))?true:false;
  composition.Features.Friend = (Features & (1<<2))?true:false;
  composition.Features.Low_Power = (Features & (1<<3))?true:false;


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
    Element.Loc = utils.getUint16LEfromhex(data.substring(0, 2*2)).toString(16);
    Element.NumS = utils.getUint16LEfromhex(data.substring(2*2, 3*2));
    Element.NumV = utils.getUint16LEfromhex(data.substring(3*2, 4*2));

     data = data.substring(4*2);

    //SIG_Models
    for (var i = 0; i < Element.NumS; i++) {
      var Model = {
        ModelIdentifier: utils.toHex(utils.getUint16LEfromhex(data.substring(0, 2*2)),2),
      }
      Element.SIG_Models[i] = Model;
      data = data.substring(2*2);
    }

    //Vendor_Models
    for (var i = 0; i < Element.NumV; i++) {
      var Model = {
        ModelIdentifier:utils.toHex(utils.getUint16LEfromhex(data.substring(0, 4*2)), 4),
      }
      Element.Vendor_Models[i] = Model;
      data = data.substring(4*2);
    }
    //
    composition.Elements.push(
      Element
    );
  }


    Node.SelectedNode.composition = composition;
    console.log('Composition_Data_Status Page 0 : ' + JSON.stringify(Node.SelectedNode.composition));

    var status = 0;//Success
    Config.std_callback(obj.callback, status);
}

//4.3.2.18 Config Model Publication Status
Config.OUT.Model_Publication_Status = function (obj, parameters){

//Config_Model_Publication_Status
  var CMPS = {
    Status: 0,//8 Status Code for the requesting message
    ElementAddress: 0,//16 Address of the element
    PublishAddress: 0,//16 Value of the publish address
    AppKeyIndex: 0,//12 Index of the application key
    CredentialFlag: 0,//1 Value of the Friendship Credential Flag
    //RFU 3 Reserved for Future Use
    PublishTTL: 0,//8 Default TTL value for the outgoing messages
    PublishPeriod: 0,//8 Period for periodic status publishing
    PublishRetransmitCount: 0, //3 Number of retransmissions for each published message
    PublishRetransmitIntervalSteps: 0,// 5 Number of 50-millisecond steps between retransmissions
    ModelIdentifier: 0,// 16 or 32 SIG Model ID or Vendor Model ID
  }

  CMPS.Status = parseInt(parameters.substring(0, 1*2), 16);
  CMPS.ElementAddress = utils.SWAPhex(parameters.substring(1*2, 3*2));
  CMPS.PublishAddress = utils.SWAPhex(parameters.substring(3*2, 5*2));
  var number = utils.getUint16LEfromhex(parameters.substring(5*2, 7*2));
  CMPS.AppKeyIndex = number & 0xFFF;
  CMPS.CredentialFlag = (number >> 12) & 0x01;
  CMPS.PublishTTL = parseInt(parameters.substring(7*2, 8*2), 16);
  CMPS.PublishPeriod = parseInt(parameters.substring(8*2, 9*2), 16);
  var octet9 = parseInt(parameters.substring(9*2, 10*2), 16);
  CMPS.PublishRetransmitCount = octet9 & 0x1F;
  CMPS.PublishRetransmitIntervalSteps = octet9 >> 3;
  CMPS.ModelIdentifier = utils.SWAPhex(parameters.substring(10*2));

  console.log('Model_Publication_Status : ' + JSON.stringify(CMPS));
  //
  var Status_Code_obj = STATUS_CODE.FindByID(CMPS.Status);
  console.log('Model_Publication_Status status : ' + JSON.stringify(Status_Code_obj));

  //Process CMPS
  var ElementIndex = parseInt(CMPS.ElementAddress , 16) - parseInt(Node.dst , 16);
  if(ElementIndex < Node.SelectedNode.composition.Elements.length){
    var Element = Node.SelectedNode.composition.Elements[ElementIndex];
    var ModelFound;

    //
    if(CMPS.ModelIdentifier.length == 2*2){
      ModelFound = Element.SIG_Models.find(function(model) {
        return model.ModelIdentifier == CMPS.ModelIdentifier;
      })
    }
    //
    if(CMPS.ModelIdentifier.length == 4*2){
      ModelFound = Element.Vendor_Models.find(function(model) {
        return model.ModelIdentifier == CMPS.ModelIdentifier;
      })
    }
    if(ModelFound != undefined){
      var Publication = {
        PublishAddress: CMPS.PublishAddress,
        AppKeyIndex: CMPS.AppKeyIndex,
        CredentialFlag: CMPS.CredentialFlag,
        PublishTTL: CMPS.PublishTTL,
        PublishPeriod: CMPS.PublishPeriod,
        PublishRetransmitCount: CMPS.PublishRetransmitCount,
        PublishRetransmitIntervalSteps: CMPS.PublishRetransmitIntervalSteps,
      }
      //
      ModelFound.Publication = Publication;
      console.log('Model_Publication_Status : ' + JSON.stringify(Publication));
    }
  } else {
    console.log("ERROR : bad Element Address: " + CMPS.ElementAddress);
  }

  Config.std_callback(obj.callback, CMPS.Status);
}


//4.3.2.26 Config Model Subscription Status
Config.OUT.Model_Subscription_Status = function (obj, parameters){

//Model_Subscription_Status
  var CMSS = {
    Status: 0,//8 Status Code for the requesting message
    ElementAddress: 0,//16 Address of the element
    Address: 0,//16 Value of the address
    ModelIdentifier: 0,// 16 or 32 SIG Model ID or Vendor Model ID
  }

  CMSS.Status = parseInt(parameters.substring(0, 1*2), 16);
  CMSS.ElementAddress = utils.SWAPhex(parameters.substring(1*2, 3*2));
  CMSS.PublishAddress = utils.SWAPhex(parameters.substring(3*2, 5*2));
  CMSS.ModelIdentifier = parameters.substring(5*2);

  console.log('Model_Subscription_Status : ' + JSON.stringify(CMSS));
  //
  var Status_Code_obj = STATUS_CODE.FindByID(CMSS.Status);
  console.log('Model_Subscription_Status status : ' + JSON.stringify(Status_Code_obj));

  Config.std_callback(obj.callback, CMSS.Status);
}

//4.3.2.28 Config SIG Model Subscription List
Config.OUT.SIG_Model_Subscription_List = function (obj, parameters){

  //SIG_Model_Subscription_List
    var SMSL = {
      Status: 0,//8 Status Code for the requesting message
      ElementAddress: 0,//16 Address of the element
      ModelIdentifier: 0,// 16 SIG Model ID
      Address : [], //A block of all addresses from the Subscription List
    }

    SMSL.Status = parseInt(parameters.substring(0, 1*2), 16);
    SMSL.ElementAddress = utils.SWAPhex(parameters.substring(1*2, 3*2));
    SMSL.ModelIdentifier = utils.SWAPhex(parameters.substring(3*2, 5*2));

    if(parameters.length > 5*2){
      var data = data.substring(5*2);

      //Get all addresses from the Subscription List
      while(data.length >= 2*2){
        var Address = utils.SWAPhex(data.substring(0, 2*2));
        SMSL.Address.push(Address);
      }
    }

    console.log('SIG_Model_Subscription_List : ' + JSON.stringify(SMSL));
    //
    var Status_Code_obj = STATUS_CODE.FindByID(SMSL.Status);
    console.log('SIG_Model_Subscription_List status : ' + JSON.stringify(Status_Code_obj));

    //Process SMSL
    var ElementIndex = parseInt(SMSL.ElementAddress , 16) - parseInt(Node.dst , 16);
    if(ElementIndex < Node.SelectedNode.composition.Elements.length){
      var Element = Node.SelectedNode.composition.Elements[ElementIndex];
      //
      var ModelFound = Element.SIG_Models.find(function(model) {
        return model.ModelIdentifier == SMSL.ModelIdentifier;
      })
      if(ModelFound){
        ModelFound.SIG_Subscription_List = SMSL.Address;
        console.log('SIG_Model_Subscription_List : ' + JSON.stringify(ModelFound));
      } else {
        console.log("ERROR : Model Not Found: " + SMSL.ModelIdentifier);
      }
    } else {
      console.log("ERROR : bad Element Address: " + SMSL.ElementAddress);
    }

    Config.std_callback(obj.callback, SMSL.Status);
}

//4.3.2.30 Config Vendor Model Subscription List
Config.OUT.Vendor_Model_Subscription_List = function (obj, parameters){

    //Vendor_Model_Subscription_List
      var VMSL = {
        Status: 0,//8 Status Code for the requesting message
        ElementAddress: 0,//16 Address of the element
        ModelIdentifier: 0,// 32 Vendor Model ID
        Address : [], //A block of all addresses from the Subscription List
      }

      VMSL.Status = parseInt(parameters.substring(0, 1*2), 16);
      VMSL.ElementAddress = utils.SWAPhex(parameters.substring(1*2, 3*2));
      VMSL.ModelIdentifier = utils.SWAPhex(parameters.substring(3*2, 7*2));

      if(parameters.length > 5*2){
        var data = data.substring(7*2);

        //Get all addresses from the Subscription List
        while(data.length >= 2*2){
          var Address = utils.SWAPhex(data.substring(0, 2*2));
          VMSL.Address.push(Address);
        }
      }

      console.log('Vendor_Model_Subscription_List : ' + JSON.stringify(VMSL));
      //
      var Status_Code_obj = STATUS_CODE.FindByID(VMSL.Status);
      console.log('Vendor_Model_Subscription_List status : ' + JSON.stringify(Status_Code_obj));

      //Process VMSL
      var ElementIndex = parseInt(VMSL.ElementAddress , 16) - parseInt(Node.dst , 16);
      if(ElementIndex < Node.SelectedNode.composition.Elements.length){
        var Element = Node.SelectedNode.composition.Elements[ElementIndex];
        //
        var ModelFound = Element.Vendor_Models.find(function(model) {
          return model.ModelIdentifier == VMSL.ModelIdentifier;
        })
        if(ModelFound){
          ModelFound.Vendor_Subscription_List = VMSL.Address;
          console.log('Vendor_Model_Subscription_List : ' + JSON.stringify(ModelFound));
        } else {
          console.log("ERROR : Model Not Found: " + VMSL.ModelIdentifier);
        }
      } else {
        console.log("ERROR : bad Element Address: " + VMSL.ElementAddress);
      }

      Config.std_callback(obj.callback, VMSL.Status);
}


//4.3.2.48 Config Model App Status
Config.OUT.Model_App_Status = function (obj, parameters){

//Config_Model_App_Status
  var CMAS = {
    Status: 0,//8 Status Code for the requesting message
    ElementAddress: 0,//16 Address of the element
    AppKeyIndex: 0,//12 Index of the application key
    ModelIdentifier: 0,// 16 or 32 SIG Model ID or Vendor Model ID
  }

  CMAS.Status = parseInt(parameters.substring(0, 1*2), 16);
  CMAS.ElementAddress = utils.SWAPhex(parameters.substring(1*2, 3*2));
  var number = utils.getUint16LEfromhex(parameters.substring(3*2, 5*2));
  CMAS.AppKeyIndex = number & 0xFFF;
  CMAS.ModelIdentifier = parameters.substring(5*2);

  console.log('Model_App_Status : ' + JSON.stringify(CMAS));
  //
  var Status_Code_obj = STATUS_CODE.FindByID(CMAS.Status);
  console.log('Model_App_Status status : ' + JSON.stringify(Status_Code_obj));

  Config.std_callback(obj.callback, CMAS.Status);
}


/***************************************************************************************************/
//4.3.2.4 Config Composition Data Get
Config.IN.Composition_Data_Get = function (page){
  //Set callback on "Config AppKey Status"
  return new Promise((resolve, reject) => {

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Composition_Data_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Composition_Data_Get');

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.toHex(page, 1);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}

//4.3.2.37 Config AppKey Add
Config.IN.AppKeyAdd = function (NetKeyIndex, AppKeyIndex, AppKey){
  //3.8.6.4 Global key indexes
  return new Promise((resolve, reject) => {

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_AppKey_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_AppKey_Add');
    var NetKeyIndexAndAppKeyIndex = ((NetKeyIndex & 0xFFF) << 12) + (AppKeyIndex & 0xFFF);

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.toHex(NetKeyIndexAndAppKeyIndex, 3) + AppKey;

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}

//4.3.2.15 Config Model Publication Get
Config.IN.Model_Publication_Get = function (parameters){
  return new Promise((resolve, reject) => {

    // Field Size(bits) Notes
    // ElementAddress 16 Address of the element
    // ModelIdentifier 16 or 32 SIG Model ID or Vendor Model ID

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Model_Publication_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Model_Publication_Get');

    var Message = {
      //ElementAddress: '',
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if((parameters.ModelIdentifier.length != 2*2) && (parameters.ModelIdentifier.length != 4*2)){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    //Message = Object.assign(parameters);
    for(var k in parameters) Message[k]=parameters[k];

    console.log(opcode_obj.name + ': ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}


//4.3.2.16 Config Model Publication Set
Config.IN.Model_Publication_Set = function (parameters){
  return new Promise((resolve, reject) => {

    // Field Size(bits) Notes
    // ElementAddress 16 Address of the element
    // PublishAddress 16 Value of the publish address
    // AppKeyIndex 12 Index of the application key
    // CredentialFlag 1 Value of the Friendship Credential Flag
    // RFU 3 Reserved for Future Use
    // PublishTTL 8 Default TTL value for the outgoing messages
    // PublishPeriod 8 Period for periodic status publishing
    // PublishRetransmitCount 3 Number of retransmissions for each published message
    // PublishRetransmitIntervalSteps 5 Number of 50-millisecond steps between retransmissions
    // ModelIdentifier 16 or 32 SIG Model ID or Vendor Model ID

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Model_Publication_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Model_Publication_Set');

    var Message = {
      //ElementAddress: '',
      //PublishAddress: '',
      //AppKeyIndex: 0,
      CredentialFlag: 0,
      PublishTTL: 0,
      PublishPeriod : 0,
      PublishRetransmitCount : 0x0,
      PublishRetransmitIntervalSteps : 0x0,
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.PublishAddress.length != (2*2)){
      reject('bad parameters.PublishAddress');
      return;
    }
    if(parameters.AppKeyIndex == null){
      reject('bad parameters.AppKeyIndex');
      return;
    }
    if((parameters.ModelIdentifier.length != 2*2) && (parameters.ModelIdentifier.length != 4*2)){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    //Message = Object.assign(parameters);
    for(var k in parameters) Message[k]=parameters[k];

    console.log('Config_Model_Publication_Set : ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.PublishAddress);
    access_payload += utils.SWAPhex(utils.toHex((Message.AppKeyIndex & 0xFFF) + (Message.CredentialFlag << 12), 2));
    access_payload += utils.toHex(Message.PublishTTL, 1);
    access_payload += utils.toHex(Message.PublishPeriod, 1);
    access_payload += utils.toHex((Message.PublishRetransmitCount & 0x7) + ((Message.PublishRetransmitIntervalSteps & 0x1F) << 3), 1);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}

//4.3.2.17 Config Model Publication Virtual Address Set
Config.IN.Model_Publication_Virtual_Address_Set = function (parameters){
  return new Promise((resolve, reject) => {

    // Field Size(bits) Notes
    // ElementAddress 16 Address of the element
    // PublishAddress 128 Value of the Label UUID publish address
    // AppKeyIndex 12 Index of the application key
    // CredentialFlag 1 Value of the Friendship Credential Flag
    // RFU 3 Reserved for Future Use
    // PublishTTL 8 Default TTL value for the outgoing messages
    // PublishPeriod 8 Period for periodic status publishing
    // PublishRetransmitCount 3 Number of retransmissions for each published message
    // PublishRetransmitIntervalSteps 5 Number of 50-millisecond steps between retransmissions
    // ModelIdentifier 16 or 32 SIG Model ID or Vendor Model ID

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Model_Publication_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Model_Publication_Virtual_Address_Set');

    var Message = {
      //ElementAddress: '',
      //PublishAddress: '',
      //AppKeyIndex: 0,
      CredentialFlag: 0,
      PublishTTL: 0,
      PublishPeriod : 0,
      PublishRetransmitCount : 0x7,
      PublishRetransmitIntervalSteps : 0x10,
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.PublishAddress.length != (16*2)){
      reject('bad parameters.PublishAddress');
      return;
    }
    if(parameters.AppKeyIndex == null){
      reject('bad parameters.AppKeyIndex');
      return;
    }
    if((parameters.ModelIdentifier.length != 2*2) && (parameters.ModelIdentifier.length != 4*2)){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    //Message = Object.assign(parameters);
    for(var k in parameters) Message[k]=parameters[k];

    console.log('Model_Publication_Virtual_Address_Set : ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.PublishAddress);
    access_payload += utils.SWAPhex(utils.toHex((Message.AppKeyIndex & 0xFFF) + (Message.CredentialFlag << 12), 2));
    access_payload += utils.toHex(Message.PublishTTL, 1);
    access_payload += utils.toHex(Message.PublishPeriod, 1);
    access_payload += utils.toHex((Message.PublishRetransmitCount & 0x7) + ((Message.PublishRetransmitIntervalSteps & 0x1F) << 3), 1);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });

}


//4.3.2.19 Config Model Subscription Add
Config.IN.Model_Subscription_Add = function (parameters){
  return new Promise((resolve, reject) => {
    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Model_Subscription_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Model_Subscription_Add');

    var Message = {
      //ElementAddress: '',
      //Address: '',
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.Address.length != (2*2)){
      reject('bad parameters.PublishAddress');
      return;
    }
    if((parameters.ModelIdentifier.length != 2*2) && (parameters.ModelIdentifier.length != 4*2)){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    //Message = Object.assign(parameters);
    for(var k in parameters) Message[k]=parameters[k];

    console.log('Config_Model_Subscription_Add : ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.Address);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}

//4.3.2.27 Config SIG Model Subscription Get
Config.IN.SIG_Model_Subscription_Get = function (parameters){
  return new Promise((resolve, reject) => {

  // Field Size (octets) Notes
  // ElementAddress 2 Address of the element
  // ModelIdentifier 2 SIG Model ID

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_SIG_Model_Subscription_List');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_SIG_Model_Subscription_Get');

    var Message = {
      //ElementAddress: '',
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.ModelIdentifier.length != 2*2){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    for(var k in parameters) Message[k]=parameters[k];

    console.log(opcode_obj.name + ': ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}

//4.3.2.29 Config Vendor Model Subscription Get
Config.IN.Vendor_Model_Subscription_Get = function (parameters){
  return new Promise((resolve, reject) => {

  // Field Size (octets) Notes
  // ElementAddress 2 Address of the element
  // ModelIdentifier 4 Vendor Model ID

    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Vendor_Model_Subscription_List');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Vendor_Model_Subscription_Get');

    var Message = {
      //ElementAddress: '',
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.ModelIdentifier.length != 4*2){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    for(var k in parameters) Message[k]=parameters[k];

    console.log(opcode_obj.name + ': ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}


//4.3.2.46 Config Model App Bind
Config.IN.Model_App_Bind = function (parameters){
  return new Promise((resolve, reject) => {
    var callback = {};
    callback.Success = resolve;
    callback.Fail = reject;

    var opcode_obj_out = OPCODE.FindByName('Config_Model_App_Status');
    opcode_obj_out.callback = callback;

    var opcode_obj = OPCODE.FindByName('Config_Model_App_Bind');

    var Message = {
      //ElementAddress: '',
      //AppKeyIndex: '',
      //ModelIdentifier: '',
    }

    if(parameters.ElementAddress.length != (2*2)){
      reject('bad parameters.ElementAddress');
      return;
    }
    if(parameters.AppKeyIndex == null){
      reject('bad parameters.AppKeyIndex');
      return;
    }
    if((parameters.ModelIdentifier.length != 2*2) && (parameters.ModelIdentifier.length != 4*2)){
      reject('bad parameters.ModelIdentifier');
      return;
    }

    //Message = Object.assign(parameters);
    for(var k in parameters) Message[k]=parameters[k];

    console.log('Config_Model_App_Bind : ' + JSON.stringify(Message));

    var access_payload = '';
    access_payload += OPCODE.ToHexID(opcode_obj);
    access_payload += utils.SWAPhex(Message.ElementAddress);
    access_payload += utils.SWAPhex(utils.toHex((Message.AppKeyIndex & 0xFFF), 2));
    access_payload += utils.SWAPhex(Message.ModelIdentifier);
    console.log('access_payload : ' + access_payload);

    UpperTransport.Send_With_DeviceKey(mesh_proxy_data_in, access_payload);
  });
}
