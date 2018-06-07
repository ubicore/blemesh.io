
var Element = {};

Element.RefreshModelPublicationAndSubscription = function (ElementIndex, modelId) {

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
      })
    }
    if(parameters.ModelIdentifier.length == 4*2){
      Config.IN.Vendor_Model_Subscription_Get(parameters)
      .then(() =>{
        console.log("Vendor_Model_Subscription_Get FINISH WITH SUCCESS !");
      })
    }
  })
  .catch(error => {
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });
}