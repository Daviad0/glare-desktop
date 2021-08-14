/*
  Title: ElectronJS
  Author: OpenJS Foundation
  Date: 2/12/2021
  Code Version: 4.2.12
  Code Availaibility: https://www.electronjs.org/
  Notes: This is the library that brings the HTML page to life in a new window instead of the Chrome browser. All content that shows up inside the window is not within Electron's control, and is completely coded by this project's author
*/
var path = require('path');
const {app, BrowserWindow, dialog} = require('electron')
const {ipcMain} = require('electron')
const sudo = require('sudo-prompt');
// ok so BLE is in sudo-prompt
// "this is so gonna work"
// said David Reeves, July 3rd 2021

var channelList = []
class Channel{
  constructor(number, status, update){
    this.number = number;
    this.status = status;
    this.update = update;
  }
}


var initChannelArray = [1,2,3,4,5,6,7,8]
initChannelArray.forEach(el => {
  var newChannel = new Channel(el, "Ready", undefined);
  channelList.push(newChannel);
});

var Datastore = require('nedb');

var db = {};
db.entries = new Datastore({ filename: 'storage/entries.db', autoload: true });
db.devices = new Datastore({ filename: 'storage/devices.db', autoload: true });
db.requests = new Datastore({ filename: 'storage/requests.db', autoload: true });
db.schemas = new Datastore({ filename: 'storage/schemas.db', autoload: true });
db.competitions = new Datastore({ filename: 'storage/competitions.db', autoload: true });
db.entries.loadDatabase();
db.devices.loadDatabase();
db.requests.loadDatabase();
db.schemas.loadDatabase();
db.competitions.loadDatabase();

const fs = require('fs')
fs.readFile('./testSchema.json', 'utf8' , (err, data) => {
  db.schemas.insert({
    _id: '76628abc',
    prettyName: 'Infinite Recharge',
    usedFor: '2020 - 2021 Season',
    createdAt: Date.now(),
    dataHash: 'aaaabbbb',
    finalDataJSON: data
  }, function(err, newDoc){
    console.log(newDoc)
    console.log("Document added!");
  })
})

db.requests.insert({
  deviceId : "A00000",
  protocolTo : "A111",
  protocolFrom : "0998",
  communicationId : "12345678",
  data : "Hello world!",
  sentAt : Date.now()
})

db.competitions.insert({
  _id: 'davEnv4004',
  prettyName: "David's Test Environment",
  acceptedSchemas: ['17823788']
}, function(err, newDoc){
  console.log(newDoc)
  console.log("Document added!");
});
/*
  Title: FS (File System)
  Author: NPM Js
  Date: 2/12/2021
  Code Version: Built in w/ NodeJS
  Code Availaibility: https://nodejs.org/en/
*/




//resetServerMem();

const express = require('express')
// app instance foer the webserver
const sapp = express();
const http = require('http').Server(sapp);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('Ping', () => {
    socket.emit("Pong");
  });
  
  socket.on('channelUpdate', (channelNumber, status, details) => {
    console.log("Channel " + channelNumber + " had its status changed to " + status);
    var chanIndex = channelList.findIndex(ch => ch.number == channelNumber);
    channelList[chanIndex].status = status;
    channelList[chanIndex].update = Date.now();
    mainWindow.webContents.send('channelUpdate', {"status" : status, "details" : details, "channelNumber" : channelNumber});
  });

  socket.on('addDocument', (addTo, objectToAdd) => {
    db[addTo].insert(objectToAdd, function(err, newDoc){
      console.log("New document added to " + addTo + " with id " + newDoc._id + " at " + new Date().toTimeString());
    });
  });

  socket.on('requestTrack', (requestObject) => {
    db.requests.insert(requestObject, function(err, newDoc){
      console.log("New document added to requests with id " + newDoc._id + " at " + new Date().toTimeString());
      mainWindow.webContents.send('addRequest', newDoc);
    })
  });
  socket.on('metadataTest', (object) => {
    console.log(object);
  });
  socket.on('sendArea', (discoveredDevices) => {
 discoveredDevices.forEach((dev) => {
      db.devices.findOne({ _id: dev.id }, function(err, res){
        if(res == null){
          // need to create
          var newDbObject = {
            _id : dev.id,
            deviceName : dev.name == "Glare" ? "Glare Ready Device" : "Unnamed Device",
            lastCommunicated : Date.now(),
            onLineup : false
          }
          db.devices.insert(newDbObject, function(err, newDoc){});
        }
      })
    });
  })
  socket.on("newDevice", (device) => {
    db.devices.findOne({ _id : device.name.substring(3)}, function(err,res){
      if(res == null){
        var newDbObject = {
          _id : device.name.substring(3),
          deviceName : "Glare Ready Device (" + device.name + ")",
          lastCommunicated : new Date().toTimeString(),
          onLineup : false
        }
        db.devices.insert(newDbObject, function(err, newDoc){
          console.log(newDoc);
        });
      }
    })
  })
  socket.on("externalDebug", (object) => {
    console.log(object);
  });
});


