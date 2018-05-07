






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

  //Page0
  var result = {
		CID: parameters.substring(0, 2*2),
		PID: parameters.substring(2, 4*2),
		VID: parameters.substring(4, 6*2),
		CRPL: parameters.substring(6, 8*2),
		Features:{
      Relay: false,
      Proxy: false,
      Friend: false,
      Low_Power: false,
    } ,
		Elements: parameters.substring(4*2),
	}

  var octet = utils.hexToU8A(parameters.substring(2, 4*2))[0];
  result.Features.Relay = (octet & (1<<0))?true:false;
  result.Features.Proxy = (octet & (1<<1))?true:false;
  result.Features.Friend = (octet & (1<<2))?true:false;
  result.Features.Low_Power = (octet & (1<<3))?true:false;

  console.log('Composition_Data_Status Page 0 : ' + JSON.stringify(result));

}
