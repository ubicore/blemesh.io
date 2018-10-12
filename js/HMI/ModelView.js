var ModelView = {};

ModelView.renderPublicationAndSubscription = function ($li, ElementIndex, modelId) {
  //Get Data from Element->Model
  var Element = Node.SelectedNode.composition.Elements[ElementIndex];
  var ModelFound = undefined;
  //
  if(modelId.length == 2*2){
    ModelFound = Element.SIG_Models.find(function(model) {
      return model.ModelIdentifier == modelId;
    })
  }
  //
  if(modelId.length == 4*2){
    ModelFound = Element.Vendor_Models.find(function(model) {
      return model.ModelIdentifier == modelId;
    })
  }
  if(ModelFound != undefined){
    console.log('ModelFound : ' + JSON.stringify(ModelFound));
    var m = new PublicationView(ElementIndex, ModelFound);
    m.render($li);
    m.AddUpdateButton($li);

    var m = new SubscriptionView(ElementIndex, ModelFound);
    m.render($li);
    m.AddUpdateButton($li);
  }
}


ModelView.DisplayPublicationAndSubscription = function ($div) {
  return new Promise((resolve, reject) => {
    var $li = $div.parent();
    var ElementIndex = $li.attr("ElementIndex");
    var modelId = $li.attr("modelId");
    console.log('ElementIndex->modelId : ' + ElementIndex + '->' + modelId);
    //
    Model.RefreshPublicationAndSubscription(ElementIndex, modelId)
    .then(() =>{
      ModelView.renderPublicationAndSubscription($div, ElementIndex, modelId);
      db.Save();
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
}

/*********************************************************/
ModelView.renderAppList = function ($li, ElementIndex, modelId) {
  //Get Data from Element->Model
  var Element = Node.SelectedNode.composition.Elements[ElementIndex];
  var ModelFound;
  //
  if(modelId.length == 2*2){
    ModelFound = Element.SIG_Models.find(function(model) {
      return model.ModelIdentifier == modelId;
    })
  }
  //
  if(modelId.length == 4*2){
    ModelFound = Element.Vendor_Models.find(function(model) {
      return model.ModelIdentifier == modelId;
    })
  }
  if(ModelFound != undefined){
    console.log('ModelFound : ' + JSON.stringify(ModelFound));
    var m = new AppListView(ElementIndex, ModelFound);
    m.render($li);
    m.AddUpdateButton($li);
  }
}

ModelView.DisplayAppBind = function ($div) {
  return new Promise((resolve, reject) => {

    var $li = $div.parent();
    var ElementIndex = $li.attr("ElementIndex");
    var modelId = $li.attr("modelId");
    console.log('ElementIndex->modelId : ' + ElementIndex + '->' + modelId);
    //
    Model.RefreshAppList(ElementIndex, modelId)
    .then(() =>{
      ModelView.renderAppList($div, ElementIndex, modelId);
      db.Save();
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
}
/*********************************************************/

var AppListView = function (ElementIndex, ModelFound) {
  this.ElementIndex = ElementIndex;
  this.ModelFound = ModelFound;
};

AppListView.prototype.render = function ($model) {
  var jsonPretty = JSON.stringify(this.ModelFound.AppKeyIndexes, null, 4);
  var $textarea = $($model).find("#AppKeyListTextArea");

  if(!$textarea.length){
      var $label = $("<label>").text('AppKey:').appendTo($model);
      $textarea = $('<textarea id="AppKeyListTextArea" cols=40 rows=3></textarea>').appendTo($model);
  }
  $($textarea).val(jsonPretty);
};

function forEachPromise(items, fn, context) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item, context);
        });
    }, Promise.resolve());
}

function BindItem(CurrentAppKeyIndex, context){

  if(context.lastSend != null){
    console.log('done');
    context.ModelFound.AppKeyIndexes.push(context.lastSend);
  }

  var parameters = {
    ElementAddress:context.ElementAddress,
    AppKeyIndex: CurrentAppKeyIndex,
    ModelIdentifier: context.ModelFound.ModelIdentifier,
  }
  context.lastSend = CurrentAppKeyIndex;
  return Config.IN.Model_App_Bind(parameters)
}


AppListView.prototype.AddUpdateButton = function ($model) {

  var $ExistingButton = $($model).find("#buttonApp");

  if($ExistingButton.length){
    console.log("AppListView $button Already exist ! ");
    return;
  }

  $button = ($('<button></button>', {
    id : "buttonApp",
    text: "Update" ,
  })).appendTo($model);

  var $textarea = $($model).find("#AppKeyListTextArea");
  var ModelFound = this.ModelFound;
  var ElementIndex = this.ElementIndex;

  $button.click(function (e) {
    e.preventDefault();
    var data = null;
    try {
        var AppKeyIndexes = JSON.parse(  $($textarea).val() );
        var ElementAddress = utils.toHex(parseInt(Node.dst , 16) + parseInt(ElementIndex , 16), 2);
        // var parameters = {
        //   ElementAddress: ElementAddress,
        //   ModelIdentifier: ModelFound.ModelIdentifier,
        // }
        //Add each Address in list
        var context = {};
        context.ElementAddress = ElementAddress;
        context.ModelFound = ModelFound;
        context.lastSend = null;

        forEachPromise(AppKeyIndexes, BindItem, context).then(() => {
          if(context.lastSend != null){
            console.log('done');
            context.ModelFound.AppKeyIndexes.push(context.lastSend);
            db.Save();
          }
          console.log("AppKeyIndexes update FINISH WITH SUCCESS ! " + JSON.stringify(AppKeyIndexes));
        })
        .catch(error => {
          HMI.showMessageRed(error);
          console.log('ERROR: ' + error);
        });
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            alert("There was a syntax error. Please correct it and try again: " + error.message);
        }
        else {
            throw error;
        }
    }
  });
};

/*********************************************************/
var PublicationView = function (ElementIndex, ModelFound) {
  this.ElementIndex = ElementIndex;
  this.ModelFound = ModelFound;
};

PublicationView.prototype.render = function ($model) {
  var jsonPretty = JSON.stringify(this.ModelFound.Publication, null, 4);

  var $textarea = $($model).find("#PublicationTextArea");

  if(!$textarea.length){
    var $label = $("<label>").text('Publication:').appendTo($model);
    $textarea = $('<textarea id="PublicationTextArea" cols=40 rows=10></textarea>').appendTo($model);
  }
  $($textarea).val(jsonPretty);
};

PublicationView.prototype.AddUpdateButton = function ($model) {
  var $ExistingButton = $($model).find("#buttonPub");

  if($ExistingButton.length){
    console.log("SubscriptionView $button Already exist ! ");
    return;
  }

  var $button = ($('<button></button>', {
    id : "buttonPub",
    text: "Update" ,
  })).appendTo($model);

  var $textarea = $($model).find("#PublicationTextArea");
  var ModelFound = this.ModelFound;
  var ElementIndex = this.ElementIndex;

  $button.click(function (e) {
    e.preventDefault();
    var data = null;
    try {
        var Publication = JSON.parse(  $($textarea).val() );

        var parameters = {};
        for(var k in Publication) parameters[k]=Publication[k];

        var ElementAddress = parseInt(Node.dst , 16) + parseInt(ElementIndex , 16);
        parameters.ElementAddress = utils.toHex(ElementAddress, 2);
        parameters.ModelIdentifier = ModelFound.ModelIdentifier;

        Config.IN.Model_Publication_Set(parameters)
        .then(() =>{
          return Config.IN.Model_App_Bind(parameters)
        })
        .then(() =>{
          console.log("PublicationSet FINISH WITH SUCCESS ! " + JSON.stringify(parameters));
          ModelFound.Publication = Publication;
          db.Save();
        })
        .catch(error => {
          HMI.showMessageRed(error);
          console.log('ERROR: ' + error);
        });
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            alert("There was a syntax error. Please correct it and try again: " + error.message);
        }
        else {
            throw error;
        }
    }
  });
};
/*********************************************************/

