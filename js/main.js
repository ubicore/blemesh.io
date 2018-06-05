
addEventListener('DOMContentLoaded', function() {
    var btn_provision = document.getElementById('btn_provision');
    btn_provision.addEventListener('click', function() {
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
        HMI.GroupAddress.addItem();
    });
    var btn_GroupAddress_removeItem = document.getElementById('btn_GroupAddress_removeItem');
    btn_GroupAddress_removeItem.addEventListener('click', function() {
        HMI.GroupAddress.removeItem();
    });
    var btn_GroupAddress_empty = document.getElementById('btn_GroupAddress_empty');
    btn_GroupAddress_empty.addEventListener('click', function() {
        HMI.GroupAddress.empty();
    });
})
