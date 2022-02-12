const {ipcRenderer} = require('electron');
var parentMap = document.getElementById("map")
var c = parentMap.getContext("2d")
var rect = parentMap.getBoundingClientRect();
c.beginPath();
parentMap.width = window.innerWidth;
parentMap.height = window.innerHeight;
var x = 0;
var y = 0;
var tool = "draw";
var color = "none";
var data = {
  "red" : {
    "sets" : []
  },
  "green" : { 
    "sets" : []
  },
  "blue" : {
    "sets" : []
  }
}


var prevX = window.innerWidth;
var prevY = window.innerHeight;

var currentPoints = [];
var erasedPoints = [];
var tempLines = [];

function resizeDataPoints(){
    data["red"]["sets"].forEach(rSet => {
        var index = 0;
        rSet.forEach(rPoint => {
            rSet[index][0] = rPoint[0] * window.innerWidth / prevX;
            rSet[index][1] = rPoint[1] * window.innerHeight / prevY;
        })
    });
    data["blue"]["sets"].forEach(rSet => {
        var index = 0;
        rSet.forEach(rPoint => {
            rSet[index][0] = rPoint[0] * window.innerWidth / prevX;
            rSet[index][1] = rPoint[1] * window.innerHeight / prevY;
        })
    });
    data["green"]["sets"].forEach(rSet => {
        var index = 0;
        rSet.forEach(rPoint => {
            rSet[index][0] = rPoint[0] * window.innerWidth / prevX;
            rSet[index][1] = rPoint[1] * window.innerHeight / prevY;
        })
    });
}

window.addEventListener("resize", function(){
    currentPoints = [];
    erasedPoints = [];
    tempLines = [];
    data = {
        "red" : {
          "sets" : []
        },
        "green" : {
          "sets" : []
        },
        "blue" : {
          "sets" : []
        }
      }
    c.beginPath();  
    parentMap.width = window.innerWidth;
    parentMap.height = window.innerHeight;
    
});

document.getElementById("tool1").addEventListener("click", function(){
  tool = "start";
});

document.getElementById("tool2").addEventListener("click", function(){
  tool = "end";
});

document.getElementById("tool3").addEventListener("click", function(){
  tool = "draw";
});

document.addEventListener('mousemove', onMouseMove, false)

function onMouseMove(e){
  e.preventDefault();
  e.stopPropagation();
  x = e.clientX;
  y = e.clientY;
  if(tool == "draw" && tracking){
    if(color != "erase"){
      currentPoints.push([x-rect.left,y-rect.top])
    }else{
      erasedPoints.push([x-rect.left,y-rect.top])
    }
    
  }
  
    
}

function getMouseX() {
    return x;
}

function getMouseY() {
    return y;
}

var tracking = false;
parentMap.addEventListener("mousedown", function(){
  if(!tracking){
    currentPoints = [];
    erasedPoints = [];
    c.moveTo(x-rect.left,y-rect.top)
  }
  tracking = true;
})
parentMap.addEventListener("mouseup", function(){
  if(color != "none" && color != "yellow" && color != "erase" && tool == "draw"){
    data[color]["sets"].push(currentPoints.map((x) => x));
  }else if(tool == "draw" && color == "yellow"){
    tempLines.push(currentPoints.map((x) => x));
  }
  tracking = false
})

/*parentMap.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  parentMap.dispatchEvent(mouseEvent);
}, false);*/

function closeToErase(p){
  var found = false;
  erasedPoints.forEach(ep => {
    if(Math.abs(ep[0]-p[0]) < 50 && Math.abs(ep[1] - p[1]) < 50){
      //console.log("Too Close")
      found = true;
      return false;
    }else{
      return true;
      //console.log((ep[0]-p[0]) + ', ' + (ep[1] - p[1]))
    }
  })
  return found;
}

