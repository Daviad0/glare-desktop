/*
  Title: ElectronJS
  Author: OpenJS Foundation
  Date: 2/12/2021
  Code Version: 4.2.12
  Code Availaibility: https://www.electronjs.org/
  Notes: This is the library that brings the HTML page to life in a new window instead of the Chrome browser. All content that shows up inside the window is not within Electron's control, and is completely coded by this project's author
*/
var path = require('path');
const {app, BrowserWindow, dialog, ipcRenderer} = require('electron')
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
db.scouters = new Datastore({ filename: 'storage/scouters.db', autoload: true });
db.notes = new Datastore({ filename: 'storage/notes.db', autoload: true });
db.flags = new Datastore({ filename: 'storage/flags.db', autoload: true });
db.plans = new Datastore({ filename: 'storage/plans.db', autoload: true });
db.entries.loadDatabase();
db.devices.loadDatabase();
db.requests.loadDatabase();
db.schemas.loadDatabase();
db.competitions.loadDatabase();
db.scouters.loadDatabase();
db.notes.loadDatabase();
db.flags.loadDatabase();
db.plans.loadDatabase();

const fs = require('fs')
fs.readFile('./premade/Rapid React.json', 'utf8' , (err, data) => {
  db.schemas.insert({
    _id: '20220862',
    prettyName: 'Rapid React (2022)',
    usedFor: '2021 - 2022 Season',
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

db.scouters.insert({
  Name : "David Reeves",
  Score : 0,
  LastUsed : Date.now(),
  Banned : false
})

db.competitions.insert({
  _id: 'davEnv4004',
  prettyName: "David's Test Environment",
  acceptedSchemas: ['17823788'],
  location: "David's Basement",
  datespan: "August 23rd to August 40th"
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
          db.devices.find({}, function(err, docs){
            mainWindow.webContents.send("allDevices", {"devices" : docs});
          })
        });
      }
    })
  })
  socket.on("externalDebug", (object) => {
    console.log(object);
  });
  socket.on("requestFinished", (message) => {
    
    switch(message.protocolFrom){
      case "0001":
        console.log("[BLE] Well SOMEONE didn't read the instructions")
        break;
      case "0998":
        console.log("[BLE] Pong!")
        break;
      case "0999":
        console.log(message.data);
        break;
      case "a101":
        console.log("[BLE] Locking state: " + message.data)
        break;
      case "a111":
        console.log("[BLE] HR has to deal with the following complaints: " + message.data)
        break;
      case "a201":
        console.log("[BLE] Diagnostics: " + message.data)
        break;
      case "a202":
        console.log("[BLE] Failed to compile diagnostic data")
        break;
      case "a301":
        console.log("[BLE] Current locking state: " + message.data)
        break;
      case "a701":
        console.log("[BLE] LockDOWN state: " + message.data)
        break;
      case "a711":
        console.log("[BLE] Your code provided was... " + message.data)
        break;
      case "a801":
        console.log("[BLE] Logs: " + message.data)
        break;
      case "a811":
        console.log("[BLE] Emergency medical information: " + message.data)
        break;
      case "a901":
        console.log("[BLE] Current debugging state: " + message.data)
        break;
      case "c101":
        console.log("[BLE] All schemas: " + message.data);
        break;
      case "c201":
        console.log("[BLE] All matches W/O data: " + message.data);
        break;
      case "c202":
        console.log("[BLE] Updated matches: " + message.data);
        var matches = JSON.parse(message.data);
        matches.forEach(match => {
          db.entries.findOne({_id: match.Id}, function(err, doc){
            if(doc == null){
              // need to create
              match["_id"] = match.Id;
              db.entries.insert(match, function(err, newDoc){
                console.log("New entry added")
              })
            }else{
              match["_id"] = match.Id;
              db.entries.update({_id: match.Id}, match, function(err, newDoc){
                console.log("Entry updated!")
              })
            }
          })
          setTimeout(function(){
            db.entries.find({}, function(err, docs){
              mainWindow.webContents.send("allMatches", {"matches" : docs});
            })
          }, 5000);
        })
        break;
      case "c301":
        console.log("[BLE] Forced competition schema: " + message.data);
        break;
      case "c401":
        console.log("[BLE] All users: " + message.data);
        break;
      case "c501":
        console.log("[BLE] Last backup time: " + message.data);
        break;
      case "c701":
        console.log("[BLE] Competition security state mode: " + message.data);
        break;
    }
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


var selectedCompetition = "";


function showOptions(){
  mainWindow = new BrowserWindow({

    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }, 
    title : 'Glare Desktop',
    show: false,
  });
  app.dock.setIcon("icons/Logo.png");
  var fileToLoad = "views/menu.html"
  mainWindow.loadFile(fileToLoad)
  mainWindow.isMenuBarVisible(false)
  
  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit();
  });
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
    //mainWindow.webContents.send("addRequest", {"channelNumber" : 1,"idCode" : "12345678", "timestamp" : "12:57:05 PM", "direction": "In", "requestType" : "UPDATE (12345678)", "successful" : true})
    
    
  });
}

