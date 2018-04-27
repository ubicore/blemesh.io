




var prov_trace = {};


var msg;


prov_trace.initialize = function () {
  msg = document.getElementById('provision_message');
};


prov_trace.clearMessage = function () {
    console.log("clearMessage");
    msg.style.color = "#ffffff";
    msg.innerHTML = "&nbsp;";
    msg.hidden = false;
};

prov_trace.showMessage = function (msg_text) {
    msg.style.color = "#ffffff";
    msg.innerHTML = msg_text;
    document.getElementById('provision_message').hidden = false;
};

prov_trace.showMessageRed = function (msg_text) {
    msg.style.color = "#ff0000";
    msg.innerHTML = msg_text;
    document.getElementById('provision_message').hidden = false;
};
