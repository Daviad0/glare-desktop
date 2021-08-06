var path = require('path');
const sudo = require('sudo-prompt');
var btpath = path.join(__dirname, "EXBS.js")
  console.log(btpath);
  var options = {
    name: "Glare Bluetooth Service"
  }
  sudo.exec('node ' + btpath, options, 
    function(err, stdout, stderr){
      if(err) throw err;
      console.log('stdout: ' + stdout)
    }
  );