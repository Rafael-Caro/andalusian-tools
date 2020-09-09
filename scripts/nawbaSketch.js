var mainWidth = 1070
var mainHeight = 600
// Html interaction
var recordingSelector;
var playButton;
// Boxes
var navigationBox;
var navigationBoxH = 100;
// Audio
var mbid;
var track;
var loaded;
var playing;
var currentTime;
var jump;
// Multilanguage
var language;
var labels = {
  "play": {
    "en": "Play",
    "es": "Toca"
  },
  "pause": {
    "en": "Pause",
    "es": "Pausa"
  },
  "continue": {
    "en": "Play",
    "es": "Sigue"
  },
  "melody": {
    "en": "Melody",
    "es": "Melodía"
  },
  "lines": {
    "en": "Lyrics",
    "es": "Versos"
  },
  "voice": {
    "en": " voice",
    "es": " voz"
  },
  "select": {
    "en": "Select",
    "es": "Elige"
  },
  "scattered": {
    "en": "scattered",
    "es": "disperso"
  }
}

function preload () {
  language = document.documentElement.lang;
  if (language == 'en') {
    recordingsInfo = loadJSON("files/recordingsInfo.json");
    tubu = loadJSON("files/tubu.json");
  } else if (language == 'es') {
    recordingsInfo = loadJSON("../files/recordingsInfo.json");
    tubu = loadJSON("../files/tubu.json");
  }
}

function setup() {
  var canvas = createCanvas(mainWidth, mainHeight)
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(CORNER);
  strokeJoin(ROUND);

  // Interaction buttons
  recordingSelector = createSelect()
    .size(100, 20)
    .position(10, 10)
    .changed(start)
    .parent("sketch-holder")
  recordingSelector.option(labels.select[language])
  var noRec = recordingSelector.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  var mbids = Object.keys(recordingsInfo)
  for (var i = 0; i < mbids.length; i++) {
    var mbid = mbids[i]
    var nawba = recordingsInfo[mbid].nawba.tr;
    var mizan = recordingsInfo[mbid].mizan.tr;
    var title = mizan[0].toUpperCase() + mizan.slice(1, mizan.length) + ' ' + nawba;
    var orchestra = recordingsInfo[mbid].orchestra[language];
    var duration = niceTime(recordingsInfo[mbid].duration);
    var option = title + ' - ' + orchestra + ' (' + duration + ')';
    recordingSelector.option(option, mbid);
  }

  playButton = createButton(labels.play[language])
    .size(100, 50)
    .position(10, recordingSelector.position()['y']+recordingSelector.height+10)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  // Boxes
  navigationBox = new CreateNavigationBox();
}

function draw() {
  background(165, 214, 167)
  // Boxes
  navigationBox.displayBack();
  navigationBox.displayFront();
}

function start() {
  // Stop and remove current audio
  if (loaded) {
    track.stop();
  }
  loaded = false;
  playing = false;
  currentTime = undefined;
  jump = undefined;
  // Reset buttons
  playButton.html(labels.play[language]);
  playButton.attribute("disabled", "true");
  // Load new audio
  mbid = recordingSelector.value();
  audioLoader(mbid);
}



// Boxes
function CreateNavigationBox() {
  this.x1 = 10;
  this.x2 = width - 10;
  this.y1 = height - navigationBoxH - 10;
  this.y2 = height - 10;
  this.w = this.x2 - this.x1

  this.displayBack = function() {
    fill(255);
    noStroke();
    rect(this.x1, this.y1, this.w, navigationBoxH);
  }

  this.displayFront = function() {
    stroke(0, 150);
    strokeWeight(1);
    line(this.x1+1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }
}



// Audio
function audioLoader() {
  var root;
  if (language == "es") {
    root = "../tracks/"
  } else {
    root = "tracks/"
  }
  track = loadSound(root + mbid + ".mp3", function () {
    playButton.removeAttribute("disabled");
    // visButton.removeAttribute("disabled");
    loaded=true;
    currentTime = 0;
  });
}

function player() {
  if (playing) {
    track.pause();
    playing = false;
    playButton.html(labels.continue[language]);
  } else {
    if (jump == undefined) {
      track.play();
    } else {
      track.play();
      track.jump(jump);
      jump = undefined;
    }
    playing = true;
    playButton.html(labels.pause[language]);
  }
}

// Helper functions
function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
