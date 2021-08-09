var noble = require('@abandonware/noble')
const notify = require('./updateHandler')

var accessibleServiceId = '862';
var writingCharacteristicId = '1'
var uniqueIdDescriptor = 'a404';

var readyToScan = false;
const io = require("socket.io-client")
const socket = io.connect("http://localhost:4004", {reconnect: true});
socket.on("connect", function(instance){
  socket.emit('Ping');
})

function debug(object){
    socket.emit("externalDebug", object);
console.log(object);
}

socket.on('Pong', () => {
  //console.log('pong')
  socket.emit('Ping');
})

noble.on('stateChange', function(state) {
	debug(state);
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

function sendMessageAndCheck(requestInstance, characterisic){
	debug("Writing?")
    var dataLength = 450;
    var teamIdentifier = "0862";
    var protocolTo = requestInstance["protocolTo"];
    var protocolFrom = requestInstance["protocolFrom"];
    var responseExpected = "1"
    var communicationId = requestInstance["communicationId"];
    var bufferedData = Buffer.from(requestInstance["data"])
    var headerBuffer = Buffer.from(teamIdentifier + deviceId + protocolTo + protocolFrom + (requestInstance["currentMessage"] == requestInstance["totalMessages"] ? "e" : "a") + i.toString().padStart(4, "0") + responseExpected + communicationId, "hex")                                       
    var sendBuffer = Buffer.concat([headerBuffer, bufferedData.slice((dataLength*requestInstance["currentMessage"]), (dataLength*(requestInstance["currentMessage"]+1)))]);
	debug("Trying more writing")    
characterisic.write(sendBuffer, true, function(err){
        debug("Wrote Message " + requestInstance["currentMessage"]);
        if(requestInstance["currentMessage"] != requestInstance["totalMessages"]){
            // can go to next message
            currentRequests[currentRequests.findIndex(el => el.deviceId == requestInstance["deviceId"])].currentMessage = requestInstance["currentMessage"] + 1;
            sendMessageAndCheck(currentRequests.find(el => el.deviceId == requestInstance["deviceId"]), characterisic);
        }
    });
}


//exports.startScanning = function(alreadyExisted){
debug("READ")
    
    
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
        var toSendDevices = []
        discoveredDevices.forEach((dev) => {
            // NEED TO EDIT PROTOCOL SO DEVICE GIVES OFF SPECIAL ID
            toSendDevices.push({
                id: dev.id,
                name: dev.advertisement.localName
            });
        })
        socket.emit('sendArea', toSendDevices);
    });
    
    var serviceCheck = 0;
    var discovered = 0;
debug("DISCOVERING")
    noble.on('discover', function(peripheral){
    debug("DISCOVERED")
    var deviceId = peripheral.advertisement.localName.substring(3);
        if(discoveredDevices.findIndex((el) => el.advertisement.localName.substring(3) == deviceId) == -1 && existingDevices.findIndex((el) => el._id == deviceId) == -1){
            discoveredDevices.push(peripheral);
            socket.emit("newDevice", { name: peripheral.advertisement.localName });
            debug("Adding new device to discovered!");
            debug(peripheral);
        }
        
        if(pendingOutRequests.findIndex((el) => el.deviceId == deviceId) != -1){
            // something in the queue exists
            var requestToHandle = pendingOutRequests.splice(pendingOutRequests.findIndex((el) => el.id == deviceId), 1)[0];
            debug("Connecting to queue item");
            
            debug(requestToHandle)
            currentRequests.push(requestToHandle);
            peripheral.connect(function(err){
                var characteristicsAlreadyFound = false;
                serviceId = setInterval(function(){peripheral.discoverAllServicesAndCharacteristics(function(error, services,characteristics){
                    if(characteristics != undefined && characteristics != []){
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
                                        debug("Data received: " + data + " " + isNotification);
                                    })
                                    characterisic.subscribe(function(err){
                                        debug("Subscribed")
 var dataLength = 450;
                                         var bufferedData = Buffer.from(requestToHandle["data"])                                   
                                        var numberOfMessages = Math.ceil(bufferedData.length/dataLength)
                                        debug(numberOfMessages)
                                        currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].totalMessages = numberOfMessages;
                                        currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].currentMessage = 1;
                                        sendMessageAndCheck(currentRequests.find(el => el.deviceId == requestToHandle["deviceId"]), characterisic);
                                                                 
                                    });
                                    
                                    
                                    //setInterval(function(){console.log("A")}, 500);
                                }
                            }); 
                        }
                    
                    }
                })}, 1000);
            })
                    
        }
        
        
    
        debug(peripheral);
    });
    

    
//}
