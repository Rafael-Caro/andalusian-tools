var mainWidth = 1070
var mainHeight = 600
// Html interaction
var recordingSelector;
var playButton;
// Visualizations
var navigationBox;
var navigationBoxH = 70;
var navBoxCursor;
var navBoxCursorW = 3;
var lyricsBoxes = [];
// Audio
var mbid;
var track;
var loaded;
var playing;
var currentTime;
var jump;
var trackDuration;
// Metadata
var title;
var orchestra;
// Multilanguage
var language;
var textsLang;
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
  "select": {
    "en": "Select",
    "es": "Elige"
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

  // Visualizations
  navigationBox = new CreateNavigationBox();
  navBoxCursor = new CreateNavBoxCursor();
}

function draw() {
  background(165, 214, 167)

  // Title and orchestra
  if (recordingSelector.value() != labels.select[language]) {
    textAlign(CENTER, TOP);
    stroke(0);
    strokeWeight(1);
    fill(0);
    textSize(20);
    textStyle(BOLD);
    text(title[textsLang], width/2, 22);
    noStroke();
    fill(0);
    textSize(18);
    text(orchestra[textsLang], width/2, 50);
  }

  if (loaded && playing) {
    currentTime = track.currentTime();
  }

  navigationBox.displayBack();

  navBoxCursor.update();
  navBoxCursor.display();

  for (var i = 0; i < lyricsBoxes.length; i++) {
    lyricsBoxes[i].update();
    lyricsBoxes[i].display();
  }

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
  // Reset data
  textsLang = language;
  lyricsBoxes = [];
  // Reset buttons
  playButton.html(labels.play[language]);
  playButton.attribute("disabled", "true");
  // Load new audio
  mbid = recordingSelector.value();
  audioLoader(mbid);
  // Load metadata
  var recording = recordingsInfo[mbid];
  var nawba = recording.nawba;
  var tab = recording.tab;
  var mizan = recording.mizan;
  var trTitle = mizan.tr[0].toUpperCase() + mizan.tr.slice(1, mizan.tr.length) + ' ' + tab.tr;
    var arTitle = mizan.ar + ' ' + tab.ar;
  title = {'ar': arTitle, 'en': trTitle, 'es': trTitle};
  orchestra = recording.orchestra;
  trackDuration = recording.duration;
  // Lyrics boxes
  var lyrics = recording.lyrics;
  for (var i = 0; i < lyrics.length; i++) {
      var lyricsBox = new CreateLyricsBox(lyrics[i], i);
      lyricsBoxes.push(lyricsBox);
  }
}



// Visualizations
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
    line(this.x1, this.y1-1, this.x2, this.y1-1);
    line(this.x2, this.y1-1, this.x2, this.y2);
    strokeWeight(2);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      if (playing) {
        track.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;
      }
    }
  }
}

function CreateNavBoxCursor() {
  this.x;

  this.update = function() {
    this.x = map(currentTime, 0, trackDuration,
      navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
    if (navigationBox.x2 - navBoxCursorW/2 - this.x < 0.1) {
      track.stop();
      playing = false;
      currentTime = 0;
      playButton.html(labels.play[language]);
    }
  }

  this.display = function() {
    stroke(0);
    strokeWeight(navBoxCursorW);
    line(this.x, navigationBox.y1+navBoxCursorW/2, this.x,
      navigationBox.y2-navBoxCursorW/2);
  }
}

function CreateLyricsBox(lyric, i) {
  this.nav_x1 = map(lyric.start, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_x2 = map(lyric.end, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_y1 = navigationBox.y1;
  this.w = this.nav_x2 - this.nav_x1;
  this.h = navigationBoxH-2;
  this.fill;
  this.stroke;

  this.update = function() {
    if (navBoxCursor.x >= this.nav_x1 && navBoxCursor.x < this.nav_x2) {
      this.fill = color(0, 150);
      this.stroke = color(0, 150);
    } else {
      this.fill = color(0, 70);
      this.stroke = color(255);
    }
  }

  this.display = function() {
    fill(this.fill);
    stroke(this.stroke);
    strokeWeight(1);
    rect(this.nav_x1, this.nav_y1, this.w, this.h);
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
function mouseClicked () {
  if (loaded) {
    navigationBox.clicked();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
