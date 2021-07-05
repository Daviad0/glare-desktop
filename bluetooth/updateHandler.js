const EventEmitter = require("events")

var masterCommunications = new EventEmitter();

setInterval(function() {
    //masterCommunications.emit("test");
}, 1000);

module.exports = masterCommunications;