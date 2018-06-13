var ModelElmt = function (index, modelId) {
    this.index = index;
    this.modelId = modelId;
};



ModelElmt.prototype.render = function (root) {
  var model = Models.GetByID(this.modelId);
  if(model == null) return;

  var $li = $('<li></li>', {
    ElementIndex: this.index,
    modelId: this.modelId,
  });
  $li.append($('<a></a>', {
    //href: '#',
    text: this.index + ' -> ' + model.name ,
  })).appendTo(root);

  var $ul = $('<ul></ul>').appendTo($li);
  $.each(model.SupportedRxMessages, function (index, opcode) {
    message = OPCODE.FindByID(opcode);
    var $li = $('<li></li>', {
      opcode: opcode,
    });
    $li.append($('<a></a>', {
      //href: '#',
      text: message.name,
    })).appendTo($ul);
    $li.attr("opcode", opcode);
  })
};

/******************************************************/
var NodeView ={};


NodeView.renderElement = function (Elements, root) {
    $.each(Elements, function (ElementIndex, element) {
            $.each(element.SIG_Models, function (index, model) {
                var m = new ModelElmt(ElementIndex, model.ModelIdentifier);
                m.render(root);
            });
            $.each(element.Vendor_Models, function (index, model) {
                var m = new ModelElmt(ElementIndex, model.ModelIdentifier);
                m.render(root);
            });
    });
}


NodeView.DisplayElementAndModel = function () {
  NodeView.renderElement(Node.SelectedNode.composition.Elements, $('#tree'));

  //Get clicked model and message index
  $('#tree li ul li a').click(function() {
//      var MessageIndex = $(this).parent('li').index();
//      var ElementIndex = $(this).parent('li').parent('ul').parent('li').index();
      var opcode = $(this).parent('li').attr("opcode");
      NodeView.DisplayMessageBox(opcode);
  });

  ModelTree.walk();
  $('ul > li').has('ul').addClass('sub');
}

/*********************************************************/
var ModelTree = {
    collapse: function (element) {
        element.slideToggle(300);
    },
    walk: function () {
        $('a', '#tree').each(function () {
            var $a = $(this);
            var $li = $a.parent();
            if ($a.next().is('ul')) {
                var $ul = $a.next();
                $a.click(function (e) {
                    e.preventDefault();
                    ModelTree.collapse($ul);
                    $a.toggleClass('active');

                    if($a.hasClass('active')){

                      ElementView.DisplayModelPublicationAndSubscription($li);
                      //
                    }
                });
            }
        });
    }
};


/*********************************************************/

NodeView.DisplayMessageBox = function (opcode) {
  console.log('opcode: ' + opcode);
  var message = OPCODE.FindByID(opcode);
  console.log('message: ' + message.name);

  //Empty
	var Input = $("#Command");
  $(Input).empty();

  //append CMD
  Input.append($('<p></p>', {
    value : message.id,
    text: message.name ,
  }))

  //Append Argument selection
  var $select_GroupAddress = ($('<select></select>', {
    id : opcode + "_GroupAddress",
    text: "Select a Group" ,
  })).appendTo(Input);
  //
  GroupView.Refresh($select_GroupAddress);

  //Button Send
  Input.append($('<button></button>', {
    id : message.id,
    text: "Send",
  }))


  var $select_Element = ($('<select></select>', {
    id : opcode + "Element",
    text: "Select a Element" ,
  })).appendTo(Input);

  $.each(Node.SelectedNode.composition.Elements, function (ElementIndex, element) {
    $select_Element.append($('<option></option>', {
      value: ElementIndex,
      text: ElementIndex ,
    }));
  });
}
/*********************************************************/
var PublicationView = function (ElementIndex, ModelFound) {
  this.ElementIndex = ElementIndex;
  this.ModelFound = ModelFound;
};

PublicationView.prototype.render = function ($model) {
  var jsonPretty = JSON.stringify(this.ModelFound.Publication, null, 4);
  var $textarea = $($model).find("#PublicationTextArea");

  if(!$textarea.length){
    $textarea = $('<textarea id="PublicationTextArea" cols=50 rows=15></textarea>').appendTo($model);
  }
  $($textarea).val(jsonPretty);
};

PublicationView.prototype.AddUpdateButton = function ($model) {
  var $button = ($('<button></button>', {
    id : "button",
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
        for(var k in parameters) Message[k]=parameters[k];

        var ElementAddress = parseInt(Node.dst , 16) + parseInt(ElementIndex , 16);
        parameters.ElementAddress = utils.toHex(ElementAddress, 2);
        parameters.PublishAddress = Publication.PublishAddress;
        parameters.AppKeyIndex = Selected_AppKey.index;
        parameters.ModelIdentifier = ModelFound.ModelIdentifier;

        Config.IN.Model_Publication_Set(parameters)
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
      $textarea = $('<textarea id="SubscriptionTextArea" cols=50 rows=15></textarea>').appendTo($model);
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
    db.Save();
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
  var $button = ($('<button></button>', {
    id : "button",
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
          ModelIdentifier: ModelFound.ModelIdentifier,
        }
        Config.IN.Model_Subscription_Delete_All(parameters)
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
/*********************************************************/
var ElementView = {};

ElementView.renderModelPublicationAndSubscription = function ($li, ElementIndex, modelId) {
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
  if(modelId == 4*2){
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

ElementView.DisplayModelPublicationAndSubscription = function ($li) {
  var ElementIndex = $li.attr("ElementIndex");
  var modelId = $li.attr("modelId");
  console.log('ElementIndex->modelId : ' + ElementIndex + '->' + modelId);
  //
  Element.RefreshModelPublicationAndSubscription(ElementIndex, modelId)
  .then(() =>{
    ElementView.renderModelPublicationAndSubscription($li, ElementIndex, modelId);
    db.Save();
  })
  .catch(error => {
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });
}