function showPlanning(){
  mainWindow = new BrowserWindow({

    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }, 
    title : 'Glare Desktop',
    show: false,
  });
  app.dock.setIcon("icons/Logo.png");
  var fileToLoad = "views/planning.html"
  mainWindow.loadFile(fileToLoad)
  mainWindow.isMenuBarVisible(false)
  
  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit();
  });
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
    //mainWindow.webContents.send("addRequest", {"channelNumber" : 1,"idCode" : "12345678", "timestamp" : "12:57:05 PM", "direction": "In", "requestType" : "UPDATE (12345678)", "successful" : true})
    
    
  });
}

// main window that actually allows the user to interact with the show
function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }, 
    title : 'Glare Desktop',
    show: false,
    
  })
  app.dock.setIcon("icons/Logo.png");
  //mainWindow.setFullScreen(true)

  var fileToLoad = "views/server.html"
  mainWindow.loadFile(fileToLoad)
  mainWindow.isMenuBarVisible(false)
  
  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit();
  });
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
    //mainWindow.webContents.send("addRequest", {"channelNumber" : 1,"idCode" : "12345678", "timestamp" : "12:57:05 PM", "direction": "In", "requestType" : "UPDATE (12345678)", "successful" : true})
    
    db.schemas.find({}, function(err, docs){
      mainWindow.webContents.send("allSchemas", {"schemas" : docs});
    })
    db.competitions.find({}, function(err, docs){
      mainWindow.webContents.send("allCompetitions", {"competitions" : docs});
    })
    db.scouters.find({}, function(err, docs){
      mainWindow.webContents.send("allScouters", {"scouters" : docs});
    })
    db.notes.find({}, function(err, allDocs){
      mainWindow.webContents.send("allNotes", {"notes" : allDocs});
    });
    
    
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

ipcMain.on("setCompetition", (event, args) => {
  selectedCompetition = args["competition"];
});

ipcMain.on("exportedData", (event, args) => {
  fs.writeFile("exports/DataExport.json", args["data"], { flag: "w+"}, err => {
    if(err){
      console.log(err);
    }
  });
});

ipcMain.on("getMatches", (event, args) => {
  selectedCompetition = args["competition"];
  db.entries.find({"Competition" : selectedCompetition}, function(err, docs){
    mainWindow.webContents.send("allMatches", {"matches" : docs});
  })
});

ipcMain.on("deleteMatch", (event, args) => {
  selectedCompetition = args["competition"];
  db.entries.remove({"_id" : args["id"]},{}, function(err, docs){
    if(err){
      console.log(err);
    }
    db.entries.find({"Competition" : selectedCompetition}, function(err, docs){
      mainWindow.webContents.send("allMatches", {"matches" : docs});
    })
  })
});

ipcMain.on("clearMatch", (event, args) => {
  selectedCompetition = args["competition"];
  db.entries.update({_id : args["id"]}, { $set: {Completed: false, Data : null} },{}, function(err, docs){
    console.log(err);
    db.entries.find({"Competition" : selectedCompetition}, function(err, docs){
      mainWindow.webContents.send("allMatches", {"matches" : docs});
    })
  });
});

