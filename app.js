/*
  Title: ElectronJS
  Author: OpenJS Foundation
  Date: 2/12/2021
  Code Version: 4.2.12
  Code Availaibility: https://www.electronjs.org/
  Notes: This is the library that brings the HTML page to life in a new window instead of the Chrome browser. All content that shows up inside the window is not within Electron's control, and is completely coded by this project's author
*/
const {app, BrowserWindow, dialog} = require('electron')
console.log("wuwuauawuwau");
const {ipcMain} = require('electron')
const RXDB = require('rxdb')

const sudo = require('sudo-prompt');
// ok so BLE is in sudo-prompt
// "this is so gonna work"
// said David Reeves, July 3rd 2021

var options = {
  name: "God Awful Workaround"
}
sudo.exec('node /home/pi/glare-desktop/EXBS.js', options, 
  function(err, stdout, stderr){
    console.log('stdout: ' + stdout)
  }
);
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

// Defines where to grab the already available audio files.
//RXDB.addRxPlugin(require('pouchdb-adapter-leveldb')); // leveldown adapters need the leveldb plugin to work

//const leveldown = require('leveldown');

/*async function thisNeedsToWork(){
  const database = await RXDB.createRxDatabase({
    name: 'glaredb',
    adapter: leveldown // the name of your adapter
  });
  console.log(database.heroes2);

  const collections = await database.addCollections({
    entries: {
      schema: entrySchema
    },
    schemas: {
      schema: schemaSchema
    },
    devices: {
      schema: deviceSchema
    },
    requests: {
      schema: requestsSchema
    }
  });
  

  console.log(Object.keys(database.collections))
}

thisNeedsToWork();
*/
/*
  Title: FS (File System)
  Author: NPM Js
  Date: 2/12/2021
  Code Version: Built in w/ NodeJS
  Code Availaibility: https://nodejs.org/en/
*/
const fs = require('fs')




//resetServerMem();


/*
  Title: Socket.IO (Client)
  Author: rauchg
  Date: 2/12/2021
  Code Version: 3.1.1
  Code Availaibility: https://github.com/socketio/socket.io-client
  Notes: Paired with the Socket.IO package on app.js through port 3000
*/
const io = require("socket.io-client")
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
const machineId = require('node-machine-id')


console.log("HIII")
// main window that actually allows the user to interact with the show
function createWindow () {
  console.log('HELLLLLP');
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
    try{
      roleSelectionWindow.close();
    }catch(err){
      
    }
    
  });
  
  
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
    console.log('uwu');
    app.quit()
  }
})

// if there is no mainWindow on activation (other than the first runtime), start up the role window
app.on('activate', function () {
  if (mainWindow === null) {
    letUserSelectRole()
  }
})
