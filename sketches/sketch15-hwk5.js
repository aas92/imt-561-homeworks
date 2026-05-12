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

  // Okabe-Ito palette: colorblind-friendly categorical colors
  const SOURCE_COLORS = {
  'Legume':     '#009E73',
  'Dairy':      '#56B4E9',
  'Poultry':    '#E69F00',
  'Fish':       '#0072B2',
  'Supplement': '#CC79A7',
  'Eggs':       '#F0E442',
  'Red Meat':   '#D55E00',
  'Shellfish':  '#000000'
};

  let proteinData;
  p.preload = function() {
    proteinData = p.loadTable(
      'data/Protein_costper40g_2025.csv','csv','header'
    );
  }

let inflationRate = 0.027;   // 2.7% — close to the recent food-at-home average
let yearsOut = 10;            // project 10 years into the future
let rateSlider;
let rateLabel;
let yearButtons = [];
const YEAR_OPTIONS = [0, 5, 10, 20];


  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    setupControls();
  };

  p.draw = function () {
    // Update inflationRate from slider (convert percent to decimal)
  inflationRate = rateSlider.value() / 100;
  rateLabel.elt.textContent = 'Inflation rate: ' + rateSlider.value().toFixed(1) + '%';
    p.background(250);

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
      const sourceType = row.get('Source Type');
  
      const sourceColor = p.color(SOURCE_COLORS[sourceType] || '#404040');
  
      const futureCost = projectedCost(cost, inflationRate, yearsOut);
      const xToday = costToX(cost);
      const isOffChart = futureCost > COST_MAX;
      const xFuture = isOffChart ? PLOT_RIGHT - 8 : costToX(futureCost);
      const y = rowToY(i, rowCount);
  
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
  
      const lineEndX = xFuture - p.textWidth(code) / 2 - 2;
  
      // 1. Trail line
      p.stroke(210);
      p.strokeWeight(1);
      if (lineEndX > xToday) {
        p.line(xToday, y, lineEndX, y);
      }
  
      // 2. Today's dot
      p.noStroke();
      p.fill(160);
      p.circle(xToday, y, 4);
  
      // 3. Projected abbreviation
      if (isOffChart) {
        sourceColor.setAlpha(120);
      }
  
      // Apply outline only for low-contrast categories (currently just Eggs/yellow)
      if (sourceType === 'Eggs') {
        p.stroke(0);
        p.strokeWeight(1);
      } else {
        p.noStroke();
      }
  
      p.fill(sourceColor);
      p.text(code, xFuture, y);
  
      // Off-chart arrow (no outline on the triangle)
      if (isOffChart) {
        p.noStroke();
        const arrowX = xFuture + p.textWidth(code) / 2 + 3;
        p.triangle(arrowX, y - 3, arrowX, y + 3, arrowX + 5, y);
      }
    }
  }

  p.draw = function () {
    inflationRate = rateSlider.value() / 100;
    const labelEl = document.getElementById('inflation-rate-label');
if (labelEl) {
  labelEl.textContent = 'Inflation rate: ' + rateSlider.value().toFixed(1) + '%';
}
  
    p.background(255);
  
    drawChartTitle();
    drawAxisTitles();
    drawAxes();
    drawXAxisTicks();
    drawDataPoints();
    drawProjectionReadout();   // <-- new
  
    // Frame
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function drawProjectionReadout() {
    const x = PLOT_RIGHT - 10;
    const y = PLOT_TOP + 10;
  
    p.noStroke();
    p.textAlign(p.RIGHT, p.TOP);
  
    // Special case: "Today" button is selected
    if (yearsOut === 0) {
      p.fill(40);
      p.textSize(13);
      p.text("Today's prices", x, y);
      return;
    }
  
    // Calculate the projection numbers
    const multiplier = Math.pow(1 + inflationRate, yearsOut);
    const ratePercent = (inflationRate * 100).toFixed(1);
    const example = (1.00 * multiplier).toFixed(2);
    const percentChange = ((multiplier - 1) * 100).toFixed(0);
  
    // Top line: scenario summary (smaller, lighter)
    p.fill(120);
    p.textSize(14);
    p.text('At ' + ratePercent + '% over ' + yearsOut + ' years', x, y);
  
    // Bottom line: the concrete example (larger, darker)
    p.fill(40);
    p.textSize(15);
    p.text('$1.00 → $' + example + '  (+' + percentChange + '%)', x, y + 16);
  }

  function setupControls() {
    const canvasRect = p.canvas.getBoundingClientRect();
  
    // --- Label + live value display (above the slider) ---
    rateLabel = p.createDiv('Inflation rate: 2.7%');
    rateLabel.id('inflation-rate-label');
    rateLabel.position(
      canvasRect.left + window.scrollX + MARGIN_LEFT,
      canvasRect.bottom + window.scrollY + 15
    );
    rateLabel.style('font-family', 'sans-serif');
    rateLabel.style('font-size', '12px');
    rateLabel.style('color', '#444');
  
    // --- Slider (moved down to make room for label) ---
    rateSlider = p.createSlider(0, 8, 2.7, 0.1);
    rateSlider.style('width', '200px');
    rateSlider.position(
      canvasRect.left + window.scrollX + MARGIN_LEFT,
      canvasRect.bottom + window.scrollY + 38   // was 15
    );
  
    // --- Year buttons (aligned with new slider position) ---
    YEAR_OPTIONS.forEach((year, index) => {
      const label = year === 0 ? 'Today' : year + ' yr';
      const btn = p.createButton(label);
      btn.position(
        canvasRect.left + window.scrollX + MARGIN_LEFT + 230 + index * 70,
        canvasRect.bottom + window.scrollY + 36   // was 13
      );
      btn.style('width', '60px');
      btn.style('cursor', 'pointer');
      btn.mousePressed(() => {
        yearsOut = year;
        updateButtonStates();
      });
      yearButtons.push({ element: btn, year: year });
    });
  
    updateButtonStates();
  }

  function updateButtonStates() {
    yearButtons.forEach(b => {
      if (b.year === yearsOut) {
        b.element.style('background', '#333');
        b.element.style('color', 'white');
        b.element.style('border', '1px solid #333');
      } else {
        b.element.style('background', 'white');
        b.element.style('color', '#333');
        b.element.style('border', '1px solid #ccc');
      }
    });
  }

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});
