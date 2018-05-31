
//Rx supported messages Only
const Models = [
  /*******************************************************/
  // Configuration Server model
  /*******************************************************/
  {id: 0x0000, name: 'Configuration Server model' ,
  SupportedRxMessages: [
    0x8009,//Beacon
    0x800A,
    0x8008,//Composition Data
    0x800C,//TTL
    0x800D,
    0x8012, //GATT Proxy
    0x8013,
    0x800F, //Friend
    0x8010,
    0x8026, //Relay
    0x8027,
    0x8018, //Model Publication
    0x03,
    0x801A,
    0x801B, //Model Subscription
    0x8020,
    0x8021,
    0x8022,
    0x801D,
    0x8029,
    0x802B,
    0x8040, //NetKey
    0x8045,
    0x8041,
    0x8042,
    0x00, //AppKey
    0x01,
    0x8000,
    0x8001,
    0x803D, //Model App Bind
    0x803F,
    0x804B,
    0x8046, //Node Identity Get
    0x8047,
    0x8049, //Node Reset
    0x8015, //Key_Refresh_Phase_Get
    0x8016,
    0x8038, //Config_Heartbeat_Publication_Get
    0x8039,
    0x803A, //Config Heartbeat Subscription Get
    0x803B,
    0x8023, //Config_Network_Transmit_Get
    0x8024,
   ]},
   /*******************************************************/
   // Configuration Client model
   /*******************************************************/
   {id: 0x0001, name: 'Configuration Client model' ,
   SupportedRxMessages: [
   ]},

   /*******************************************************/
   // Health Server model
   /*******************************************************/
   {id: 0x0002, name: 'Health Server model' ,
   SupportedRxMessages: [
   ]},
   /*******************************************************/
   // Health Client model
   /*******************************************************/
   {id: 0x0003, name: 'Health Client model' ,
   SupportedRxMessages: [
   ]},

   /*******************************************************/
   //Generic Server model
   /*******************************************************/
   {id: 0x1000, name: 'Generic OnOff Server' ,
   SupportedRxMessages: [
     0x8201,
     0x8202,
     0x8203,
   ]},
   {id: 0x1002, name: 'Generic Level Server' ,
   SupportedRxMessages: [
     0x8205,
     0x8206,
     0x8207,
     0x8209,
     0x820A,
     0x820B,
     0x820C,
   ]},

   /*******************************************************/
   //Generic Client model
   /*******************************************************/
   {id: 0x1001, name: 'Generic OnOff Client',
   SupportedRxMessages: [
   ]},
   {id: 0x1003, name: 'Generic Level Client' ,
   SupportedRxMessages: [
   ]},

];





Models.GetByID = function (ModelID) {
  var id = (typeof(ModelID) === "string")?parseInt(ModelID, 16):ModelID;

  var model = null;
  //
  model = Models.find(function (obj) {
    return obj.id == id;
  });

  if(model == null){
    console.log("Models.GetByID NOT FOUND: " + ModelID);
    return null;
  }

  console.log("Found model : " + model.name);
  return model;
}
