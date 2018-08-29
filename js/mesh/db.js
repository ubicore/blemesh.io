



var db = {};
db.data = null;

var localStorageName = 'prov_db.json';

db.initialize = function () {
  // /
  db.Load();

  //
  if(db.data == null){
    db.Create();
  } else {
//    console.log("Loaded db : \n" + JSON.stringify(db.data));
    console.log("Loaded db");
  }

  //TODO : select provisioner
  {
    Provisioner = db.data.provisioners[0];
    Own_SRC = Provisioner.unicastAddress;
    console.log('Select Provisioner: ' + Provisioner.provisionerName + ' @' + Own_SRC);
    //
    Security.Load();
  }
}

db.Create = function () {
     console.log("create a new db ");

     var New_db = {
       meshName : "BT Mesh",
       IVindex  : 5, // 12345677
       IVupdate  : 0,

       NetKeys : [],
       AppKeys : [],
       provisioners : [],
       nodes : [],
       GroupAddress : [
         {
           "name": "unassigned",
           "address": 0x0000,
         }
       ],
       GroupAddress_NextAddress : 0xc000,
     }
     console.log("New_db : \n" + JSON.stringify(New_db));

     //Create empty db
     db.data = New_db;

     //Populate db
     db.Add_Provisionner();
     var NetKey = db.Add_NetKey();
     db.Add_AppKey(NetKey.index);
     db.Reset_GroupAddress();

     console.log("db.data : \n" + JSON.stringify(db.data));
}


db.Load = function () {
  var readed = localStorage.getItem(localStorageName)
  if(readed){
    db.data =  JSON.parse(readed);
  } else {
    console.log("failed to load db");
    db.data = null;
  }
}

db.Import = function () {
  console.log("Import");

  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);
  }
}

function onReaderLoad(event) {
  console.log(event.target.result);
  db.data = JSON.parse(event.target.result);
  console.log("db.data : \n" + JSON.stringify(db.data));

  //
  db.Save();
  db.initialize();
}



db.Export = function () {

    exportToJsonFile(db.data);
  //  download(JSON.stringify(db.data, null, 2), 'json.txt', 'text/plain');
}

db.Add_NetKey = function () {
  if(!db.data){
    return;
  }

  var New_Index = db.data.NetKeys.length;
  console.log("New_NetKey_Index :" + New_Index);

  var NetKey  = Security.NetKey.Create(New_Index);
  db.data.NetKeys.push(NetKey);
  return NetKey;
}


db.Add_AppKey = function (boundNetKeyIndex) {
  if(!db.data){
    return;
  }

  var New_Index = db.data.AppKeys.length;
  console.log("New_AppKey_Index :" + New_Index);

  var AppKey  = Security.AppKey.Create(New_Index, boundNetKeyIndex);
  db.data.AppKeys.push(AppKey);
  return New_Index;
}



db.Add_Provisionner = function () {
  if(!db.data){
    return;
  }

  var New_Index = db.data.provisioners.length;

  var provisioner =
  {
    "provisionerName":"BT Mesh Provisioner",
    "unicastAddress":"0077",
    "allocatedUnicastRange":[
      {
        "lowAddress":"0100",
        "highAddress":"7fff"
      }
    ]
  }

  db.data.provisioners.push(provisioner);

  return New_Index;

}



db.Reset_GroupAddress = function () {
  if(!db.data){
    return;
  }

  db.data.GroupAddress = [];

  var GroupAddress =
  {
    "name": "unassigned",
    "address": 0x0000,
	}

  db.data.GroupAddress.push(GroupAddress);
  db.Save();
}




db.Save = function () {
  console.log("Save db.data");
//  console.log("Save db.data : \n" + JSON.stringify(db.data));
  localStorage.setItem(localStorageName, JSON.stringify(db.data));
}

db.Reset = function () {
  console.log("Delete db.data");
  localStorage.removeItem(localStorageName);
  db.initialize();
}


function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData, null, 2);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


//  function loadJSON(callback) {
//
//     var xobj = new XMLHttpRequest();
//         xobj.overrideMimeType("application/json");
//     xobj.open('GET', 'my_data.json', true); // Replace 'my_data' with the path to your file
//     xobj.onreadystatechange = function () {
//           if (xobj.readyState == 4 && xobj.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//           }
//     };
//     xobj.send(null);
//  }
//
//  function init() {
//  loadJSON(function(response) {
//   // Parse JSON string into object
//     var actual_JSON = JSON.parse(response);
//  });
// }