var SubscriptionView = function (ElementIndex, ModelFound) {
  this.ElementIndex = ElementIndex;
  this.ModelFound = ModelFound;
};

SubscriptionView.prototype.render = function ($model) {
  var jsonPretty = JSON.stringify(this.ModelFound.SubscriptionList, null, 4);
  var $textarea = $($model).find("#SubscriptionTextArea");

  if(!$textarea.length){
      var $label = $("<label>").text('Subscription:').appendTo($model);
      $textarea = $('<textarea id="SubscriptionTextArea" cols=40 rows=10></textarea>').appendTo($model);
  }
  $($textarea).val(jsonPretty);
};

function forEachPromise(items, fn, context) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item, context);
        });
    }, Promise.resolve());
}

function SendItem(item, context){

  if(context.lastSend != null){
    console.log('done');
    context.ModelFound.SubscriptionList.push(context.lastSend);
    //db.Save();
  }

  var parameters = {
    ElementAddress:context.ElementAddress,
    Address: item,
    ModelIdentifier: context.ModelFound.ModelIdentifier,
  }
  context.lastSend = item;
  return Config.IN.Model_Subscription_Add(parameters)
}


SubscriptionView.prototype.AddUpdateButton = function ($model) {

  var $ExistingButton = $($model).find("#buttonSub");

  if($ExistingButton.length){
    console.log("SubscriptionView $button Already exist ! ");
    return;
  }

  $button = ($('<button></button>', {
    id : "buttonSub",
    text: "Update" ,
  })).appendTo($model);

  var $textarea = $($model).find("#SubscriptionTextArea");
  var ModelFound = this.ModelFound;
  var ElementIndex = this.ElementIndex;

  $button.click(function (e) {
    e.preventDefault();
    var data = null;
    try {
        var SubscriptionList = JSON.parse(  $($textarea).val() );
        var ElementAddress = utils.toHex(parseInt(Node.dst , 16) + parseInt(ElementIndex , 16), 2);
        var parameters = {
          ElementAddress: ElementAddress,
          AppKeyIndex: Selected_AppKey.index,
          ModelIdentifier: ModelFound.ModelIdentifier,
        }
        Config.IN.Model_Subscription_Delete_All(parameters)
        .then(() =>{
          return Config.IN.Model_App_Bind(parameters)
        })
        .then(() =>{
          console.log("SubscriptionDeleteAll FINISH WITH SUCCESS ! ");
          //Add each Address in list
          var context = {};
          context.ElementAddress = ElementAddress;
          context.ModelFound = ModelFound;
          context.lastSend = null;

          var items = SubscriptionList;
          forEachPromise(items, SendItem, context).then(() => {
            if(context.lastSend != null){
              console.log('done');
              context.ModelFound.SubscriptionList.push(context.lastSend);
              db.Save();
            }
            console.log("SubscriptionAdd FINISH WITH SUCCESS ! " + JSON.stringify(SubscriptionList));
          });
        })
        .catch(error => {
          HMI.showMessageRed(error);
          console.log('ERROR: ' + error);
        });
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            alert("There was a syntax error. Please correct it and try again: " + error.message);
        }
        else {
            throw error;
        }
    }
  });
};
