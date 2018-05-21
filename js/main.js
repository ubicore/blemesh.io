
addEventListener('DOMContentLoaded', function() {
    var btn_provision = document.getElementById('btn_provision');
    btn_provision.addEventListener('click', function() {
        prov_app.start();
    });

    var btn_scan = document.getElementById('btn_scan');
    btn_scan.addEventListener('click', function() {
        app.findProxies();
    });

    var btn_connection = document.getElementById('btn_connection');
    btn_connection.addEventListener('click', function() {
        app.connection();
    });

    var btn_submit = document.getElementById('btn_submit');
    btn_submit.addEventListener('click', function() {
        app.submitPdu();
    });

    var btn_page0 = document.getElementById('btn_page0');
    btn_page0.addEventListener('click', function() {
        app.GetPage0();
    });

    var btn_AppKey = document.getElementById('btn_AppKey');
    btn_AppKey.addEventListener('click', function() {
        app.SendAppKey();
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
  
})
