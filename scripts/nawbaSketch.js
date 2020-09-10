// General measurements
var mainWidth = 1070;
var mainHeight = 600;
var vDiv1 = 200;
// Html interaction
var recordingSelector;
var playButton;
var languageButton;
// Visualizations
var title_y = 22;
var orchestra_y = 50;
var navigationBox;
var navigationBoxH = 70;
var navBoxCursor;
var navBoxCursorW = 3;
var lyricsDisplay_y = orchestra_y + 30
var lyricsBoxes = [];
var lyricLineH = 25;
var lyricsDisplayHFactor = 8
var lyricsDisplayH = lyricLineH * lyricsDisplayHFactor + 10;
var lyricLineShift = 0;
var patternLabelBoxes = [];
var patternLabelBoxes_y = 100;
var patternLabelBoxes_w = 80;
var patternLabelH = 30;
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
  if (language == 'es') {
    recordingsInfo = loadJSON("files/recordingsInfo.json");
    tubu = loadJSON("files/tubu.json");
  } else if (language == 'en') {
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

  languageButton = createButton("عر")
    .size(30, 30)
    .position(width-30-10, 10)
    .mousePressed(languageChange)
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
    text(title[textsLang], (width-vDiv1-20)/2+vDiv1, title_y);
    noStroke();
    fill(0);
    textSize(18);
    text(orchestra[textsLang], (width-vDiv1-20)/2+vDiv1, orchestra_y);
  }

  // Lyrics display box
  fill(255);
  noStroke();
  rect(vDiv1+10, lyricsDisplay_y, width-vDiv1-20, lyricsDisplayH);
  stroke(0);
  strokeWeight(1);
  line(vDiv1+10, lyricsDisplay_y, width-10, lyricsDisplay_y);
  line(width-10, lyricsDisplay_y, width-10, lyricsDisplay_y+lyricsDisplayH);
  strokeWeight(2);
  line(vDiv1+10, lyricsDisplay_y+lyricsDisplayH, width-10,
    lyricsDisplay_y+lyricsDisplayH);
  line(vDiv1+10, lyricsDisplay_y+1, vDiv1+10, lyricsDisplay_y+lyricsDisplayH);

  if (loaded && playing) {
    currentTime = track.currentTime();
  }

  navigationBox.displayBack();

  for (var i = 0; i < lyricsBoxes.length; i++) {
    lyricsBoxes[i].update();
    lyricsBoxes[i].display();
  }

  for (var i = 0; i < patternLabelBoxes.length; i++) {
    patternLabelBoxes[i].update();
    patternLabelBoxes[i].display();
  }

  navBoxCursor.update();
  navBoxCursor.display();

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
  lyricLineShift = 0;
  patternLabelBoxes = [];
  patternBoxes = [];
  // Reset buttons
  playButton.html(labels.play[language]);
  playButton.attribute("disabled", "true");
  languageButton.removeAttribute("disabled");
  languageButton.html("عر");
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
  // Patterns
  var patterns = recording.patterns;
  var patternLabels = Object.keys(patterns).sort();
  // for (var i = 0; i < patternLabels.length; i++) {
  for (var i = 0; i < 1; i++) {
    var patternLabel = patternLabels[i];
    var patternLabelBox = new CreatePatternLabelBox(patternLabel, i);
    for (var j = 0; j < patterns[patternLabel].length; j++) {
      var pattern = patterns[patternLabel][j];
      var patternBox = new CreatePatternBox(pattern, patternLabel, i);
      patternLabelBox.patternBoxes.push(patternBox);
    }
    patternLabelBoxes.push(patternLabelBox);
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
  // Data for navigation boxes
  this.nav_x1 = map(lyric.start, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_x2 = map(lyric.end, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_y1 = navigationBox.y1;
  this.nav_w = this.nav_x2 - this.nav_x1;
  this.nav_h = navigationBoxH-2;
  if (lyric.lyrics['es'][0] == '#') {
    this.mainLine = false;
  } else {
    this.mainLine = true;
  }
  if (this.mainLine) {
    this.nav_def_fill = color(0, 70);
  } else {
    this.nav_def_fill = color(0, 40);
  }
  this.nav_fill;
  this.nav_stroke;
  // Data for lyrics display boxes
  this.lx1 = vDiv1 + 20;
  this.ly1 = 5 + lyricsDisplay_y + (lyricLineH * i);
  this.lw = width-10 - this.lx1 + 10;
  this.lh = lyricLineH;
  this.lfill;

  this.update = function() {
    // Check if the cursor is within a lyrics navigation box
    if (navBoxCursor.x >= this.nav_x1 && navBoxCursor.x < this.nav_x2) {
      this.nav_fill = color(0, 150);
      this.nav_stroke = color(0, 150);
      this.lfill = color(0, 40);
      if (this.ly1 + lyricLineShift >= lyricsDisplay_y+lyricsDisplayH-5) {
        lyricLineShift = lyricsDisplay_y+lyricsDisplayH-this.ly1-lyricLineH-5;
      } else if (this.ly1+lyricLineShift <= lyricsDisplay_y) {
        lyricLineShift = lyricsDisplay_y - this.ly1 + 5;;
      }
    } else {
      this.nav_fill = this.nav_def_fill;
      this.nav_stroke = color(255);
      this.lfill = color(0, 0);
    }

  }

  this.display = function() {
    // Navigation box
    fill(this.nav_fill);
    stroke(this.nav_stroke);
    strokeWeight(1);
    rect(this.nav_x1, this.nav_y1, this.nav_w, this.nav_h);
    if (this.ly1 + lyricLineShift > lyricsDisplay_y &&
      this.ly1 + lyricLineShift < lyricsDisplay_y + lyricsDisplayH - 5) {
      // Lyrics display box
      fill(this.lfill);
      noStroke();
      rect(this.lx1-10, this.ly1+lyricLineShift, this.lw, this.lh);
      // Lyrics text
      if (textsLang == 'ar') {
        textAlign(RIGHT, BOTTOM);
      } else {
        textAlign(LEFT, BOTTOM);
      }
      textStyle(BOLD);
      textSize(lyricLineH * 0.60);
      fill(0);
      var txt = lyric.lyrics[textsLang];
      if (!this.mainLine) {
        if (textsLang == 'ar') {
          txt = txt + '       ';
        } else {
          txt = '       ' + txt.substring(1)
        }
        textStyle(ITALIC);
      }
      text(txt, this.lx1, this.ly1-(lyricLineH*0.2)+lyricLineShift,
        this.lw-30, this.lh);
    }
  }
}

function CreatePatternLabelBox(patternLabel, i) {
  this.x = 20;
  this.y = patternLabelBoxes_y + (patternLabelH * i);
  this.patternBoxes = [];
  this.sounding = 0;

  this.update = function() {
    var sounding = 0;
    for (var i = 0; i < this.patternBoxes.length; i++) {
      patternBox = this.patternBoxes[i];
      if (navBoxCursor.x >= patternBox.nav_x1 && navBoxCursor.x <= patternBox.nav_x2) {
        sounding += 1;
      }
    }
    this.sounding = sounding;
  }

  this.display = function() {
    if (this.sounding > 0) {
      print('yes');
      textStyle(BOLD);
      stroke('red');
    } else {
      textStyle(NORMAL);
      noStroke();
    }
    textSize(lyricLineH * 0.60);
    fill(0);
    text(patternLabel, this.x, this.y, patternLabelBoxes_w, patternLabelH);
    for (var i = 0; i < this.patternBoxes.length; i++) {
      this.patternBoxes[i].update();
      this.patternBoxes[i].display();
    }
  }
}

function CreatePatternBox(pattern, patternLabel, i) {
  this.nav_x1 = map(pattern.start, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_x2 = map(pattern.end, 0, trackDuration,
    navigationBox.x1+navBoxCursorW/2, navigationBox.x2-navBoxCursorW/2);
  this.nav_w = this.nav_x2 - this.nav_x1;

  this.update = function() {}

  this.display = function() {
    // stroke(255, 0, 0);
    // strokeWeight(1);
    noStroke();
    fill(255, 0, 0, 100);
    rect(this.nav_x1, navigationBox.y1, this.nav_w, navigationBoxH);
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

function languageChange () {
  if (textsLang == "ar") {
    textsLang = language;
    languageButton.html("عر");
  } else {
    textsLang = "ar";
    languageButton.html(language.toUpperCase());
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
