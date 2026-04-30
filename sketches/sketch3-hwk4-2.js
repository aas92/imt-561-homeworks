// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;

  //p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  //};

  //p.draw = function () {
    p.background(255);
    p.noStroke();
    p.fill(180, 60, 60);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('HWK #4. B', p.width / 2, p.height / 2);

    // Draw frame as part of the sketch output.
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  //};
let isRunning = false;
let startMillis = 0;   // millis() reference for current run segment
let elapsedCs = 0;     // total elapsed centiseconds
let totalCs = 0;       // total duration in centiseconds (0 = not started)
//let CANVAS_SIZE = 500;
let maxSize;           // max ellipse diameter (cannot exceed canvas)
 
let durationInput, startBtn, stopBtn, resetBtn, label;
 
p.setup = function() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  maxSize = CANVAS_SIZE;
  ellipseMode(CENTER);
 
  // --- DOM controls ---
  label = createSpan('Duration (sec, max 1800): ');
  label.style('font-family', 'monospace');
  label.style('color', '#333');
 
  durationInput = createInput('60', 'number');
  durationInput.attribute('min', '1');
  durationInput.attribute('max', '1800');
  durationInput.attribute('step', '1');
  durationInput.size(70);
 
  startBtn = createButton('Start');
  startBtn.mousePressed(startTimer);
 
  stopBtn = createButton('Stop');
  stopBtn.mousePressed(stopTimer);
 
  resetBtn = createButton('Reset');
  resetBtn.mousePressed(resetTimer);
}
 
p.draw = function() {
  background(14, 14, 16);
 
  // Update elapsed time if running
  if (isRunning) {
    elapsedCs = (millis() - startMillis) / 10; // ms -> centiseconds
    if (elapsedCs >= totalCs) {
      elapsedCs = totalCs;
      isRunning = false;
    }
  }
 
  const cx = width / 2;
  const cy = height / 2;
 
  // Reference outline showing the final size
  noFill();
  stroke(50);
  strokeWeight(1);
  ellipse(cx, cy, maxSize - 2, maxSize - 2);
 
  // Constant growth: maxSize / totalCs per centisecond
  let size = 0;
  if (totalCs > 0) {
    const growthPerCs = maxSize / totalCs;
    size = elapsedCs * growthPerCs;
    size = constrain(size, 0, maxSize);
  }
 
  // Growing ellipse
  noStroke();
  fill(245, 215, 110, 230);
  ellipse(cx, cy, size, size);
 
  // Inner highlight ring
  if (size > 4) {
    noFill();
    stroke(255, 255, 255, 40);
    strokeWeight(1);
    ellipse(cx, cy, size - 2, size - 2);
  }
 
  // Time readout — top
  noStroke();
  fill(244);
  textAlign(CENTER, TOP);
  textSize(13);
  textFont('monospace');
  const elapsedSec = (elapsedCs / 100).toFixed(2);
  const totalSec = (totalCs / 100).toFixed(2);
  text(elapsedSec + 's / ' + totalSec + 's', cx, 14);
 
  // Status — bottom
  textAlign(CENTER, BOTTOM);
  fill(150);
  textSize(10);
  let status = 'IDLE';
  if (totalCs > 0 && elapsedCs >= totalCs) status = 'COMPLETE';
  else if (isRunning) status = 'RUNNING';
  else if (elapsedCs > 0) status = 'PAUSED';
  text(status, cx, height - 14);
}
 
p.startTimer = function() {
  if (isRunning) return;
 
  let duration = parseFloat(durationInput.value());
  if (isNaN(duration) || duration <= 0) duration = 60;
  duration = constrain(duration, 0.1, 1800); // 30-minute cap
 
  if (totalCs === 0 || elapsedCs >= totalCs) {
    // Fresh run
    totalCs = duration * 100;
    elapsedCs = 0;
    startMillis = millis();
  } else {
    // Resume from pause
    startMillis = millis() - elapsedCs * 10;
  }
  isRunning = true;
}
 
p.stopTimer = function() {
  isRunning = false;
}
 
p.resetTimer = function() {
  isRunning = false;
  elapsedCs = 0;
  totalCs = 0;
  startMillis = 0;
}


  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
 
});
