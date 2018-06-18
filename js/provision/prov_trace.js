




var prov_trace = {};


var prov_msg;


prov_trace.initialize = function () {
  console.log("prov_trace.initialize");

  prov_msg = document.getElementById('provision_message');
};


prov_trace.clearMessage = function () {
    console.log("clearMessage");
    prov_msg.style.color = "#ffffff";
    prov_msg.innerHTML = "&nbsp;";
    prov_msg.hidden = false;
};

prov_trace.showMessage = function (msg_text) {
    prov_msg.style.color = "#0000ff";
    prov_msg.innerHTML = msg_text;
    document.getElementById('provision_message').hidden = false;
};

prov_trace.showMessageRed = function (msg_text) {
    prov_msg.style.color = "#ff0000";
    prov_msg.innerHTML = msg_text;
    document.getElementById('provision_message').hidden = false;
};


prov_trace.appendMessage = function (msg_text) {
    prov_msg.style.color = "#0000ff";
    prov_msg.innerHTML += '<br>' + msg_text;
    document.getElementById('provision_message').hidden = false;
};
