
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

ModelElmt.renderModels = function (Elements, root) {
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

ModelElmt.Populate_GroupBox = function ($li) {
  var ElementIndex = $li.attr("ElementIndex");
  var modelId = $li.attr("modelId");
  console.log('ElementIndex->modelId : ' + ElementIndex + '->' + modelId);
  //
  Element.RefreshModelPublicationAndSubscription(ElementIndex, modelId);

  //TODO :
  //Populate Box with Element Model Publication and subscription
  //create an IHM function
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

                      ModelElmt.Populate_GroupBox($li);
                      //
                      //TODO :
                      //Config_Model_Publication_Get
                      //Config_SIG_Model_Subscription_Get
                      //Config_Vendor_Model_Subscription_Get

                      //Then DO :
                      // {id: 0x801B, size: 2, name: 'Config_Model_Subscription_Add', TX_fct: null, RX_fct: null, callback: null},
                      // {id: 0x801C, size: 2, name: 'Config_Model_Subscription_Delete', TX_fct: null, RX_fct: null, callback: null},
                      // {id: 0x801D, size: 2, name: 'Config_Model_Subscription_Delete_All', TX_fct: null, RX_fct: null, callback: null},
                      // {id: 0x801E, size: 2, name: 'Config_Model_Subscription_Overwrite', TX_fct: null, RX_fct: null, callback: null},

                    }
                });
            }
        });
    }
};
//MenuTree.walk();
