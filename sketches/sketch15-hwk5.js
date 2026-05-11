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

  // --- Data range (log scale requires COST_MIN > 0) ---
  const COST_MIN = 0.5;
  const COST_MAX = 40;

  // X-axis tick values (irregular spacing is typical of log scales)
  const X_AXIS_TICKS = [0.5, 1, 2, 5, 10, 20, 40];

  let proteinData;
  p.preload = function() {
    proteinData = p.loadTable(
      'data/Protein_costper40g_2025.csv','csv','header'
    );
  }

let inflationRate = 0.027;   // 2.7% — close to the recent food-at-home average
let yearsOut = 10;            // project 10 years into the future
let rateSlider;
let yearButtons = [];
const YEAR_OPTIONS = [0, 5, 10, 20];


  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    setupControls();
  };

  p.draw = function () {
    // Update inflationRate from slider (convert percent to decimal)
  inflationRate = rateSlider.value() / 100;
    p.background(255);

    drawChartTitle();
    drawAxisTitles();
    drawAxes();
    drawXAxisTicks();
    drawDataPoints();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  // --- Coordinate mapping (the workhorse for all data positioning) ---
  function costToX(cost) {
    // Logarithmic mapping: equal price ratios = equal pixel distances
    const logMin = Math.log(COST_MIN);
    const logMax = Math.log(COST_MAX);
    const logCost = Math.log(cost);
    return p.map(logCost, logMin, logMax, PLOT_LEFT, PLOT_RIGHT);
  }
  function rowToY(rowIndex, totalRows) {
    // +0.5 offset centers each row in its allocated vertical slot,
    // so no item sits directly on the plot edge
    return p.map(rowIndex + 0.5, 0, totalRows, PLOT_TOP, PLOT_BOTTOM);
  }

  function formatDollar(cost) {
    return cost < 1 ? '$' + cost.toFixed(2) : '$' + cost;
  }

  // --- Inflation projection helper ---
function projectedCost(currentCost, rate, years) {
  return currentCost * Math.pow(1 + rate, years);
}

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

    p.textAlign(p.CENTER, p.TOP);
    p.text('Cost per 40g of protein ($, log scale)', PLOT_LEFT + PLOT_WIDTH / 2, PLOT_BOTTOM + 60);

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

    p.line(PLOT_LEFT, PLOT_TOP, PLOT_LEFT, PLOT_BOTTOM);
    p.line(PLOT_LEFT, PLOT_BOTTOM, PLOT_RIGHT, PLOT_BOTTOM);
  }

  function drawXAxisTicks() {
    const tickLength = 5;

    X_AXIS_TICKS.forEach(cost => {
      const x = costToX(cost);

      // Tick mark
      p.stroke(100);
      p.strokeWeight(1);
      p.line(x, PLOT_BOTTOM, x, PLOT_BOTTOM + tickLength);

      // Dollar label below tick
      p.noStroke();
      p.fill(80);
      p.textSize(11);
      p.textAlign(p.CENTER, p.TOP);
      p.text(formatDollar(cost), x, PLOT_BOTTOM + tickLength + 4);
    });
  
  }
  function drawDataPoints() {
    const rowCount = proteinData.getRowCount();
  
    for (let i = 0; i < rowCount; i++) {
      const row = proteinData.getRow(i);
      const cost = row.getNum('Cost_USD');
      const code = row.get('Code');
  
      const futureCost = projectedCost(cost, inflationRate, yearsOut);
      const xToday = costToX(cost);
      const xFuture = costToX(futureCost);
      const y = rowToY(i, rowCount);
  
      // Set text properties up front so textWidth() returns the correct value
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
  
      // Calculate where the line should stop — short of the abbreviation
      const lineEndX = xFuture - p.textWidth(code) / 2 - 2;  // 2px breathing room
  
      // 1. Trail line — only draw if there's actually room (avoid drawing backwards at low inflation)
      p.stroke(210);
      p.strokeWeight(1);
      if (lineEndX > xToday) {
        p.line(xToday, y, lineEndX, y);
      }
  
      // 2. Today's position marker
      p.noStroke();
      p.fill(160);
      p.circle(xToday, y, 4);
  
      // 3. Projected position (bold abbreviation, drawn last)
      p.fill(40);
      p.text(code, xFuture, y);
    }
  }
  function setupControls() {
    rateSlider = p.createSlider(0, 8, 2.7, 0.1);
    rateSlider.style('width', '200px');
  
    // Find the canvas's actual document position and offset from there
    const canvasRect = p.canvas.getBoundingClientRect();
    rateSlider.position(
      canvasRect.left + window.scrollX + MARGIN_LEFT,
      canvasRect.bottom + window.scrollY + 15
    );
  }

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});
