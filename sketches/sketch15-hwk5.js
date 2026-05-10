// Instance-mode sketch for tab 15
registerSketch('sk15', function (p) {
  const CANVAS_SIZE = 800;

  // --- Layout constants ---
  // Margins define the empty space around the plot area
  const MARGIN_LEFT = 80;     // space for y-axis labels + title
  const MARGIN_RIGHT = 40;    // breathing room on right
  const MARGIN_TOP = 80;      // space for chart title
  const MARGIN_BOTTOM = 100;  // space for x-axis labels + title

  // Plot area boundaries (derived from margins)
  const PLOT_LEFT = MARGIN_LEFT;
  const PLOT_RIGHT = CANVAS_SIZE - MARGIN_RIGHT;
  const PLOT_TOP = MARGIN_TOP;
  const PLOT_BOTTOM = CANVAS_SIZE - MARGIN_BOTTOM;
  const PLOT_WIDTH = PLOT_RIGHT - PLOT_LEFT;
  const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;

  // --- Data range ---
  const COST_MIN = 0;
  const COST_MAX = 16;  // small headroom past lobster tail at $15

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };

  p.draw = function () {
    p.background(255);

    drawChartTitle();
    drawAxisTitles();
    drawAxes();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function drawChartTitle() {
    p.noStroke();
    p.fill(40);
    p.textSize(20);
    p.textAlign(p.CENTER, p.TOP);
    p.text('The Cost of Protein', CANVAS_SIZE / 2, 25);

    p.textSize(13);
    p.fill(120);
    p.text('Price per 40g of protein, by source', CANVAS_SIZE / 2, 52);
  }

  function drawAxisTitles() {
    p.noStroke();
    p.fill(60);
    p.textSize(12);

    // X-axis title: cost (now along the horizontal axis)
    p.textAlign(p.CENTER, p.TOP);
    p.text('Cost per 40g of protein ($)', PLOT_LEFT + PLOT_WIDTH / 2, PLOT_BOTTOM + 60);

    // Y-axis title: protein source (rotated, along left edge)
    p.push();
    p.translate(25, PLOT_TOP + PLOT_HEIGHT / 2);
    p.rotate(-p.HALF_PI);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Protein source', 0, 0);
    p.pop();
  }

  function drawAxes() {
    p.stroke(100);
    p.strokeWeight(1);
    p.noFill();

    // Y-axis (left vertical line)
    p.line(PLOT_LEFT, PLOT_TOP, PLOT_LEFT, PLOT_BOTTOM);

    // X-axis (bottom horizontal line)
    p.line(PLOT_LEFT, PLOT_BOTTOM, PLOT_RIGHT, PLOT_BOTTOM);
  }

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});
