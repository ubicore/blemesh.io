

var app = {};


app.start = function () {
  connection.initialize();
  prov_trace.initialize();
  db.initialize();
  HMI.initialize();
}


app.GetPage0 = function () {
  return new Promise((resolve, reject) => {
    if (!connected) {
      reject();
      return;
    }
    if (!has_mesh_proxy_data_in) {
      HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      reject();
      return;
    }
    //Get Page0
    Config.IN.Composition_Data_Get(0)
    .then(() =>{
      console.log("GetPage0 FINISH WITH SUCCESS !");
      db.Save();
      resolve();
    })
    .catch(error => {
      HMI.showMessageRed(error);
      console.log('ERROR: ' + error);
      reject(error);
    });
  });
}

app.GetAppKeyList = function () {
  return new Promise((resolve, reject) => {
    if (!connected) {
      reject();
      return;
    }
    if (!has_mesh_proxy_data_in) {
      HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      reject();
      return;
    }
    //Get AppKey List
    Config.IN.AppKey_Get(Selected_NetKey.index)
    .then(() =>{
      console.log("AppKey_Get FINISH WITH SUCCESS !");
      db.Save();
      resolve();
    })
    .catch(error => {
      HMI.showMessageRed(error);
      console.log('ERROR: ' + error);
      reject(error);
    });
  });
}

app.CheckAndUpdateAppKeyOnNode = function () {
  return new Promise((resolve, reject) => {

    console.log('CheckAndUpdateAppKeyOnNode');
    return app.GetAppKeyList()
    .then( () => {
      //Check, update or add the Selected_AppKey on the node
      var AppKeyIndexFound = Node.SelectedNode.configuration.AppKeys.find(function(AppKey) {
        return  AppKey.index === Selected_AppKey.index;
      })

      if(AppKeyIndexFound != undefined){
        if(JSON.stringify(AppKeyIndexFound) == JSON.stringify(Selected_AppKey)){
          console.log('Selected_AppKey is present on the node and up to date');
          resolve();
        }else{
          console.log('Selected_AppKey is present on the node but not up to date');
          return app.AppKeyUpdate()
          .then( () => {
            resolve();
          })
        }
      } else {
        console.log('Add Selected_AppKey on the node');
        return app.AppKeyAdd()
        .then( () => {
          resolve();
        })
        // .catch(error => {
        //   console.log('ERROR: ' + error);
        //   reject(error);
        // });
      }
    })
    .catch(error => {
      console.log('ERROR: ' + error);
      reject(error);
    });
  });
}

//For test only
app.DisplayNodeModels = function () {
  Node.SelectedNode = db.data.nodes[0];
  NodeView.DisplayElementAndModel();
}


app.AppKeyUpdate = function () {
  return new Promise((resolve, reject) => {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }
    //
    //AppKeyUpdate
    Config.IN.AppKeyUpdate(Selected_AppKey)
    .then(() =>{
      console.log("AppKeyUpdate FINISH WITH SUCCESS !");
      Node.Add_AppKey(Node.SelectedNode, Selected_AppKey);
      resolve();
    })
    .catch(error => {
      HMI.showMessageRed(error);
      console.log('ERROR: ' + error);
      reject(error);
    });
  });
}

app.AppKeyAdd = function () {
  return new Promise((resolve, reject) => {
    if (!connected) {
      return;
    }
    if (!has_mesh_proxy_data_in) {
      HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
      console.log("Error: mesh_proxy_data_in characteristic not discovered");
      return;
    }
    //
    //Add AppKeyAdd
    Config.IN.AppKeyAdd(Selected_AppKey)
    .then(() =>{
      console.log("AppKeyAdd FINISH WITH SUCCESS !");
      Node.Add_AppKey(Node.SelectedNode, Selected_AppKey);
      resolve();
    })
    .catch(error => {
      HMI.showMessageRed(error);
      console.log('ERROR: ' + error);
      reject(error);
    });
  });
}


app.PublicationSet = function () {
  if (!connected) {
    return;
  }
  if (!has_mesh_proxy_data_in) {
    HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
    console.log("Error: mesh_proxy_data_in characteristic not discovered");
    return;
  }

  var parameters = {
    //ElementAddress: '',
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
  parameters.AppKeyIndex = Selected_AppKey.index;


  Config.IN.Model_Publication_Set(parameters)
  .then(() =>{
    console.log("PublicationSet FINISH WITH SUCCESS !");
  })
  .catch(error => {
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });
}

app.SubscriptionAdd = function () {
  if (!connected) {
    return;
  }
  if (!has_mesh_proxy_data_in) {
    HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
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
    console.log("SubscriptionAdd FINISH WITH SUCCESS ! " + parameters.ElementAddress);
    parameters.ElementAddress = '0101';
    return Config.IN.Model_Subscription_Add(parameters)
  })
  .then(() =>{
    console.log("SubscriptionAdd FINISH WITH SUCCESS ! " + parameters.ElementAddress);
  })
  .catch(error => {
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });

}

app.AppBind = function () {
  if (!connected) {
    return;
  }
  if (!has_mesh_proxy_data_in) {
    HMI.showMessageRed("Error: mesh_proxy_data_in characteristic not discovered");
    console.log("Error: mesh_proxy_data_in characteristic not discovered");
    return;
  }

  var parameters = {
    //ElementAddress: '0b0c',
    //AppKeyIndex: 0,
    ModelIdentifier: '1000',//Server : lanp
  }
  parameters.ElementAddress = Node.dst;
  parameters.AppKeyIndex = Selected_AppKey.index;

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
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });

}
