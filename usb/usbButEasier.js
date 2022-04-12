const {spawn} = require('child_process');
const net = require('net');
const port = 6000;
const host = 'localhost';

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

server.on("connection", (socket) => { 
  console.log("new client connection is made", socket.remoteAddress + ":" + socket.remotePort); 
  socket.on("data", (data) => { 
    var r = data.toString();
    try{
      if(r.split(":")[0] == "0"){
        // DEV ID
        console.log("Connected to " + r);
        // look at getting the data from a selected object
        socket.write(Buffer.from('1:0001*-*0002*-*helloworld!!!')); 
      }else if(r.split(":")[0] == "1"){
        console.log("DATA RESPONSE: " + r);
        socket.write(Buffer.from('2:END')); 
        socket.destroy();
      }
    }catch(e){
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