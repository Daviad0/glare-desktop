var noble = require('@abandonware/noble')
const notify = require('./updateHandler')

var accessibleServiceId = '0862';
var writingCharacteristicId = '0001'
var uniqueIdDescriptor = 'a404';

var readyToScan = false;
const io = require("socket.io-client")
const socket = io.connect("http://localhost:4004", {reconnect: true});
socket.on("connect", function(instance){
  socket.emit('Ping');
})

function debug(object){
    socket.emit("externalDebug", object);
}

socket.on('Pong', () => {
  //console.log('pong')
  socket.emit('Ping');
})

/*
{
    'MACAddress' : '00:00:00:00:00:00',
    'protocolOut' : '0000',
    'protocolExpected' : '0001',
    'communicationId' : 'ffffffff',
    'dataSent' : 'Hello there!'
}
*/
var pendingOutRequests = []
var pendingInRequests = []
var currentRequests = []
var discoveredDevices = []
var existingDevices = []
var performingTasks = false;
exports.startScanning = function(alreadyExisted){
    noble.on('stateChange', function(state) {
        if (state === 'poweredOn') {
            readyToScan = true;
          //
          // Once the BLE radio has been powered on, it is possible
          // to begin scanning for services. Pass an empty array to
          // scan for all services (uses more time and power).
          //
          //console.log('scanning...');
          noble.startScanning([accessibleServiceId], true);
        }
        else {
            readyToScan = false;
          noble.stopScanning();
        }
    });
    
    function isTaskDone(){
        if(pendingOutRequests.length != 0){
            noble.startScanning([accessibleServiceId], true);
        }
    }
    
    socket.on('addToQueue', (request) => {
        pendingOutRequests.push(request);
    });
    
    socket.on('cancelQueue', ()=> {
        pendingOutRequests = [];
    })
    
    socket.on('checkQueue', (pendingIn, pendingOut) => {
        var objToSendBack = {};
        if(pendingIn){
            objToSendBack['in'] = pendingInRequests;
        }
        if(pendingOut){
            objToSendBack['out'] = pendingOutRequests;
        }
        socket.emit('sendQueue', objToSendBack);
    });
    
    socket.on('checkArea', () => {
        socket.emit('sendArea', discoveredDevices);
    });
    
    var serviceCheck = 0;
    var discovered = 0;
    noble.on('discover', function(peripheral){
        if(discoveredDevices.findIndex((el) => el.id == peripheral.id) == -1 && existingDevices.findIndex((el) => el._id == peripheral.id) == -1){
            discoveredDevices.push(peripheral);
            debug("Adding new device to discovered!");
            debug(peripheral);
        }
        if(pendingOutRequests.findIndex((el) => el.id == peripheral.id) != -1){
            // something in the queue exists
            var requestToHandle = pendingOutRequests.splice(pendingOutRequests.findIndex((el) => el.id == peripheral.id), 1);
            debug("Connecting to queue item");
            
            debug(requestToHandle)
            currentRequests.push(requestToHandle);
            peripheral.connect(function(err){
                var characteristicsAlreadyFound = false;
                serviceId = setInterval(function(){peripheral.discoverAllServicesAndCharacteristics(function(error, services,characteristics){
                    clearInterval(serviceId);
                    if(!characteristicsAlreadyFound){
                        characteristicsAlreadyFound = true;
                        characteristics.forEach(characterisic => {
                            if(characterisic.uuid == writingCharacteristicId){
                                /*characterisic.discoverDescriptors(function(err, descriptors){
                                    console.log("Desc detected!");
                                    descriptors.forEach(desc => {
                                        if(desc.uuid == uniqueIdDescriptor){
                                            desc.readValue(function(err, data){
                                                console.log("Desc data: " + data);
                                            })
                                        }
                                    });
                                })*/
                                debug("Found characteristic!!")
                                characterisic.on("data", function(data, isNotification){
                                    debug("Data received: " + data);
                                })
                                characterisic.subscribe(function(err){
                                    debug("Subscribed")
                                    var teamIdentifier = "0862";
                                    var deviceId = "1234567890ab";
                                    var protocolTo = requestToHandle.protocolTo;
                                    var protocolFrom = requestToHandle.protocolFrom;
                                    var responseExpected = "1"
                                    var communicationId = "83128309";
                                    var bufferedData = Buffer.from(requestToHandle.data)
                                    var numberOfMessages = Math.ceil(bufferedData/480)
                                    for(var i = 0; i < numberOfMessages; i++){
                                        var headerBuffer = Buffer.from(teamIdentifier + deviceId + protocolTo + protocolFrom + (i == (numberOfMessages-1) ? "e" : "a") + i.toString().padStart(4, "0") + responseExpected + communicationId, "hex")
                                        var sendBuffer = Buffer.concat([headerBuffer, bufferedData.slice((480*i), (480*(i+1)))]);
                                        characterisic.write(sendBuffer, true, function(err){
                                            debug("Wrote Message " + (i + 1));
                                        });
                                    }
                                    
                                });
                                
                                
                                //setInterval(function(){console.log("A")}, 500);
                            }
                        }); 
                    }
                    
                })}, 1000);
                
            });
        }
    
        debug(peripheral);
    });
    
    
}