function reUpdateLines(){
  var saveColor = c.strokeStyle;
  var saveWidth = c.lineWidth;
  var saveComposite = c.globalCompositeOperation;
  var i = 0;

  tempLines.forEach(rSet => {
    var erased = false;
    c.lineWidth = 10;
    c.strokeStyle = "#F1C40F";
    c.globalCompositeOperation="source-over";
    c.beginPath();
    c.moveTo(rSet[0][0], rSet[0][1])
    rSet.forEach(p => {
      if(closeToErase(p)){
        erased = true;
        return false
      }
      c.lineTo(p[0], p[1]);
      return true;
    });
    if(erased){
      console.log("Removed")
      tempLines.splice(i, 1);
    }else{
      if(erased){
        //console.log("What")
      }
      c.stroke();
    }
    i += 1;
  });
  i = 0;
  data["red"]["sets"].forEach(rSet => {
    var erased = false;
    c.lineWidth = 10;
    c.strokeStyle = "#E74C3C";
    c.globalCompositeOperation="source-over";
    c.beginPath();
    c.moveTo(rSet[0][0], rSet[0][1])
    rSet.forEach(p => {
      if(closeToErase(p)){
        erased = true;
        return false
      }
      c.lineTo(p[0], p[1]);
      return true;
    });
    if(erased){
      console.log("Removed")
      data["red"]["sets"].splice(i, 1);
    }else{
      if(erased){
        //console.log("What")
      }
      c.stroke();
    }
    i += 1;
    
  });
  i = 0;
  data["blue"]["sets"].forEach(rSet => {
    var erased = false;
    c.lineWidth = 10;
    c.strokeStyle = "#3498DB";
    c.globalCompositeOperation="source-over";
    c.beginPath();
    c.moveTo(rSet[0][0], rSet[0][1])
    rSet.forEach(p => {
      if(closeToErase(p)){
        erased = true;
        return false
      }
      c.lineTo(p[0], p[1]);
      return true;
    });
    if(erased){
      console.log("Removed")
      data["blue"]["sets"].splice(i, 1);
    }else{
      if(erased){
        console.log("What")
      }
      c.stroke();
    }
    i += 1;
  });
  i = 0;
  data["green"]["sets"].forEach(rSet => {
    var erased = false;
    c.lineWidth = 10;
    c.strokeStyle = "#2ECC71";
    c.globalCompositeOperation="source-over";
    c.beginPath();
    c.moveTo(rSet[0][0], rSet[0][1])
    rSet.forEach(p => {
      if(closeToErase(p)){
        erased = true;
        return false
      }
      c.lineTo(p[0], p[1]);
      return true;
    });
    if(erased){
      console.log("Removed")
      data["green"]["sets"].splice(i, 1);
    }else{
      c.stroke();
    }
    i += 1;
  });
  c.strokeStyle = saveColor;
  c.lineWidth = saveWidth;
  c.globalCompositeOperation = saveComposite;
}

function reUpdatePositions(){
  var saveColor = c.strokeStyle;
  var saveWidth = c.lineWidth;
  var saveComposite = c.globalCompositeOperation;
  
  c.globalCompositeOperation="source-over";
  c.lineWidth = "10";
  
  if(data["red"]["start"] != undefined){
    c.strokeStyle = "#E74C3C";
    c.beginPath();
    c.arc(data["red"]["start"][0], data["red"]["start"][1], 12, 0, 2 * Math.PI)
    c.stroke();
  }
  if(data["blue"]["start"] != undefined){
    c.strokeStyle = "#3498DB";
    c.beginPath();
    c.arc(data["blue"]["start"][0], data["blue"]["start"][1], 12, 0, 2 * Math.PI)
    c.stroke();
  }
  if(data["green"]["start"] != undefined){
    c.strokeStyle = "#2ECC71";
    c.beginPath();
    c.arc(data["green"]["start"][0], data["green"]["start"][1], 12, 0, 2 * Math.PI)
    c.stroke();
  }

  if(data["red"]["end"] != undefined){
    c.strokeStyle = "#E74C3C";
    c.beginPath();
    c.rect(data["red"]["end"][0], data["red"]["end"][1], 24,24)
    c.stroke();
  }
  if(data["blue"]["end"] != undefined){
    c.strokeStyle = "#3498DB";
    c.beginPath();
    c.rect(data["blue"]["end"][0], data["blue"]["end"][1], 24,24)
    c.stroke();
  }
  if(data["green"]["end"] != undefined){
    c.strokeStyle = "#2ECC71";
    c.beginPath();
    c.rect(data["green"]["end"][0], data["green"]["end"][1], 24,24)
    c.stroke();
  }
  c.strokeStyle = saveColor;
  c.lineWidth = saveWidth;
  c.globalCompositeOperation = saveComposite;
  c.beginPath();
  c.moveTo(x-rect.left, y-rect.top);
  
}

var count = 0;
setInterval(function(){
  if(tracking && color != "none"){
    if(tool == "draw"){
      
      c.lineTo(x-rect.left, y-rect.top);
      c.stroke();
    }else if(tool == "start" && (color != "yellow" && color != "erase")){
      if(data[color]["start"] != undefined){
        c.globalCompositeOperation="destination-out";
        c.beginPath();
        c.arc(data[color]["start"][0], data[color]["start"][1], 14, 0, 2 * Math.PI)
        c.fill();
        c.stroke();
      }
      c.beginPath();
      c.globalCompositeOperation="source-over";
      
      c.arc(x-rect.left, y-rect.left, 12, 0, 2 * Math.PI)
      c.stroke();
      
      
      
      data[color]["start"] = [x-rect.left, y-rect.left]
      
      
    }
    else if(tool == "end" && (color != "yellow" && color != "erase")){
      if(data[color]["end"] != undefined){
        c.globalCompositeOperation="destination-out";
        c.beginPath();
        c.rect(data[color]["end"][0], data[color]["end"][1], 26,26)
        c.fill();
        c.stroke();
        console.log(data[color]["end"])
      }
      c.beginPath();
      c.globalCompositeOperation="source-over";
      
      c.rect(x-rect.left, y-rect.left, 24, 24)
      c.stroke();
      
      
      
      data[color]["end"] = [x-rect.left, y-rect.left]
      
      
    }
    
  }
  if(!tracking){
    c.clearRect(0, 0, parentMap.width, parentMap.height);
    reUpdateLines();
    reUpdatePositions();
  }else if(count % 10 == 0){
    reUpdatePositions();
  }
  
  count += 1
}, 5)

