
addEventListener('DOMContentLoaded', function() {
    var btn_provision = document.getElementById('btn_provision');
    btn_provision.addEventListener('click', function() {
      console.log('requestPermission');

      Notification.requestPermission()
      .then(function(result) {
        if (result === 'denied') {
          console.log('Permission wasn\'t granted. Allow a retry.');
          return;
        }
        if (result === 'default') {
          console.log('The permission request was dismissed.');
          return;
        }
        // Do something with the granted permission
          console.log('The permission are granted.');
      })
      .catch(error => {
				console.log('The error is: ' + error);
			});


      prov_app.start();

    });

    var btn_scan = document.getElementById('btn_scan');
    btn_scan.addEventListener('click', function() {
        connection.findProxies();
    });

    var btn_connection = document.getElementById('btn_connection');
    btn_connection.addEventListener('click', function() {
        connection.connection();
    });
    var btn_AppKey = document.getElementById('btn_AppKey');
    btn_AppKey.addEventListener('click', function() {
        app.SendAppKey();
    });

    var btn_DisplayNodeModels = document.getElementById('btn_DisplayNodeModels');
    btn_DisplayNodeModels.addEventListener('click', function() {
        app.DisplayNodeModels();
    });

    var btn_PublicationSet = document.getElementById('btn_PublicationSet');
    btn_PublicationSet.addEventListener('click', function() {
        app.PublicationSet();
    });

    var btn_SubscriptionAdd = document.getElementById('btn_SubscriptionAdd');
    btn_SubscriptionAdd.addEventListener('click', function() {
        app.SubscriptionAdd();
    });

    var btn_AppBind = document.getElementById('btn_AppBind');
    btn_AppBind.addEventListener('click', function() {
        app.AppBind();
    });

    var btn_GroupAddress_addItem = document.getElementById('btn_GroupAddress_addItem');
    btn_GroupAddress_addItem.addEventListener('click', function() {
        GroupView.addItem();
    });
    var btn_GroupAddress_removeItem = document.getElementById('btn_GroupAddress_removeItem');
    btn_GroupAddress_removeItem.addEventListener('click', function() {
        GroupView.removeItem();
    });
    var btn_GroupAddress_reset = document.getElementById('btn_GroupAddress_reset');
    btn_GroupAddress_reset.addEventListener('click', function() {
        GroupView.reset();
    });
})
