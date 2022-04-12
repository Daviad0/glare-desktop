const {spawn} = require('child_process');
const net = require('net');
const port = 1337;
const host = 'localhost';

const server = net.createServer();

// >> 0:DETAILS
// << 0:DEVID
// >> 1:REQUEST
// << 1:RESPONSE

server.on("connection", (socket) => { 
  console.log("new client connection is made", socket.remoteAddress + ":" + socket.remotePort); 
  socket.on("data", (data) => { 
    var r = data.toString();
    try{
      if(r.split(":")[0] == "0"){
        // DEV ID
        console.log("Connected to " + r);
      }else if(r.split(":")[0] == "1"){
        console.log("DATA RESPONSE: " + r);

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
  socket.write('0:DETAILS'); 
}); 
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port +'.');
});

var child = undefined;

function setupPort(){
    console.log("Attempting to launch childprocess to setup port");

      child = spawn('adb', ['forward', 'tcp:1337', 'tcp:1337']);
      child.on('exit', function(code, signal){
        console.log("[ADB] Child process exited with code " + code + " and signal " + signal);
      });
      child.on('error', function(err){
        console.log("[ADB] Error: " + err);
      });
      child.on('close', function(code, signal){
        console.log("[ADB] Child process closed with code " + code + " and signal " + signal);
      });
      child.stdout.on('data', function(data){
        
        console.log("[ADB] " + data);
      });
      child.stderr.on('data', function(data){
        if(!data.includes("buffer overflow")){
          console.warn("[ADBERROR] " + data);
          mainWindow.webContents.send("ADBERROR", {});
        }
        
      });
}

function setupWatch(){
    setupPort();
}

module.exports = setupWatch;