const { SerialPort } = require('serialport');

var getPortsList = (callback) => {
    var portsList = [];
  
    SerialPort.list((err, ports) => {
      ports.forEach((port) => {
        portsList.push(port.comName);
      });
  
      callback(null, portsList);
    });
  };


async function startUSB(){
    getPortsList((err, ports) => {
        console.log(ports);
    });
}

module.exports = startUSB;