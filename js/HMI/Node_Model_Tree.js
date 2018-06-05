
var ModelElmt = function (index, modelId) {
    this.index = index;
    this.data = modelId;
};



ModelElmt.prototype.render = function (root) {
  var model = Models.GetByID(this.data);
  if(model == null) return;

  var $li = $('<li></li>');
  $li.append($('<a></a>', {
    //href: '#',
    text: this.index + ' -> ' + model.name ,
  })).appendTo(root);

  var $ul = $('<ul></ul>').appendTo($li);
  $.each(model.SupportedRxMessages, function (index, opcode) {
    message = OPCODE.FindByID(opcode);
    var $li = $('<li></li>');
    $li.append($('<a></a>', {
      //href: '#',
//      opcode:opcode,
      text: message.name,
    })).appendTo($ul);
    $li.attr("opcode", opcode);
  })
};

ModelElmt.renderModels = function (Elements, root) {
    $.each(Elements, function (ElementIndex, element) {
            $.each(element.SIG_Models, function (index, val) {
                var m = new ModelElmt(ElementIndex, val);
                m.render(root);
            });
            $.each(element.Vendor_Models, function (index, val) {
                var m = new ModelElmt(ElementIndex, val);
                m.render(root);
            });
    });
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
                });
            }
        });
    }
};
//MenuTree.walk();
