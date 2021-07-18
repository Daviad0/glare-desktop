var noble = require('noble')

var accessibleServiceId = '0000086200001000800000805f9b34fb';
var writingCharacteristicId = '0000000100001000800000805f9b34fb'

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      //
      // Once the BLE radio has been powered on, it is possible
      // to begin scanning for services. Pass an empty array to
      // scan for all services (uses more time and power).
      //
      console.log('scanning...');
      noble.startScanning([accessibleServiceId], false);
    }
    else {
      noble.stopScanning();
    }
});

noble.on('discover', function(peripheral){
    console.log("Discovered " + peripheral.advertisement)
    peripheral.connect(function(err){
        peripheral.discoverServices([accessibleServiceId], function(err, services){
            services.forEach(service => {
                console.log("Discovered service "+ service.name);
                service.discoverCharacteristics([writingCharacteristicId], function(err, characteristics){
                    characteristics.forEach(characterisic => {
                        if(characterisic.uuid == writingCharacteristicId){
                            console.log("Found characteristic!!")
                            characterisic.on("data", function(data, isNotification){
                                console.log(data)
                                console.log(isNotification);
                            })
                            characterisic.subscribe(function(err){
                                
                            });
                            
                            characterisic.write(Buffer.from("08621234567a90000100a100018312830920", "hex"), true, function(err){
                                console.log("Wrote Request")
                            });
                        }
                    }); 
                });
            });
            
        });
    });
});