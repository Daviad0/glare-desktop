
const { getDeviceList } = require('usb');
const { bmRequestType, DIRECTION, TYPE, RECIPIENT } = require('bmrequesttype');

var UsedDevice = undefined



function trySendData(phaseModel){
  if(phaseModel.length > 0){
    UsedDevice.controlTransfer(phaseModel["type"], phaseModel["request"], phaseModel["value"], phaseModel["index"], phaseModel["data"], function(error, data){
      if(error){
        console.log("Error: " + error);
      }else{
        
      }
      console.log("Data: " + data);
      phaseModel.shift();
      trySendData(phaseModel);
      
    });
  }
  
}

async function startUSB(){
  const devices = getDeviceList();

  for (const device of devices) {
      console.log(device); // Legacy device
      if(device.deviceDescriptor.idVendor == 1256){
        console.log("Found Device");
        UsedDevice = device;
        break;
      }
  }


  var initPhases = [
    {
      "type" : bmRequestType(DIRECTION.In, TYPE.Vendor, RECIPIENT.Device),
      "request" : 0x51,
      "value" : 0,
      "index" : 0,
      "data" : Buffer.from([1]),
    },
    {
      "type" : bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device),
      "request" : 0x52,
      "value" : 0,
      "index" : 2,
      "data" : Buffer.from("Glare Server\0"),
    },
    {
      "type" : bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device),
      "request" : 0x53,
      "value" : 0,
      "index" : 2,
      "data" : 0x00,
    }
  ]
  UsedDevice.open();
  trySendData(initPhases);
  
}

module.exports = startUSB;