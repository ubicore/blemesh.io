
var Model = {};

Model.RefreshPublicationAndSubscription = function (ElementIndex, modelId) {
  return new Promise((resolve, reject) => {

    var ElementAddress = parseInt(Node.dst , 16) + parseInt(ElementIndex , 16);

    var parameters = {
      ElementAddress: utils.toHex(ElementAddress, 2),
      ModelIdentifier: modelId,
    }
    //
    Config.IN.Model_Publication_Get(parameters)
    .then(() =>{
      console.log("Model_Publication_Get FINISH WITH SUCCESS !");

      if(parameters.ModelIdentifier.length == 2*2){
        Config.IN.SIG_Model_Subscription_Get(parameters)
        .then(() =>{
          console.log("SIG_Model_Subscription_Get FINISH WITH SUCCESS !");
          resolve();
        })
      }
      if(parameters.ModelIdentifier.length == 4*2){
        Config.IN.Vendor_Model_Subscription_Get(parameters)
        .then(() =>{
          console.log("Vendor_Model_Subscription_Get FINISH WITH SUCCESS !");
          resolve();
        })
      }
    })
    .catch(error => {
      reject(error);
    });
  });
}


Model.RefreshAppList = function (ElementIndex, modelId) {
  return new Promise((resolve, reject) => {

    var ElementAddress = parseInt(Node.dst , 16) + parseInt(ElementIndex , 16);

    var parameters = {
      ElementAddress: utils.toHex(ElementAddress, 2),
      ModelIdentifier: modelId,
    }
    //
    if(parameters.ModelIdentifier.length == 2*2){
      Config.IN.SIG_Model_App_Get(parameters)
      .then(() =>{
        console.log("SIG_Model_App_Get FINISH WITH SUCCESS !");
        resolve();
      })
    }
    if(parameters.ModelIdentifier.length == 4*2){
      Config.IN.Vendor_Model_App_Get(parameters)
      .then(() =>{
        console.log("Vendor_Model_App_Get FINISH WITH SUCCESS !");
        resolve();
      })
    }
  })
  .catch(error => {
    reject(error);
  });
}
