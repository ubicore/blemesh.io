






/***************************************************************************************************/
var Config = {};

Config.Composition_Data_Status = function (parameters){
  //example data page 0 parsing, See : p330
  //8.10 Composition Data sample data
  //4.2.1 Composition Data
  //4.2.1.1 Composition Data Page 0
  console.log('Config.Composition_Data_Status processing');
  var PageNumber = parameters.substring(0, 1*2);

  if(PageNumber != 0){
    console.log('Only Page0 is supported');
    return;
  }

  var data = parameters.substring(1*2);
  var data_bytes = utils.hexToBytes(data);
  var view = new DataView(data_bytes);

  //Page0
  var result = {
		CID: '',
		PID: '',
		VID: '',
		CRPL: '',
		Features:{
      Relay: false,
      Proxy: false,
      Friend: false,
      Low_Power: false,
    } ,
		Elements:[],
	}

  octet = utils.hexToBytes(data.substring(0, 2*2));
  result.CID = (octet[1] << 8) + octet[0];
  octet = utils.hexToBytes(data.substring(2*2, 4*2));
  result.PID = (octet[1] << 8) + octet[0];
  octet = utils.hexToBytes(data.substring(4*2, 6*2));
  result.VID = (octet[1] << 8) + octet[0];
  octet = utils.hexToBytes(data.substring(6*2, 8*2));
  result.CRPL = (octet[1] << 8) + octet[0];
  octet = utils.hexToBytes(data.substring(8*2, 10*2));
  var Features = (octet[1] << 8) + octet[0];

  result.Features.Relay = (Features & (1<<0))?true:false;
  result.Features.Proxy = (Features & (1<<1))?true:false;
  result.Features.Friend = (Features & (1<<2))?true:false;
  result.Features.Low_Power = (Features & (1<<3))?true:false;


  // Loc 2 Contains a location descriptor
  // NumS 1 Contains a count of SIG Model IDs in this element
  // NumV 1 Contains a count of Vendor Model IDs in this element
  // SIG Models variable Contains a sequence of NumS SIG Model IDs
  // Vendor Models variable Contains a sequence of NumV Vendor Model IDs
  //SIG Model ID (16-bit) or a Vendor Model ID (32-bit)
  data = data.substring(10*2);

  while (data.length) {
    var Element = {
      Loc: 0,
      NumS: '',
      NumV: '',
      SIG_Models:[],
      Vendor_Models:[],
    }

    //Element description header
    octet = utils.hexToBytes(data.substring(0, 2*2));
    Element.Loc = (octet[1] << 8) + octet[0];
    Element.NumS = data.substring(2*2, 3*2);
    Element.NumV = data.substring(3*2, 4*2);
    // Element.NumS = utils.hexToBytes(data.substring(2*2, 3*2))[0];
    // Element.NumV = utils.hexToBytes(data.substring(3*2, 4*2))[0];
    data = data.substring(4*2);

    //SIG_Models
    for (var i = 0; i < Element.NumS; i++) {
      Element.SIG_Models[i] = data.substring(0, 2*2);
      data = data.substring(2*2);
    }

    //Vendor_Models
    for (var i = 0; i < Element.NumV; i++) {
      Element.Vendor_Models[i] = data.substring(0, 4*2);
      data = data.substring(4*2);
    }
    //
    result.Elements.push(
      Element
    );
  }
    console.log('Composition_Data_Status Page 0 : ' + JSON.stringify(result));
}
