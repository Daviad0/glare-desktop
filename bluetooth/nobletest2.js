var noble = require('@abandonware/noble')

var accessibleServiceId = '862';
var writingCharacteristicId = '1'

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      //
      // Once the BLE radio has been powered on, it is possible
      // to begin scanning for services. Pass an empty array to
      // scan for all services (uses more time and power).
      //
      console.log('scanning...');
      noble.startScanning([accessibleServiceId], true);
    }
    else {
      noble.stopScanning();
    }
});

noble.on('discover', function(peripheral){
    console.log(peripheral.advertisement)
//if(peripheral.UUID == accessibleServiceId){
    peripheral.once('connect', function(err){
        console.log(err + "B")
        
    })
    peripheral.connect(function(err){
        console.log(err + "A")
        peripheral.discoverAllServicesAndCharacteristics(allCharacteristicsAndServices);
    });
//}
});

function allCharacteristicsAndServices(error, services, characteristics){
    console.log(error)
    console.log("READDYYYYYY")
}