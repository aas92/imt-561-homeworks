// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  //const CANVAS_SIZE = 800;

    let stopwatches = [];
   
    // Layout constants
    const RECT_W = 110;
    const RECT_H = 110;
    const RECT_Y = 40;
    const GAP = 20;
    const MARGIN_X = 30;
    const DIVIDER_Y = 180;

  //p.setup = function () {
  //  p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  //};

  p.setup = () => {
    p.createCanvas(4 * RECT_W + 3 * GAP + 2 * MARGIN_X, 360);
    p.textFont("monospace");
 
    // Build the 4 stopwatches
    const labels = ["Drums","Synths","Arrange","Mix"];
    const colors = ["#5480e4", "#85971e", "#ffa374", "#bf9fbe"];
    for (let i = 0; i < 4; i++) {
      stopwatches.push({
        id: i + 1,
        label: labels[i],
        color: colors[i],
        running: false,
        startTime: 0,        // millis() reference when started
        elapsedTime: 0,      // accumulated ms
        x: MARGIN_X + i * (RECT_W + GAP),
        y: RECT_Y,
        w: RECT_W,
        h: RECT_H,
      });
    }
  };

  // p.draw = function () {
  /* p.background(255);
  p.noStroke();
  p.fill(100, 150, 240);
  p.textSize(32);
  p.textAlign(p.CENTER, p.CENTER);
  p.text('Testing Title Change', p.width / 2, p.height / 2);

    //Draw frame as part of the sketch output.
  p.noFill();
  p.stroke(0);
  p.strokeWeight(1);
  p.rect(0, 0, p.width - 1, p.height - 1);
  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
   */

   p.draw = () => {
    p.background(245);
 
    // Update any running stopwatches
    for (const sw of stopwatches) {
      if (sw.running) {
        sw.elapsedTime = p.millis() - sw.startTime;
      }
    }
 
    // --- Draw stopwatch rectangles ---
    for (const sw of stopwatches) {
      // Fill changes when running
      if (sw.running) {
        p.fill(sw.color);
      } else {
        p.fill(220);
      }
      p.stroke(40);
      p.strokeWeight(2);
      p.rect(sw.x, sw.y, sw.w, sw.h, 8);
 
      // Number label inside rectangle
      p.noStroke();
      p.fill(30);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(18);
      p.text(sw.label, sw.x + sw.w / 2, sw.y + sw.h / 2);
    }
 
    // --- Divider line ---
    p.stroke(180);
    p.strokeWeight(1);
    p.line(MARGIN_X, DIVIDER_Y, p.width - MARGIN_X, DIVIDER_Y);
 
    // --- Elapsed time section ---
    p.noStroke();
    p.fill(30);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("Elapsed Time", MARGIN_X, DIVIDER_Y + 15);
 
    p.textSize(16);
    for (let i = 0; i < stopwatches.length; i++) {
      const sw = stopwatches[i];
      const timeStr = formatTime(sw.elapsedTime);
      p.text(
        `${sw.label}: ${timeStr}`,
        MARGIN_X,
        DIVIDER_Y + 50 + i * 26
      );
    }
 
    // Hint text
    p.fill(120);
    p.textSize(12);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text("Click a rectangle to start/stop", p.width - MARGIN_X, p.height - 10);
  };
 
  p.mousePressed = () => {
    for (const sw of stopwatches) {
      const inside =
        p.mouseX >= sw.x &&
        p.mouseX <= sw.x + sw.w &&
        p.mouseY >= sw.y &&
        p.mouseY <= sw.y + sw.h;
 
      if (inside) {
        if (sw.running) {
          // Stop: keep elapsedTime as-is
          sw.running = false;
        } else {
          // Start: anchor startTime so elapsedTime continues from where it left off
          sw.startTime = p.millis() - sw.elapsedTime;
          sw.running = true;
        }
      }
    }
  };
 
  // mm:ss.cs (centiseconds)
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    //5.4 Removing ms from the display.
    //const centis = Math.floor((ms % 1000) / 10);
    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0") +
      "." //+
      //String(centis).padStart(2, "0")
    );
  }
});
 

