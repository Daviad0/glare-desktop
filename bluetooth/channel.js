var util = require('util');

var bleno = require('@abandonware/bleno');
const notify = require('./updateHandler')


exports.createChannel = function(uuid, loggingName, channelNum){
    var BlenoCharacteristic = bleno.Characteristic;

    var thischannel = function() {
        thischannel.super_.call(this, {
        uuid: uuid,
        properties: ['read', 'write', 'notify'],
        value: null
    });

    this._value = new Buffer(0);
    this._updateValueCallback = null;
    };
    notify.emit('channelUpdate', channelNum, 'Online', {});
    util.inherits(thischannel, BlenoCharacteristic);

    if(loggingName != undefined){
        // this channel should be logged
        thischannel.prototype.onReadRequest = function(offset, callback) {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has had its value read by a client!");
            notify.emit('channelUpdate', channelNum, 'read', {});
            callback(this.RESULT_SUCCESS, this._value);
          };
          
          
          
        thischannel.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has lost a client");
            notify.emit('channelUpdate', channelNum, 'subscribed', {});
            this._updateValueCallback = updateValueCallback;
        };
        
        thischannel.prototype.onUnsubscribe = function() {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has gained a client!");
            notify.emit('channelUpdate', channelNum, 'unsubscribed', {});
            this._updateValueCallback = null;
        };

        thischannel.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
            this._value = data;
            var hextocheck = this._value.toString('hex');
            var rawstring = hex2a(hextocheck)
            notify.emit('channelUpdate', channelNum, 'written', {});
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has sent '" + rawstring + "'");
        }
    }
    

    return thischannel;
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