ipcMain.on('newMatch', (event, args) => {
  console.log(args['match']);
  db.entries.insert(args["match"], function(err, newDoc){
    db.entries.find({}, function(err, allDocs){
      mainWindow.webContents.send("allMatches", {"matches" : allDocs});
      /*var docsToSend = []
      allDocs.forEach(docToSend => {
        docToSend["Id"] = docToSend._id;
        delete docToSend._id;
        docsToSend.push(docToSend);
      });

      io.emit('addToQueue', {
        deviceId : "BF8613",
        protocolTo : "c211",
        protocolFrom : "0998",
        communicationId : "ABCDEF42",
        data : JSON.stringify(docsToSend),
        sentAt : new Date()
      });
      db.requests.insert({
        deviceId : "BF8613",
        protocolTo : "c211",
        protocolFrom : "0998",
        communicationId : "ABCDEF42",
        data : JSON.stringify(docsToSend),
        sentAt : new Date()
      }, function(err, doc) {
        //console.log("New document added to requests with id " + doc._id + " at " + new Date().toTimeString());
        mainWindow.webContents.send('addRequest', doc);
        
      });*/

    });
  })
});


ipcMain.on("GOTOPAGE", (event, args) => {
  if(args["page"] == "server"){
    mainWindow.hide();
    createWindow();
  }else if(args["page"] == "planning"){
    mainWindow.hide();
    showPlanning();
  }
});

ipcMain.on('newNote', (event, args) => {
  db.notes.insert(args["data"], function(err, newDoc){
    db.notes.find({}, function(err, allDocs){
      mainWindow.webContents.send("allNotes", {"notes" : allDocs});
    });
  })
});

ipcMain.on('loadPlan', (event, args) => {
  db.plans.findOne({ name : args["name"]}, function(err, theDoc){
    if(err){
      mainWindow.webContents.send("getPlan", {"data" : undefined, "error" : true});
    }else{
      mainWindow.webContents.send("getPlan", {"data" : theDoc, "error" : false});
    }
    
  })
});

ipcMain.on('savePlan', (event, args) => {
  db.plans.update({ name : args["name"]}, {name : args["name"], data : args["data"]}, {upsert:true}, function(err, theDoc){
    
  })
});

ipcMain.on('removeNote', (event, args) => {
  db.notes.remove({_id : args["id"]}, function(err, numRemoved){
    db.notes.find({}, function(err, allDocs){
      mainWindow.webContents.send("allNotes", {"notes" : allDocs});
    });
  })
});

ipcMain.on('editNote', (event, args) => {
  db.notes.update({_id : args["data"]._id}, {subject : args["data"].subject, content: args["data"].content, author: args["data"].content, date: args["data"].date}, function(err, newDoc){
    db.notes.find({}, function(err, allDocs){
      mainWindow.webContents.send("allNotes", {"notes" : allDocs});
    });
  })
});

ipcMain.on('promoteDevice', (event, args) => {
  db.devices.update({_id : args["id"]}, {onLineup : true}, function(err, newDoc){
    db.devices.find({}, function(err, allDocs){
      mainWindow.webContents.send("allDevices", {"devices" : allDocs})
    })
    
  });
});
ipcMain.on('demoteDevice', (event, args) => {
  db.devices.update({_id : args["id"]}, {onLineup : false}, function(err, newDoc){
    db.devices.find({}, function(err, allDocs){
      mainWindow.webContents.send("allDevices", {"devices" : allDocs})
    })
  });
});

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
    //console.log("New document added to requests with id " + doc._id + " at " + new Date().toTimeString());
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
    db.competitions.find({}, function(err, docs){
      mainWindow.webContents.send("allCompetitions", {"competitions" : docs});
    })
  });
});

ipcMain.on('getDevices', (event, args) => {
  db.devices.find({}, function(err, allDocs){
    mainWindow.webContents.send("allDevices", {"devices" : allDocs})
  });
});

// when ElectronJS is ready, start up the role selection window
app.on('ready', showOptions)

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
