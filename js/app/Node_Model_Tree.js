
var ModelElmt = function (modelId) {
    this.data = modelId;
};



ModelElmt.prototype.render = function (root) {
    var $li = $('<li></li>');
    var model = Models.GetByID(this.data);
    if(model == null) return;
    var name = model.name;
    $li.append($('<a></a>', {
        href: '#',
        text: name,
        //text: this.data,
    })).appendTo(root);

    var messageroot = $('<ul></ul>').appendTo($li);

    $.each(model.SupportedRxMessages, function (index, opcode) {
      message = OPCODE.FindByID(opcode);
      var $li = $('<li></li>');
      $li.append($('<a></a>', {
          href: '#',
          text: message.name,
        //text: this.data,
      })).appendTo(messageroot);

    })
};

ModelElmt.renderModels = function (Elements, root) {
    $.each(Elements, function (index, element) {
            $.each(element.SIG_Models, function (index, val) {
                var m = new ModelElmt(val);
                m.render(root);
            });
            $.each(element.Vendor_Models, function (index, val) {
                var m = new ModelElmt(val);
                m.render(root);
            });
    });
}

//Menu.renderMenus(aaData, $('#tree'));
//Menu.renderModels(Node.SelectedNode.composition.Elements, $('#ModelTree'));




/*********************************************************/
var ModelTree = {
    collapse: function (element) {
        element.slideToggle(300);
    },
    walk: function () {
        $('a', '#ModelTree').each(function () {
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
