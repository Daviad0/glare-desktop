var noble = require('@abandonware/noble')
var crypto = require("crypto");
const notify = require('./updateHandler')

var accessibleServiceId = '862';
var writingCharacteristicId = '1'
var uniqueIdDescriptor = 'a404';

//var instanceEnabled = true;

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

var totalConnections = 0;

var currentPeripheral = null;

function sendMessageAndCheck(requestInstance, characterisic){
    
	//debug("Writing?")
    var dataLength = 200;
    var teamIdentifier = "0862";
    var protocolTo = requestInstance["protocolTo"];
    var protocolFrom = requestInstance["protocolFrom"];
    var responseExpected = "1"
    var communicationId = requestInstance["communicationId"];
    var checksum = crypto.createHash('md5').update(requestInstance["data"]).digest("hex").substring(0,6);
//debug(requestInstance["data"])
    var bufferedData = Buffer.from(requestInstance["data"])
    var headerBuffer = Buffer.from(teamIdentifier + requestInstance["deviceId"] + protocolTo + protocolFrom + responseExpected + (requestInstance["currentMessage"] == requestInstance["totalMessages"] ? "e" : "a") + requestInstance["currentMessage"].toString().padStart(4, "0") + communicationId + checksum, "hex")                                       
    var sendBuffer = Buffer.concat([headerBuffer, bufferedData.slice((dataLength*(requestInstance["currentMessage"]-1)), (dataLength*(requestInstance["currentMessage"])))]);
    //var sendBuffer = Buffer.concat([headerBuffer, bufferedData])
	//debug("Trying more writing")    

    var written = false;

    characterisic.write(sendBuffer, false, function(err){
        written = true;
        //debug(err);
        //debug("Wrote Message " + requestInstance["currentMessage"]);
    });

    setTimeout(function(){
        if(!written){
            debug("Failed to write")
            currentPeripheral.disconnect(function(err){
                debug("Successfully disconnected")
                //currentlyWorking = false;
                noble.stopScanning();
                setTimeout(function(){
                    noble.startScanning([accessibleServiceId], true);
                }, 500);
            });
        }
    },4000);
}

function checkIfFinished(message, peripheral){
    if(message.isEnded == "e"){
        // handle action here
        
        peripheral.disconnect(function(err){
            debug("Successfully disconnected")
            //currentlyWorking = false;
            noble.stopScanning();
            noble.startScanning([accessibleServiceId], true);
        });
currentRequests.splice(currentRequests.findIndex(el => el.deviceId == message.deviceId), 1);
        totalConnections = totalConnections + 1;
        debug(totalConnections + " / " + (totalConnections + concurrency))
        debug(totalConnections)
        socket.emit('requestFinished', message);
    }
}

var concurrency = 0;
var currentlyWorking = false;
function connectAndHandle(peripheral, requestToHandle){
    
    currentlyWorking = true;
    //debug("Checkpoint C: " + requestToHandle.protocolTo)
    if(currentRequests.findIndex((el) => el.deviceId == requestToHandle.deviceId) != -1){
        currentRequests.splice(currentRequests.findIndex((el) => el.deviceId == requestToHandle.deviceId), 1);
    }
    currentRequests.push(requestToHandle);
    //debug("Requests left: " + pendingOutRequests.length)
    peripheral.connect(function(err){
        debug("Connected to " + peripheral.advertisement.localName);
        currentPeripheral = peripheral;
        var characteristicsAlreadyFound = false;
        var myConcurrency = concurrency;
        peripheral.discoverAllServicesAndCharacteristics(function(error, services,characteristics){
            //debug(error)
            //debug("MyC = " + myConcurrency + ", C = " + concurrency);
            if(myConcurrency == concurrency){
                //debug("Requesting Characteristics: " + characteristics.length);
                if(characteristics != undefined && characteristics != []){
                    //clearInterval(serviceId);
                    if(!characteristicsAlreadyFound){
                       
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
                                //debug("Found characteristic!!")
                                characterisic.on("data", function(data, isNotification){
                                    if(Buffer.from(data).toString('hex').substring(18, 19) == "1"){
                                        //debug("Response expected (send next message): " + Buffer.from(data).toString('hex').substring(18, 19))

                                        //tablet should handle if it is the end or not, but not wrong to add redundancy 
                                        currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].currentMessage = currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].currentMessage + 1;
                                        sendMessageAndCheck(currentRequests.find(el => el.deviceId == requestToHandle["deviceId"]), characterisic)
                                    }else{
                                        //debug("Response NOT expected (proper response): " + Buffer.from(data).toString('hex').substring(18, 19))
                                        var rawHexData = Buffer.from(data).toString('hex');
                                        var teamIdentifier = rawHexData.substring(0,4)
                                        var deviceId = rawHexData.substring(4, 10)
                                        var protocolTo = rawHexData.substring(10, 14)
                                        var protocolFrom = rawHexData.substring(14, 18)
                                        var expectedResponse = rawHexData.substring(18,19);
                                        var endOfMessage = rawHexData.substring(19,20)
                                        var messageNumber = rawHexData.substring(20, 24)
                                        var communicationId = rawHexData.substring(24,32)
                                        var totalData = Buffer.from(rawHexData.substring(32), 'hex').toString()
                                        if(pendingInRequests.findIndex(el => el.communicationId == communicationId) == -1){
                                            pendingInRequests.push({
                                                deviceId : deviceId,
                                                protocolTo : protocolTo,
                                                protocolFrom : protocolFrom,
                                                communicationId : communicationId,
                                                data : totalData,
                                                sentAt : Date.now(),
                                                numMessages : 1,
                                                isEnded : endOfMessage
                                            });
                                        }else{
                                            pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)].numMessages = pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)].numMessages + 1
                                            pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)].data = pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)].data + totalData
                                            pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)].isEnded = endOfMessage;
                                        }
                                        checkIfFinished(pendingInRequests[pendingInRequests.findIndex(el => el.communicationId == communicationId)], peripheral);


                                        
                                    }
                                })
                                characterisic.subscribe(function(err){
					 characteristicsAlreadyFound = true;
                                    //debug("Subscribed")
                                    var dataLength = 200;
                                    var bufferedData = Buffer.from(requestToHandle["data"])                                   
                                    var numberOfMessages = Math.ceil(bufferedData.length/dataLength)
                                    //debug(numberOfMessages)
                                    currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].totalMessages = numberOfMessages;
                                    currentRequests[currentRequests.findIndex(el => el.deviceId == requestToHandle.deviceId)].currentMessage = 1;
                                    sendMessageAndCheck(currentRequests.find(el => el.deviceId == requestToHandle["deviceId"]), characterisic);
                                                                
                                });
                                
                                
                                //setInterval(function(){console.log("A")}, 500);
                            }
                        }); 
                    }
                
                }
            }
            
        });
        setTimeout(function(){
            
            if(!characteristicsAlreadyFound){
                //debug("Took too long!")
                concurrency = concurrency + 1
                currentlyWorking = false;
                peripheral.disconnect(function(err){
                    //debug("Successfully disconnected")
                    
                });
                noble.stopScanning();
                noble.startScanning([accessibleServiceId], true);
            }
        }, 2000)
    })
    setTimeout(function(){
        currentlyWorking = false;
    }, 6000);

}