http.listen(4004, () => {
  console.log('listening on *:4004');
});



/*
  Title: Socket.IO (Client)
  Author: rauchg
  Date: 2/12/2021
  Code Version: 3.1.1
  Code Availaibility: https://github.com/socketio/socket.io-client
  Notes: Paired with the Socket.IO package on app.js through port 3000
*/

/*
  Title: Request
  Author: fredkschott
  Date: 2/12/2021
  Code Version: 2.88.2
  Code Availaibility: https://www.npmjs.com/package/request
  Notes: Depreciated, but still used
*/
const request = require('request')
/*
  Title: node-machine-id
  Author: automation-stack
  Date: 2/12/2021
  Code Version: 1.1.12
  Code Availaibility: https://www.npmjs.com/package/node-machine-id
*/
const machineId = require('node-machine-id');
const { data } = require('jquery');




// main window that actually allows the user to interact with the show
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }, 
    title : 'Glare Desktop',
    show: false
    
  })
  //mainWindow.setFullScreen(true)

  var fileToLoad = "views/server.html"
  mainWindow.loadFile(fileToLoad)
  mainWindow.isMenuBarVisible(false)
  
  mainWindow.on('closed', function () {
    mainWindow = null
  });
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
    //mainWindow.webContents.send("addRequest", {"channelNumber" : 1,"idCode" : "12345678", "timestamp" : "12:57:05 PM", "direction": "In", "requestType" : "UPDATE (12345678)", "successful" : true})
    
var btpath = path.join(__dirname, "bluetooth/hostingBLE.js")
  console.log(btpath);
  var options = {
    name: "Glare Bluetooth Service"
  }
  sudo.exec('node ' + btpath, options, 
    function(err, stdout, stderr){
      if(err){
console.log(err);
}
      console.log('stdout: ' + stdout)
    }
  );
  });
  
  
}



ipcMain.on('newRequest', (event, args) => {
  console.log(args);
  io.emit('addToQueue', {
    deviceId : args["deviceId"],
    protocolTo : args["protocolTo"],
    protocolFrom : args["protocolFrom"],
    communicationId : args["communicationId"],
    data : args["data"],
    sentAt : args["sentAt"]
  });
  db.requests.insert({
    deviceId : args["deviceId"],
    protocolTo : args["protocolTo"],
    protocolFrom : args["protocolFrom"],
    communicationId : args["communicationId"],
    data : args["data"],
    sentAt : args["sentAt"]
  }, function(err, doc) {
    console.log("New document added to requests with id " + doc._id + " at " + new Date().toTimeString());
    mainWindow.webContents.send('addRequest', doc);
    
  });
});

ipcMain.on('getChannelStatus', (event, args) => {
  db.requests.find({}, function(err, docs){
    mainWindow.webContents.send('bulkAddRequest', {'bulkContents' : docs})
  });
  if(args['all'] == true){
    channelList.forEach(ch => {
      mainWindow.webContents.send('channelUpdate', {"status" : ch.status, "details" : {}, "channelNumber" : ch.number});
    });
  }else{
    var channelIndex = channelList.findIndex(ch => ch.number == args["channelNumber"])
    mainWindow.webContents.send('channelUpdate', {"status" : channelList[channelIndex].status, "details" : {}, "channelNumber" : channelList[channelIndex].number});
  }
});

ipcMain.on('addCompetition', (event, args) => {
  db.competitions.insert(args["competition"], function(err, newDoc){
    mainWindow.webContents.send('competitionStatus', {"success" : (err ? false : true), "instance" : newDoc})
  });
});

// when ElectronJS is ready, start up the role selection window
app.on('ready', createWindow)

// event for user resize (if allowed by the window definition)
app.on('resize', function(e,x,y){
  mainWindow.setSize(x, y);
});

// quit when every window is closed, except if on macintosh (due to library issues)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    //socket.emit('destroyThyself');
    //io.server.close();
    app.quit();
  }
})

// if there is no mainWindow on activation (other than the first runtime), start up the role window
app.on('activate', function () {
  if (mainWindow === null) {
    letUserSelectRole()
  }
})
