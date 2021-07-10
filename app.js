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



//const BLEService = require('./bluetooth/mainbluetooth')
//BLEService.startAdvertising('1010');
const entrySchema = {
  keyCompression: true,
  version: 0,
  title: 'Entry DataSchema',
  type: 'object',
  properties: {
    competition: {
      type: 'string'
    },
    dataSchemaKey: {
      type: 'string'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'array',
      items:{
        type: 'number'
      }
    },
    finalDataJSON: {
      type: 'string'
    }
  },
  required: ['competition', 'dataSchemaKey', 'createdAt', 'finalDataJSON']
}

const schemaSchema = {
  keyCompression: true,
  version: 0,
  title: 'Schema DataSchema',
  type: 'object',
  properties: {
    idCode: {
      type: 'string',
      primary: true
    },
    createdAt: {
      type: 'number'
    },
    dataHash: {
      type: 'string'
    },
    finalDataJSON: {
      type: 'string'
    }
  },
  required: ['idCode', 'createdAt', 'dataHash', 'finalDataJSON']
}

const deviceSchema = {
  keyCompression: true,
  version: 0,
  title: 'Device DataSchema',
  type: 'object',
  properties: {
    idCode: {
      type: 'string',
      primary: true
    },
    firstConnectionAt: {
      type: 'number'
    },
    deviceType: {
      type: 'string'
    },
    diagnostics:{
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gotAt: {
            type: 'number'
          },
          appVersion: {
            type: 'string'
          },
          readyForCompetition: {
            type: 'boolean'
          }
        }
      }
    }
  },
  required: ['idCode', 'firstConnectionAt']
}

const requestsSchema = {
  keyCompression: true,
  version: 0,
  title: 'Schema DataSchema',
  type: 'object',
  properties: {
    idCode: {
      type: 'string',
      primary: true
    },
    gotAt: {
      type: 'number'
    },
    finalDataJSON: {
      type: 'string'
    },
    requestType: {
      type: 'string'
    },
    forChannel: {
      type: 'number'
    }
  },
  required: ['idCode', 'gotAt', 'requestType', 'finalDataJSON', 'forChannel']
}

var Datastore = require('nedb');

var db = {};
db.entries = new Datastore({ filename: 'storage/entries.db', autoload: true });
db.devices = new Datastore({ filename: 'storage/devices.db', autoload: true });
db.requests = new Datastore({ filename: 'storage/requests.db', autoload: true });
db.schemas = new Datastore({ filename: 'storage/schemas.db', autoload: true });
db.entries.loadDatabase();
db.devices.loadDatabase();
db.requests.loadDatabase();
db.schemas.loadDatabase();

const fs = require('fs')
fs.readFile('./testSchema.json', 'utf8' , (err, data) => {
  db.schemas.insert({
    _id: '76628abc',
    prettyName: 'Infinite Recharge',
    usedFor: '2020 - 2021 Season',
    createdAt: new Date(),
    dataHash: 'aaaabbbb',
    finalDataJSON: data
  }, function(err, newDoc){
    console.log(newDoc)
    console.log("Document added!");
  })
})


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
    mainWindow.webContents.send('channelUpdate', {"status" : status, "details" : details, "channelNumber" : channelNumber});
  });

  socket.on('addDocument', (addTo, objectToAdd) => {
    db[addTo].insert(objectToAdd, function(err, newDoc){
      console.log("New document added to " + addTo + " with id " + newDoc._id + " at " + new Date().toTimeString());
    });
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
    mainWindow.webContents.send("addRequest", {"channelNumber" : 1,"idCode" : "12345678", "timestamp" : "12:57:05 PM", "direction": "In", "requestType" : "UPDATE (12345678)", "successful" : true})
    
  });
  var btpath = path.join(__dirname, "EXBS.js")
  var options = {
    name: "God Awful Workaround"
  }
  sudo.exec('node ' + btpath, options, 
    function(err, stdout, stderr){
      if(err) throw err;
      console.log('stdout: ' + stdout)
    }
  );
  
}



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
