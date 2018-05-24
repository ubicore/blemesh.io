

var app = {};


 app.start = function () {
   connection.initialize();
   prov_trace.initialize();
   db.initialize();
   IHM.initialize();
}


 app.GetPage0 = function () {
     if (!connected) {
         return;
     }
     if (!has_mesh_proxy_data_in) {
         IHM.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
         console.log("Error: mesh_proxy_data_in characteristic not discovered");
         return;
     }
     //Get Page0
     Config.IN.Composition_Data_Get(0)
     .then(() =>{
       console.log("GetPage0 FINISH WITH SUCCESS !");
       db.Save();
     })
     .catch(error => {
         IHM.showMessageRed(error);
         console.log('ERROR: ' + error);
     });
  }

  app.SendAppKey = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      IHM.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }
    //
    //Add AppKeyAdd
    Config.IN.AppKeyAdd(NetKey.index, AppKey.index, AppKey.key)
    .then(() =>{
      console.log("SendAppKey FINISH WITH SUCCESS !");
    })
    .catch(error => {
      IHM.showMessageRed(error);
      console.log('ERROR: ' + error);
    });
  }


  app.PublicationSet = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      IHM.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '',
      //          PublishAddress: 'ABCDEF0000000001ABCDEF0000000001',
      PublishAddress: 'c000',
      //AppKeyIndex: 0,
      // CredentialFlag: 0,
      // PublishTTL: 0,
      // PublishPeriod : 0,
      // PublishRetransmitCount : 0x7,
      // PublishRetransmitIntervalSteps : 0x10,
      ModelIdentifier: '1001',//Client : switch
      //      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;
    parameters.AppKeyIndex = AppKey.index;


    Config.IN.Model_Publication_Set(parameters)
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS !");
    })
    .catch(error => {
      IHM.showMessageRed(error);
      console.log('ERROR: ' + error);
    });
  }

  app.SubscriptionAdd = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      IHM.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '0b0c',
      Address: 'c000',
      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;

    Config.IN.Model_Subscription_Add(parameters)
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS ! " + parameters.ElementAddress);
      parameters.ElementAddress = '0101';
      return Config.IN.Model_Subscription_Add(parameters)
    })
    .then(() =>{
      console.log("PublicationSet FINISH WITH SUCCESS ! " + parameters.ElementAddress);
    })
    .catch(error => {
      IHM.showMessageRed(error);
      console.log('ERROR: ' + error);
    });

  }

  app.AppBind = function () {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      IHM.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }

    var parameters = {
      //ElementAddress: '0b0c',
      //AppKeyIndex: 0,
      ModelIdentifier: '1000',//Server : lanp
    }
    parameters.ElementAddress = Node.dst;
    parameters.AppKeyIndex = AppKey.index;

    Config.IN.Model_App_Bind(parameters)
    .then(() =>{
      console.log("AppBind FINISH WITH SUCCESS ! " + parameters.ElementAddress);

      var NewDST = utils.toHex(parseInt(Node.dst, 16) + 1 , 2);
      parameters.ElementAddress =  NewDST;
      return Config.IN.Model_App_Bind(parameters)
    })
    .then(() =>{
      console.log("AppBind FINISH WITH SUCCESS ! " + parameters.ElementAddress);
    })
    .catch(error => {
      IHM.showMessageRed(error);
      console.log('ERROR: ' + error);
    });

  }
