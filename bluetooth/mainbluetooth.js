const bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var channelFile = require("./channel")

var channel_1 = channelFile.createChannel('0001', 'Channel 1');
var channel_2 = channelFile.createChannel('0002', 'Channel 2');
var channel_3 = channelFile.createChannel('0003', 'Channel 3');
var channel_4 = channelFile.createChannel('0004', 'Channel 4');
var channel_5 = channelFile.createChannel('0005', 'Channel 5');
var channel_6 = channelFile.createChannel('0006', 'Channel 6');
var channel_7 = channelFile.createChannel('0007', 'Channel 7');
var channel_8 = channelFile.createChannel('0008', 'Channel 8');

exports.startAdvertising = function(uuid){
    bleno.on('stateChange', function(state) {
        if (state === 'poweredOn') {
          bleno.startAdvertising('Glare Bluetooth Service', [uuid]);
        } else {
          bleno.stopAdvertising();
        }
      });

    console.log("(GLog) [" + new Date().toTimeString() + "] Starting Bluetooth Channels...")
    bleno.on('advertisingStart', function(error) {
        console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
      
        if (!error) {
          bleno.setServices([
            new BlenoPrimaryService({
              uuid: uuid,
              characteristics: [
                channel_1,
                channel_2,
                channel_3,
                channel_4,
                channel_5,
                channel_6,
                channel_7,
                channel_8
              ]
            })
          ]);
        }
      });
}