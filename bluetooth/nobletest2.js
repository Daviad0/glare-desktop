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


function allCharacteristicsAndServices(error, services, characteristics){
    
}

var serviceCheck = 0;
var discovered = 0;
noble.on('discover', function(peripheral){
    discovered = discovered + 1;
    console.log(peripheral.advertisement)
    if(peripheral.advertisement.localName == "Glare" && discovered == 1){
        currentlyConnected = true;
        noble.stopScanning();
        peripheral.once('connect', function(err){
            console.log(err + "B")
            
        })
        peripheral.connect(function(err){
            console.log(err + "A")
            var characteristicsAlreadyFound = false;
            serviceId = setInterval(function(){peripheral.discoverAllServicesAndCharacteristics(function(error, services,characteristics){
                clearInterval(serviceId);
                if(!characteristicsAlreadyFound){
                    characteristicsAlreadyFound = true;
                    characteristics.forEach(characterisic => {
                        if(characterisic.uuid == writingCharacteristicId){
                            console.log("Found characteristic!!")
                            characterisic.on("data", function(data, isNotification){
                                console.log("DATAAAA");
                                console.log(data)
                                console.log(isNotification);
                            })
                            characterisic.subscribe(function(err){
                                console.log("Subscribed")
                                characterisic.write(Buffer.from("08621234567a90000100a1000183128309686920", "hex"), true, function(err){
                                    console.log("Wrote Request")
                                });
                            });
                            
                            
                            //setInterval(function(){console.log("A")}, 500);
                        }
                    }); 
                }
                
            })}, 1000);
            
        });
    }else{
        discovered = 0;
    }
});

