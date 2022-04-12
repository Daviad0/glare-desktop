
const { getDeviceList } = require('usb');
const { bmRequestType, DIRECTION, TYPE, RECIPIENT } = require('bmrequesttype');


const io = require("socket.io-client");
const { Database } = require('sqlite3');
const socket = io.connect("http://localhost:4004", {reconnect: true});
socket.on("connect", function(instance){
  socket.emit('Ping');
})

var UsedDevice = undefined



function trySendData(phaseModel, callback, datastore=undefined){
  if(phaseModel.length > 0){
    UsedDevice.controlTransfer(phaseModel["type"], phaseModel["request"], phaseModel["value"], phaseModel["index"], phaseModel["data"], function(error, data){
      if(error){
        console.log("Error: " + error);
      }else{
        
      }
      console.log("Data: " + data);
      datastore.push(data);
      phaseModel.shift();
      trySendData(phaseModel, function(){}, datastore);
      callback();
      
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

  getMatches(0998, 0999, "HIYA");

  var initPhases = [
    {
      "type" : bmRequestType(DIRECTION.In, TYPE.Vendor, RECIPIENT.Device),
      "request" : 51,
      "value" : 0,
      "index" : 0,
      "data" : Buffer.from([1]),
    },
    {
      "type" : bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device),
      "request" : 52,
      "value" : 0,
      "index" : 2,
      "data" : Buffer.from("Glare Server\0"),
    },
    {
      "type" : bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device),
      "request" : 53,
      "value" : 0,
      "index" : 2,
      "data" : 0x00,
    }
  ]
  UsedDevice.open();
  trySendData(initPhases);
  
}

async function getMatches(reqSend, reqGet, data){
  var phaseModel = [
    {
      "type" : Buffer.from([bmRequestType(DIRECTION.Out, TYPE.Vendor, RECIPIENT.Device)]),
      "request" : 54,
      "value" : 0,
      "index" : 2,
      "data" : 4,
    },
  ]
  console.log(phaseModel);
  trySendData(phaseModel, function(res){
    console.log(res);
  });


}

module.exports = startUSB;