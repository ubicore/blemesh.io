
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
    0x801C,
    0x8021,
    0x801D,
    0x8022,
    0x801E,
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

   /*******************************************************/
   //Generic model
   /*******************************************************/
   {id: 0x1004, name: 'Generic Default Transition Time Server', SupportedRxMessages: []},
   {id: 0x1005, name: 'Generic Default Transition Time Client', SupportedRxMessages: []},
   {id: 0x1006, name: 'Generic Power OnOff Server', SupportedRxMessages: []},
   {id: 0x1007, name: 'Generic Power OnOff Setup Server', SupportedRxMessages: []},
   {id: 0x1008, name: 'Generic Power OnOff Client', SupportedRxMessages: []},
   {id: 0x1009, name: 'Generic Power Level Server', SupportedRxMessages: []},
   {id: 0x100A, name: 'Generic Power Level Setup Server', SupportedRxMessages: []},
   {id: 0x100B, name: 'Generic Power Level Client', SupportedRxMessages: []},
   {id: 0x100C, name: 'Generic Battery Server', SupportedRxMessages: []},
   {id: 0x100D, name: 'Generic Battery Client', SupportedRxMessages: []},
   {id: 0x100E, name: 'Generic Location Server', SupportedRxMessages: []},
   {id: 0x100F, name: 'Generic Location Setup Server', SupportedRxMessages: []},
   {id: 0x1010, name: 'Generic Location Client', SupportedRxMessages: []},
   {id: 0x1011, name: 'Generic Admin Property Server', SupportedRxMessages: []},
   {id: 0x1012, name: 'Generic Manufacturer Property Server', SupportedRxMessages: []},
   {id: 0x1013, name: 'Generic User Property Server', SupportedRxMessages: []},
   {id: 0x1014, name: 'Generic Client Property Server', SupportedRxMessages: []},
   {id: 0x1015, name: 'Generic Property Client', SupportedRxMessages: []},


   /*******************************************************/
   //Lighting model
   /*******************************************************/
   {id: 0x1300, name: 'Light Lightness Server', SupportedRxMessages: []},
   {id: 0x1301, name: 'Light Lightness Setup Server', SupportedRxMessages: []},
   {id: 0x1302, name: 'Light Lightness Client', SupportedRxMessages: []},
   {id: 0x1303, name: 'Light CTL Server', SupportedRxMessages: []},
   {id: 0x1304, name: 'Light CTL Setup Server', SupportedRxMessages: []},
   {id: 0x1305, name: 'Light CTL Client', SupportedRxMessages: []},
   {id: 0x1306, name: 'Light CTL Temperature Server', SupportedRxMessages: []},
   {id: 0x1307, name: 'Light HSL Server', SupportedRxMessages: []},
   {id: 0x1308, name: 'Light HSL Setup Server', SupportedRxMessages: []},
   {id: 0x1309, name: 'Light HSL Client', SupportedRxMessages: []},
   {id: 0x130A, name: 'Light HSL Hue Server', SupportedRxMessages: []},
   {id: 0x130B, name: 'Light HSL Saturation Server', SupportedRxMessages: []},
   {id: 0x130C, name: 'Light xyL Server', SupportedRxMessages: []},
   {id: 0x130D, name: 'Light xyL Setup Server', SupportedRxMessages: []},
   {id: 0x130E, name: 'Light xyL Client', SupportedRxMessages: []},
   {id: 0x130F, name: 'Light LC Server', SupportedRxMessages: []},
   {id: 0x1310, name: 'Light LC Setup Server', SupportedRxMessages: []},
   {id: 0x1311, name: 'Light LC Client', SupportedRxMessages: []}, 

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