//exports.startScanning = function(alreadyExisted){
debug("READ")
    
    
    function isTaskDone(){
        if(pendingOutRequests.length != 0){
            noble.startScanning([accessibleServiceId], true);
        }
    }
    socket.on('addToQueue', (request) => {
        debug("Checkpoint A: " + request.protocolTo)
        if(discoveredDevices.findIndex((el) => el.advertisement.localName.substring(3) == request.deviceId) == -1){
            pendingOutRequests.push(request);
        }else{
            /*debug("Already found; connecting...")
            connectAndHandle(request, discoveredDevices.find((el) => el.advertisement.localName.substring(3) == request.deviceId));*/
            pendingOutRequests.push(request);
        }
        
        
    });
    


    socket.on('cancelQueue', ()=> {
        pendingOutRequests = [];
    })

    socket.on('restartBLE', ()=> {
        try{
            if(currentPeripheral != null){
                currentPeripheral.disconnect(function(err){
                    debug("Successfully disconnected")
                    //currentlyWorking = false;
                    noble.stopScanning();
                    setTimeout(function(){
                        noble.startScanning([accessibleServiceId], true);
                    }, 500);
                });
            }else{
                noble.stopScanning();
                setTimeout(function(){
                    noble.startScanning([accessibleServiceId], true);
                }, 2000);
            }
        
        }catch(e){
            noble.stopScanning();
            setTimeout(function(){
                noble.startScanning([accessibleServiceId], true);
            }, 2000);
        }
        
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
//debug("DISCOVERING")
    noble.on('discover', function(peripheral){
    
    var deviceId = peripheral.advertisement.localName.substring(3);
    debug("DISCOVERED " + deviceId + " w/ RSSI: " + peripheral.rssi);
    discovered += 1;
        if(discoveredDevices.findIndex((el) => el.advertisement.localName.substring(3) == deviceId) == -1 && existingDevices.findIndex((el) => el._id == deviceId) == -1){
            discoveredDevices.push(peripheral);
            socket.emit("newDevice", { name: peripheral.advertisement.localName });
            //debug("Adding new device to discovered!");
            //debug(peripheral);
        }
        
        if(pendingOutRequests.findIndex((el) => el.deviceId == deviceId) != -1){
            // something in the queue exists
            
            //debug(requestToHandle)
            if(!currentlyWorking){
                var requestToHandle = pendingOutRequests.splice(pendingOutRequests.findIndex((el) => el.deviceId == deviceId), 1)[0];
                //debug("Connecting to queue item");
                debug("Request for " + requestToHandle.deviceId + " going to " + deviceId + " with data of length " + requestToHandle.data.length);
                connectAndHandle(peripheral, requestToHandle);
                
            }
            
                    
        }
        
        
    
        debug(peripheral);
    });
    

    
//}

setInterval(function(){
    debug("--STATUS BELOW--");
    debug(noble.state + "\n" + discovered + " devices have been discovered in the past 10 seconds... A number under 10 might indicate interference if the environment is fully running\n" + pendingOutRequests.length + " requests in the queue\n" + currentPeripheral);
    debug("----------------");
    discovered = 0;
},10000);

