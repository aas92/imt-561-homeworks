// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  //const CANVAS_SIZE = 800;

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
   // ----- Timer state -----
   let isRunning = false;
   let startMillis = 0;
   let elapsedCs = 0;
   let totalCs = 0;
   const canvasSize = 500;
   let maxSize;
  
   // ----- UI state -----
   let durationMin = 1;        // user-facing duration in minutes
   const MIN_DURATION = 1;
   const MAX_DURATION = 30;    // 30-minute cap
   let controls = [];
   let hoverActive = false;
  
   // Theme
   const C_BG = [14, 14, 16];
   const C_INK = [244, 244, 245];
   const C_MUTED = [161, 161, 170];
   const C_ACCENT = [245, 215, 110];
   const C_LINE = [82, 82, 91];
  
   p.setup = () => {
     p.createCanvas(canvasSize, canvasSize);
     maxSize = canvasSize;
     p.ellipseMode(p.CENTER);
     p.textFont('monospace');
   };
  
   p.draw = () => {
     p.background(C_BG);
  
     if (isRunning) {
       elapsedCs = (p.millis() - startMillis) / 10;
       if (elapsedCs >= totalCs) {
         elapsedCs = totalCs;
         isRunning = false;
       }
     }
  
     drawEllipse();
     drawControlBar();
     drawReadout();
  
     p.cursor(hoverActive ? p.HAND : p.ARROW);
   };
  
   function drawEllipse() {
     const cx = p.width / 2;
     const cy = p.height / 2;
  
     p.noFill();
     p.stroke(50);
     p.strokeWeight(1);
     p.ellipse(cx, cy, maxSize - 2, maxSize - 2);
  
     let size = maxSize;
     if (totalCs > 0) {
       size = maxSize - elapsedCs * (maxSize / totalCs);
       size = p.constrain(size, 0, maxSize);
     }
  
     p.noStroke();
     p.fill(C_ACCENT[0], C_ACCENT[1], C_ACCENT[2], 230);
     p.ellipse(cx, cy, size, size);
  
     if (size > 4) {
       p.noFill();
       p.stroke(255, 255, 255, 40);
       p.strokeWeight(1);
       p.ellipse(cx, cy, size - 2, size - 2);
     }
   }
  
   function drawControlBar() {
     controls = [];
     hoverActive = false;
  
     const barX = 12;
     const barY = 12;
     const barW = p.width - 24;
     const barH = 36;
  
     p.noStroke();
     p.fill(0, 0, 0, 140);
     p.rect(barX, barY, barW, barH, 4);
     p.stroke(255, 255, 255, 20);
     p.noFill();
     p.rect(barX, barY, barW, barH, 4);
  
     const midY = barY + barH / 2;
     const btnH = barH - 12;
  
     // Left side: MIN label, [-], duration, [+]
     let leftX = barX + 12;
  
     p.noStroke();
     p.fill(C_MUTED);
     p.textSize(10);
     p.textAlign(p.LEFT, p.CENTER);
     p.text('MIN', leftX, midY);
     leftX += 28;
  
     leftX = drawButton('−', leftX, midY, btnH, () => {
       durationMin = p.constrain(durationMin - 1, MIN_DURATION, MAX_DURATION);
     });
     leftX += 6;
  
     // Duration display (fixed-width slot so the +/- buttons don't jiggle)
     p.noStroke();
     p.fill(C_INK);
     p.textSize(13);
     p.textAlign(p.CENTER, p.CENTER);
     const slotW = 28;
     p.text(String(durationMin), leftX + slotW / 2, midY);
     leftX += slotW;
  
     leftX = drawButton('+', leftX, midY, btnH, () => {
       durationMin = p.constrain(durationMin + 1, MIN_DURATION, MAX_DURATION);
     });
  
     // Right side: RESET, STOP, START laid out right-to-left
     let rightX = barX + barW - 12;
     rightX = drawButtonRight('RESET', rightX, midY, btnH, resetTimer);
     rightX -= 6;
     rightX = drawButtonRight('STOP', rightX, midY, btnH, stopTimer);
     rightX -= 6;
     rightX = drawButtonRight('START', rightX, midY, btnH, startTimer);
   }
  
   function drawButton(label, x, midY, h, onClick) {
     p.textSize(11);
     p.textFont('monospace');
     const padX = 12;
     const w = p.textWidth(label) + padX * 2;
     const y = midY - h / 2;
  
     const hover = p.mouseX >= x && p.mouseX <= x + w &&
                   p.mouseY >= y && p.mouseY <= y + h;
     if (hover) hoverActive = true;
  
     p.noStroke();
     p.fill(0, 0, 0, hover ? 200 : 100);
     p.rect(x, y, w, h, 3);
  
     p.noFill();
     p.stroke(hover ? C_ACCENT : C_LINE);
     p.strokeWeight(1);
     p.rect(x, y, w, h, 3);
  
     p.noStroke();
     p.fill(hover ? C_ACCENT : C_INK);
     p.textAlign(p.CENTER, p.CENTER);
     p.text(label, x + w / 2, midY);
  
     controls.push({ x, y, w, h, onClick });
     return x + w;
   }
  
   function drawButtonRight(label, rightX, midY, h, onClick) {
     p.textSize(11);
     p.textFont('monospace');
     const padX = 12;
     const w = p.textWidth(label) + padX * 2;
     drawButton(label, rightX - w, midY, h, onClick);
     return rightX - w;
   }
  
   // Format centiseconds as MM:SS.cc
   function formatTime(cs) {
     cs = Math.max(0, Math.floor(cs));
     const totalSec = Math.floor(cs / 100);
     const min = Math.floor(totalSec / 60);
     const sec = totalSec % 60;
     const frac = cs % 100;
     const pad = (n) => String(n).padStart(2, '0');
     return `${pad(min)}:${pad(sec)}`;
   }
  
   function drawReadout() {
     p.noStroke();
     p.fill(C_INK);
     p.textAlign(p.CENTER, p.BOTTOM);
     p.textSize(13);
     const remainingCs = totalCs > 0 ? p.constrain(totalCs - elapsedCs, 0, totalCs) : 0;
     //p.text(formatTime(totalCs), p.width / 2, p.height - 28);
  
     p.fill(C_MUTED);
     p.textSize(10);
     let status = 'IDLE';
     if (totalCs > 0 && elapsedCs >= totalCs) status = 'COMPLETE';
     else if (isRunning) status = 'RUNNING';
     else if (elapsedCs > 0) status = 'PAUSED';
     p.text(status, p.width / 2, p.height - 10);
   }
  
   p.mousePressed = () => {
     for (const c of controls) {
       if (p.mouseX >= c.x && p.mouseX <= c.x + c.w &&
           p.mouseY >= c.y && p.mouseY <= c.y + c.h) {
         c.onClick();
         return;
       }
     }
   };
  
   // ----- Timer handlers -----
   function startTimer() {
     if (isRunning) return;
     const minutes = p.constrain(durationMin, MIN_DURATION, MAX_DURATION);
  
     if (totalCs === 0 || elapsedCs >= totalCs) {
       // Convert minutes -> centiseconds: 1 min = 60 sec = 6000 cs
       totalCs = minutes * 60 * 100;
       elapsedCs = 0;
       startMillis = p.millis();
     } else {
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
