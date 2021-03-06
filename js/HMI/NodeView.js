var ModelElmt = function (index, modelId) {
    this.index = index;
    this.modelId = modelId;
};



ModelElmt.prototype.renderSIGModel = function (root) {
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

  var $div = $('<div></div>', {
    id: this.index,
    //  text: this.modelId,
  }).appendTo($li);

  var $ul = $('<ul></ul>').appendTo($div);
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

ModelElmt.prototype.renderVendorModel = function (root) {

  var $li = $('<li></li>', {
    ElementIndex: this.index,
    modelId: this.modelId,
  });
  $li.append($('<a></a>', {
    //href: '#',
    text: this.index + ' -> Vendor Model: 0x' + this.modelId.toString(16) ,
  })).appendTo(root);

  var $div = $('<div></div>', {
    id: this.index,
    //  text: this.modelId,
  }).appendTo($li);
};
/******************************************************/
var NodeView ={};


NodeView.renderElement = function (Elements, root) {
    $.each(Elements, function (ElementIndex, element) {
            $.each(element.SIG_Models, function (index, model) {
                var m = new ModelElmt(ElementIndex, model.ModelIdentifier);
                m.renderSIGModel(root);
            });
            $.each(element.Vendor_Models, function (index, model) {
                var m = new ModelElmt(ElementIndex, model.ModelIdentifier);
                m.renderVendorModel(root);
            });
    });
}

NodeView.ResetElementList = function (List) {
  	List.empty();
}

NodeView.DisplayElementAndModel = function () {
  NodeView.ResetElementList($('#tree'));
  NodeView.renderElement(Node.SelectedNode.composition.Elements, $('#tree'));

  //Get clicked model and message index
  $('#tree li div ul li a').click(function() {
//      var MessageIndex = $(this).parent('li').index();
//      var ElementIndex = $(this).parent('li').parent('ul').parent('li').index();
      var opcode = $(this).parent('li').attr("opcode");
      NodeView.DisplayMessageBox(opcode);
  });

  ModelTree.walk();
  $('ul > li ').has('div').addClass('sub');
}

/*********************************************************/
var ModelTree = {
    // collapse: function (element) {
    //     element.slideToggle(300);
    // },
    walk: function () {
        $('a', '#tree').each(function () {
            var $a = $(this);
            var $li = $a.parent();
            if ($a.next().is('div')) {
                var $div = $a.next();
                $a.click(function (e) {
                    e.preventDefault();

                    $a.toggleClass('active');

                    if($a.hasClass('active')){
                      ModelView.DisplayPublicationAndSubscription($div)
                      .then(() =>{
                        return ModelView.DisplayAppBind($div);
                      })
                      .then(() =>{
                        $div.slideDown();
                        $div.find('ul').slideDown();
                      })
                      .catch(error => {
                        HMI.showMessageRed(error);
                        console.log('ERROR: ' + error);
                      });

                      //
                    } else {
                      $div.slideUp();
                      $div.find('ul').slideUp();
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
