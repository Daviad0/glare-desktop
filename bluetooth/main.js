var noble = require('@abandonware/noble')

var accessibleServiceId = '0862';
var writingCharacteristicId = '0001'

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
        noble.stopScanning();
        console.log(err + "A")
        peripheral.discoverServices([accessibleServiceId], function(err, services){
            console.log("CCC")
            services.forEach(service => {
                console.log(service);
                service.once('characteristicsDiscover', function(characteristics){
                    console.log("ADDD")
                    console.log(characteristics)
                    characteristics.forEach(characterisic => {
                        if(characterisic.uuid == writingCharacteristicId){
                            console.log("Found characteristic!!")
                            characterisic.on("data", function(data, isNotification){
                                console.log(data)
                                console.log(isNotification);
                            })
                            characterisic.subscribe(function(err){
                                console.log("Subscribed")
                            });
                            
                            characterisic.write(Buffer.from("08621234567a90000100a1000183128309686920", "hex"), true, function(err){
                                console.log("Wrote Request")
                            });
                        }
                    }); 
                });
                service.discoverCharacteristics([], function(err, char){
                    
                });
            });
            
        });
    });
//}
});
