
const { getDeviceList } = require('usb');
const { bmRequestType, DIRECTION, TYPE, RECIPIENT } = require('bmrequesttype');

var UsedDevice = undefined

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

  UsedDevice.open();
  UsedDevice.controlTransfer(bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device), 0x51, 0, 0, 0x00, function(error, data){
    if(error){
      console.log("Error: " + error);
    }
    console.log("Data: " + data);
  });
}

module.exports = startUSB;