c.lineWidth = 0;

document.getElementById("greeno").addEventListener("click", function(){
  color = "green"
  c.lineWidth = 10;
  c.globalCompositeOperation="source-over";
  document.getElementById("greeno").style.backgroundColor = "#2ECC71"
  document.getElementById("blueo").style.backgroundColor = null
  document.getElementById("redo").style.backgroundColor = null
  document.getElementById("yellowo").style.backgroundColor = null
  c.strokeStyle = "#2ECC71"
  c.beginPath();
});
document.getElementById("blueo").addEventListener("click", function(){
  color = "blue"
  c.lineWidth = 10;
  c.globalCompositeOperation="source-over";
  document.getElementById("blueo").style.backgroundColor = "#3498DB"
  document.getElementById("greeno").style.backgroundColor = null
  document.getElementById("redo").style.backgroundColor = null
  document.getElementById("yellowo").style.backgroundColor = null
  c.strokeStyle = "#3498DB"
  c.beginPath();
});
document.getElementById("yellowo").addEventListener("click", function(){
  color = "yellow"
  c.lineWidth = 10;
  c.globalCompositeOperation="source-over";
  document.getElementById("yellowo").style.backgroundColor = "#F1C40F"
  document.getElementById("blueo").style.backgroundColor = null
  document.getElementById("redo").style.backgroundColor = null
  document.getElementById("greeno").style.backgroundColor = null
  c.strokeStyle = "#F1C40F"
  c.beginPath();
});
document.getElementById("redo").addEventListener("click", function(){
  color = "red"
  c.lineWidth = 10;
  c.globalCompositeOperation="source-over";
  document.getElementById("redo").style.backgroundColor = "#E74C3C"
  document.getElementById("blueo").style.backgroundColor = null
  document.getElementById("greeno").style.backgroundColor = null
  document.getElementById("yellowo").style.backgroundColor = null
  c.strokeStyle = "#E74C3C"
  c.beginPath();
});
document.getElementById("eraseo").addEventListener("click", function(){
  color = "erase";
  c.lineWidth = 100;
  c.globalCompositeOperation="destination-out";
  document.getElementById("redo").style.backgroundColor = null
  document.getElementById("blueo").style.backgroundColor = null
  document.getElementById("greeno").style.backgroundColor = null
  document.getElementById("yellowo").style.backgroundColor = null
  c.beginPath();
});

document.getElementById("copy").addEventListener('click', function(){
    document.getElementById("saveTo").style.display = "unset";
  document.getElementById("whereToSave").value = "";
})

document.getElementById("cancelSave").addEventListener('click', function(){
    document.getElementById("saveTo").style.display = "none";
});
document.getElementById("submitSave").addEventListener('click', function(){ 
    ipcRenderer.send("savePlan", {"name" : document.getElementById("whereToSave").value, "data" : JSON.stringify(data), "width" : window.innerWidth, "height" : window.innerHeight});
    document.getElementById("saveTo").style.display = "none";
});

ipcRenderer.on("getPlan", (evt, args) => {

    if(!args["error"]){
        var object = JSON.parse(args["data"]["data"]);
        prevX = args["data"]["width"];
        prevY = args["data"]["height"];
        
        data = object;
        resizeDataPoints(data);
        
    }else{
        alert("An error has occured loading your plan!");
    }
    prevX = window.innerWidth;
    prevY = window.innerHeight;
    document.getElementById("loadAt").style.display = "none";

});
document.getElementById("import").addEventListener('click', function(){
  document.getElementById("loadAt").style.display = "unset";
  document.getElementById("whereToLoad").value = "";
});
document.getElementById("cancelLoad").addEventListener('click', function(){
    document.getElementById("loadAt").style.display = "none";
});
document.getElementById("submitLoad").addEventListener('click', function(){ 
    ipcRenderer.send("loadPlan", {"name" : document.getElementById("whereToLoad").value});
});


document.getElementById("submitTeams").addEventListener("click", function(){
  document.getElementById("selectTeams").style.display = "none";
  document.getElementById("t1").innerHTML = document.getElementById("s1").value;
  document.getElementById("t2").innerHTML = document.getElementById("s2").value;
  document.getElementById("t3").innerHTML = document.getElementById("s3").value;
});