const {spawn} = require('child_process');
const net = require('net');
const port = 6000;
const host = 'localhost';

const {io} = require('socket.io-client');
const mSocket = io.connect("http://localhost:4004", {reconnect: true});
mSocket.on("connect", function(instance){
  mSocket.emit('Ping');
})


const server = net.createServer(function(){
  console.log("[SERVER] Started");
});

// >> 0:DETAILS
// << 0:DEVID
// >> 1:REQUEST
// << 1:RESPONSE

// REQUEST: 
/*

  use *-* as delimeters

  P-TO: 0001
  P-FROM: 0002
  P-DATA: hello

 */

var pendingRequests = [];

mSocket.on('addToQueue', (request) => {
  pendingRequests.push(request);
});

var requestToHandle = undefined;


server.on("connection", (socket) => { 
  console.log("new client connection is made", socket.remoteAddress + ":" + socket.remotePort); 
  socket.on("data", (data) => { 
    var r = data.toString();
    try{
      if(r.split(":")[0] == "0"){
        // DEV ID
        r = r.substring(2);
        console.log("USB Connected to " + r);
        // look at getting the data from a selected object
        if(pendingRequests.filter(p => p.deviceId == r).length > 0){
          requestToHandle = pendingRequests.splice(pendingRequests.findIndex((el) => el.deviceId == r), 1)[0];
          socket.write(Buffer.from("1:" + requestToHandle.protocolTo + "*-*" + requestToHandle.protocolFrom + "*-*" + requestToHandle.data));
          requestToHandle.data = "";
        }else{
          requestToHandle = {
            deviceId : r,
            protocolTo : "a111",
            protocolFrom : "c203",
            data : ""
          }
          socket.write(Buffer.from("1:" + "a111" + "*-*" + "c203" + "*-*" + "USB Automatically Got Data..."));
        }
        
      }else if(r.split(":")[0] == "1"){
        r = r.substring(2);
        console.log("USB RESPONSE: " + r);
        requestToHandle.data = r;
        mSocket.emit("requestFinished", requestToHandle);


        

        socket.write(Buffer.from('3:HOLD')); 
        
<<<<<<< Updated upstream
      }else{
        r = r.substring(2);
=======
      }else if(r.split(":")[0] == "4"){
        // partial packet

        requestToHandle.data += r.split(":")[1];
      }
      else{
>>>>>>> Stashed changes
        // HOLD
        console.log("USB HOLD: " + requestToHandle.deviceId);
        if(pendingRequests.filter(p => p.deviceId == requestToHandle.deviceId).length > 0){
          requestToHandle = pendingRequests.splice(pendingRequests.findIndex((el) => el.deviceId == requestToHandle.deviceId), 1)[0];
          socket.write(Buffer.from("1:" + requestToHandle.protocolTo + "*-*" + requestToHandle.protocolFrom + "*-*" + requestToHandle.data));
          
        }else{
          socket.write(Buffer.from("3:HOLD"));
        }
      }
    }catch(e){
      console.log(e);
      console.log("ERROR, Data was " + r);
    }
    
  }); 
  socket.once("close", () => { 

    console.log("client connection closed."); 
  }); 
  socket.on("error", (err) => { 
    console.log("client connection got errored out.") 
  }); 
  socket.write(Buffer.from('0:DETAILS')); 
}); 
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port +'.');
});

var child = undefined;
var succeeded = false;

function setupPort(){
    //console.log("Attempting to launch childprocess to setup port");
    //console.log(process.platform);
    child = spawn('adb', ['reverse', 'tcp:6001', 'tcp:6000']);

    
      
      child.on('exit', function(code, signal){
        child = undefined;
        //console.log("[ADB] Child process exited with code " + code + " and signal " + signal);
      });
      child.on('error', function(err){
        
        console.log("[ADB] Error: " + err);
      });
      child.on('close', function(code, signal){
        //console.log("[ADB] Child process closed with code " + code + " and signal " + signal);
      });
      child.stdout.on('data', function(data){
        succeeded = true;
        
        console.log("[ADB] " + data);
      });
      child.stderr.on('data', function(data){
        if(!data.includes("buffer overflow")){
          console.warn("[ADBERROR] " + data);
          
        }
        
      });
}

function setupWatch(){
  setInterval(function(){
    if(child == undefined && !succeeded){
      setupPort();
    }
    
  }, 2000);
    
}

module.exports = setupWatch;