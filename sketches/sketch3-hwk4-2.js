// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;

  //p.setup = function () {
  // p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  //};

  //p.draw = function () {
  /*   p.background(255);
    p.noStroke();
    p.fill(180, 60, 60);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('HWK #4. B', p.width / 2, p.height / 2);

    // Draw frame as part of the sketch output.
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p .rect(0, 0, p.width - 1, p.height - 1);
  };*/
  // ----- Encapsulated state -----
  let isRunning = false;
  let startMillis = 0;
  let elapsedCs = 0;
  let totalCs = 0;
  const canvasSize = 500;
  let maxSize;
 
  // DOM references (created via p5)
  let durationInput, startBtn, stopBtn, resetBtn, label;
 
  p.setup = () => {
    p.createCanvas(canvasSize, canvasSize);
    maxSize = canvasSize;
    p.ellipseMode(p.CENTER);
 
    // Build controls — these are p5 wrappers around DOM elements
    label = p.createSpan('Duration (sec, max 1800): ');
    label.style('font-family', 'monospace');
    label.style('color', '#333');
 
    durationInput = p.createInput('60', 'number');
    durationInput.attribute('min', '1');
    durationInput.attribute('max', '1800');
    durationInput.attribute('step', '1');
    durationInput.size(70);
 
    startBtn = p.createButton('Start');
    startBtn.mousePressed(startTimer);
 
    stopBtn = p.createButton('Stop');
    stopBtn.mousePressed(stopTimer);
 
    resetBtn = p.createButton('Reset');
    resetBtn.mousePressed(resetTimer);
  };
 
  p.draw = () => {
    p.background(14, 14, 16);
 
    // Update elapsed time if running
    if (isRunning) {
      elapsedCs = (p.millis() - startMillis) / 10; // ms -> centiseconds
      if (elapsedCs >= totalCs) {
        elapsedCs = totalCs;
        isRunning = false;
      }
    }
 
    const cx = p.width / 2;
    const cy = p.height / 2;
 
    // Reference outline showing the final size
    p.noFill();
    p.stroke(50);
    p.strokeWeight(1);
    p.ellipse(cx, cy, maxSize - 2, maxSize - 2);
 
    // Constant growth: maxSize / totalCs per centisecond
    let size = 0;
    if (totalCs > 0) {
      const growthPerCs = maxSize / totalCs;
      size = elapsedCs * growthPerCs;
      size = p.constrain(size, 0, maxSize);
    }
 
    // Growing ellipse
    p.noStroke();
    p.fill(245, 215, 110, 230);
    p.ellipse(cx, cy, size, size);
 
    // Inner highlight ring
    if (size > 4) {
      p.noFill();
      p.stroke(255, 255, 255, 40);
      p.strokeWeight(1);
      p.ellipse(cx, cy, size - 2, size - 2);
    }
 
    // Time readout — top
    p.noStroke();
    p.fill(244);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(13);
    p.textFont('monospace');
    const elapsedSec = (elapsedCs / 100).toFixed(2);
    const totalSec = (totalCs / 100).toFixed(2);
    p.text(elapsedSec + 's / ' + totalSec + 's', cx, 14);
 
    // Status — bottom
    p.textAlign(p.CENTER, p.BOTTOM);
    p.fill(150);
    p.textSize(10);
    let status = 'IDLE';
    if (totalCs > 0 && elapsedCs >= totalCs) status = 'COMPLETE';
    else if (isRunning) status = 'RUNNING';
    else if (elapsedCs > 0) status = 'PAUSED';
    p.text(status, cx, p.height - 14);
  };
 
  // ----- Control handlers (closures over p and state) -----
  function startTimer() {
    if (isRunning) return;
 
    let duration = parseFloat(durationInput.value());
    if (isNaN(duration) || duration <= 0) duration = 60;
    duration = p.constrain(duration, 0.1, 1800); // 30-minute cap
 
    if (totalCs === 0 || elapsedCs >= totalCs) {
      // Fresh run
      totalCs = duration * 100;
      elapsedCs = 0;
      startMillis = p.millis();
    } else {
      // Resume from pause
      startMillis = p.millis() - elapsedCs * 10;
    }
    isRunning = true;
  }
 
  function stopTimer() {
    isRunning = false;
  }
 
  function resetTimer() {
    isRunning = false;
    elapsedCs = 0;
    totalCs = 0;
    startMillis = 0;
  }
});
 
// Instantiate the sketch
