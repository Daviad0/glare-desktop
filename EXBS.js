const central = require('./bluetooth/hostingBLE')
var Datastore = require('nedb');

central.startScanning([])
var db = {};
db.devices = new Datastore({ filename: 'storage/devices.db', autoload: true });
db.devices.loadDatabase();
db.devices.find({}, function(err, devices){
	console.log("UWU")
    
})



