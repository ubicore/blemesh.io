



const STATUS_CODE = [
{id: 0x00, size: 1, name: 'Success' , process: null},
{id: 0x01, size: 1, name: 'Invalid Address', process: null},
{id: 0x02, size: 1, name: 'Invalid Model', process: null},
{id: 0x03, size: 1, name: 'Invalid AppKey Index', process: null},
{id: 0x04, size: 1, name: 'Invalid NetKey Index', process: null},
{id: 0x05, size: 1, name: 'Insufficient Resources', process: null},
{id: 0x06, size: 1, name: 'Key Index Already Stored', process: null},
{id: 0x07, size: 1, name: 'Invalid Publish Parameters', process: null},
{id: 0x08, size: 1, name: 'Not a Subscribe Model', process: null},
{id: 0x09, size: 1, name: 'Storage Failure', process: null},
{id: 0x0A, size: 1, name: 'Feature Not Supported', process: null},
{id: 0x0B, size: 1, name: 'Cannot Update', process: null},
{id: 0x0C, size: 1, name: 'Cannot Remove', process: null},
{id: 0x0C, size: 1, name: 'Cannot Bind', process: null},
{id: 0x0E, size: 1, name: 'Temporarily Unable to Change State', process: null},
{id: 0x0F, size: 1, name: 'Cannot Set', process: null},
{id: 0x10, size: 1, name: 'Unspecified Error', process: null},
{id: 0x11, size: 1, name: 'InInvalid Binding', process: null},
{id: 0x12, size: 1, name: 'RFU', process: null},
];

STATUS_CODE.FindByName = function (opcode_name) {
  var obj = OPCODE.find(function (obj) {
    return obj.name == opcode_name;
  });
  return obj;
};
STATUS_CODE.FindByID = function (id) {
  var obj = OPCODE.find(function (obj) {
    return obj.id == id;
  });
  return obj;
};
