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
var ElementView = {};

ElementView.renderModelPublicationAndSubscription = function (ElementIndex, modelId) {
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
    console.log('ModelFound.Publication : ' + JSON.stringify(ModelFound.Publication));
    console.log('ModelFound.SIG_Subscription_List : ' + JSON.stringify(ModelFound.SIG_Subscription_List));
  }
}

ElementView.DisplayModelPublicationAndSubscription = function ($li) {
  var ElementIndex = $li.attr("ElementIndex");
  var modelId = $li.attr("modelId");
  console.log('ElementIndex->modelId : ' + ElementIndex + '->' + modelId);
  //
  Element.RefreshModelPublicationAndSubscription(ElementIndex, modelId)
  .then(() =>{
    ElementView.renderModelPublicationAndSubscription(ElementIndex, modelId);
  })
  .catch(error => {
    HMI.showMessageRed(error);
    console.log('ERROR: ' + error);
  });
}
