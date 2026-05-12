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
  'Dairy':      '#000000',
  'Poultry':    '#E69F00',
  'Fish':       '#0072B2',
  'Supplement': '#CC79A7',
  'Eggs':       '#F0E442',
  'Red Meat':   '#D55E00',
  'Shellfish':  '#56B4E9'
  
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
let hoveredIndex = -1;   // index of currently hovered row; -1 means no hover


  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    setupControls();
  };

  /*p.draw = function () {
  
    // Update inflationRate from slider (convert percent to decimal)
  inflationRate = rateSlider.value() / 100;
  rateLabel.elt.textContent = 'Inflation Rate: ' + rateSlider.value().toFixed(1) + '%';
  
  hoveredIndex = getHoveredRow(); 

  p.background(220);

    drawChartTitle();
    drawAxisTitles();
    drawAxes();
    drawXAxisTicks();
    drawDataPoints();

    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };*/

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

  function getHoveredRow() {
    if (!proteinData) return -1;
  
    // Mouse must be within the plot area to count as hovering
    if (p.mouseX < PLOT_LEFT || p.mouseX > PLOT_RIGHT) return -1;
    if (p.mouseY < PLOT_TOP || p.mouseY > PLOT_BOTTOM) return -1;
  
    // Inverse of rowToY: figure out which row the cursor is in
    const rowCount = proteinData.getRowCount();
    const relativeY = p.mouseY - PLOT_TOP;
    const rowIndex = Math.floor((relativeY / (PLOT_BOTTOM - PLOT_TOP)) * rowCount);
  
    if (rowIndex < 0 || rowIndex >= rowCount) return -1;
    return rowIndex;
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
    p.text('Projecting the Inflating Cost of Protein', CANVAS_SIZE / 2, 25);

    p.textSize(13);
    p.fill(40);
    p.text('Adjust the inflation rate and timescale below the chart to project how high prices could rise.', CANVAS_SIZE / 2, 52);
  }

  function drawAxisTitles() {
    p.noStroke();
    p.fill(60);
    p.textSize(18);

    p.textAlign(p.CENTER, p.TOP);
    p.text('Cost per 40g of protein (USD, log scale)', PLOT_LEFT + PLOT_WIDTH / 2, PLOT_BOTTOM + 60);

    p.push();
    p.translate(25, PLOT_TOP + PLOT_HEIGHT / 2);
    p.rotate(-p.HALF_PI);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Protein Source', 0, 0);
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
    const rowHeight = (PLOT_BOTTOM - PLOT_TOP) / rowCount;   // hoist out of loop
  
    for (let i = 0; i < rowCount; i++) {
      const row = proteinData.getRow(i);
      const cost = row.getNum('Cost_USD');
      const source = row.get('Source');          // <-- was 'Code'
      const sourceType = row.get('Source Type');
  
      const sourceColor = p.color(SOURCE_COLORS[sourceType] || '#404040');
  
      const futureCost = projectedCost(cost, inflationRate, yearsOut);
      const xToday = costToX(cost);
      const isOffChart = futureCost > COST_MAX;
      const xFuture = isOffChart ? PLOT_RIGHT - 8 : costToX(futureCost);
      const y = rowToY(i, rowCount);
  
      p.textSize(10);// <-- slightly smaller for fit
      // 0. Hover highlight — drawn first so everything else sits on top
if (i === hoveredIndex) {
  p.noStroke();
  p.fill(220);
  p.rect(PLOT_LEFT, y - rowHeight / 2, CANVAS_SIZE - PLOT_LEFT, rowHeight);
}
      p.textAlign(p.LEFT, p.CENTER);             // <-- text starts at xFuture, extends right
  
      // 1. Trail line — stops 4px before text starts
      p.stroke(210);
      p.strokeWeight(1);
      const lineEndX = xFuture - 4;
      if (lineEndX > xToday) {
        p.line(xToday, y, lineEndX, y);
      }
  
      // 2. Today's dot
      p.noStroke();
      p.fill(100);
      p.circle(xToday, y, 4);
  
      // 3. Projected source name (the text itself serves as the colored marker)
      if (isOffChart) {
        sourceColor.setAlpha(120);
      }
  
      if (sourceType === 'Eggs') {
        p.stroke(60);
        p.strokeWeight(0.5);
      } else {
        p.noStroke();
      }
  
      p.fill(sourceColor);
      p.text(source, xFuture, y);
    }
  }

  p.draw = function () {
    inflationRate = rateSlider.value() / 100;
    const labelEl = document.getElementById('inflation-rate-label');
    if (labelEl) {
      labelEl.textContent = 'Inflation rate: ' + rateSlider.value().toFixed(1) + '%';
    }
  
    hoveredIndex = getHoveredRow();   // <-- ADD this line for hover detection
  
    p.background(255);                 // <-- CHANGE from 80 to 240 (light gray)
  
    drawChartTitle();
    drawAxisTitles();
    drawAxes();
    drawXAxisTicks();
    drawDataPoints();
    drawProjectionReadout();
    drawColorLegend();
    drawTooltip();
  
    // Frames
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

  function drawColorLegend() {
    const x = PLOT_RIGHT - 10;
    const startY = PLOT_TOP + 100;     // below the projection readout
    const lineHeight = 17;
    const swatchSize = 10;
  
    // Header
    p.noStroke();
    p.fill(120);
    p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('Source type', x, startY - 18);
  
    // Iterate through SOURCE_COLORS in insertion order
    p.textSize(14);
    let i = 0;
    for (const sourceType in SOURCE_COLORS) {
      const itemY = startY + i * lineHeight;
  
      // Label text (right-aligned, sits to the left of the swatch)
      p.fill(80);
      p.text(sourceType, x - swatchSize - 6, itemY);
  
      // Color swatch (small square at the right edge)
      p.stroke(180);
      p.strokeWeight(0.5);
      p.fill(SOURCE_COLORS[sourceType]);
      p.rect(x - swatchSize, itemY - swatchSize / 2, swatchSize, swatchSize);
  
      i++;
    }

   // --- Today's price key (gray dot) ---
  const dotKeyY = startY + i * lineHeight + 8;   // extra gap after last category

  // Label
  p.fill(80);
  p.text('Price in 2025', x - swatchSize - 6, dotKeyY);

  // Gray dot — matching the actual today's-price marker (same color/size)
  p.fill(160);
  p.circle(x - swatchSize / 2, dotKeyY, 4); 
  
  }

  function drawTooltip() {
    if (hoveredIndex === -1) return;   // nothing to draw if not hovering
  
    const row = proteinData.getRow(hoveredIndex);
    const source = row.get('Source');
    const cost = row.getNum('Cost_USD');
  
    const futureCost = projectedCost(cost, inflationRate, yearsOut);
    const percentChange = Math.round((futureCost / cost - 1) * 100);
  
    // Build the content lines as an array of { text, size, color } objects
    const lines = [
      { text: source, size: 12, color: 30 },
      { text: 'Today (2025): $' + cost.toFixed(2), size: 11, color: 80 }
    ];
  
    if (yearsOut > 0) {
      lines.push({
        text: `In ${yearsOut} yr: $${futureCost.toFixed(2)} (+${percentChange}%)`,
        size: 11,
        color: 80
      });
    }
  
    // Measure the widest line so the box fits the content
    const padding = 10;
    const lineHeight = 17;
  
    let maxWidth = 0;
    for (const line of lines) {
      p.textSize(line.size);
      maxWidth = Math.max(maxWidth, p.textWidth(line.text));
    }
  
    const boxWidth = maxWidth + padding * 2;
    const boxHeight = lines.length * lineHeight + padding * 2 - 4;
  
    // Position the box near (but offset from) the cursor
    const x = p.mouseX + 14;
    const y = p.mouseY + 10;
  
    // Background fill
    p.noStroke();
    p.fill(255);
    p.rect(x, y, boxWidth, boxHeight, 3);   // last param = corner radius
  
    // Subtle border
    p.noFill();
    p.stroke(180);
    p.strokeWeight(0.5);
    p.rect(x, y, boxWidth, boxHeight, 3);
  
    // Draw each line
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
  
    let textY = y + padding;
    for (const line of lines) {
      p.textSize(line.size);
      p.fill(line.color);
      p.text(line.text, x + padding, textY);
      textY += lineHeight;
    }
  }

  

  function setupControls() {
    const canvasRect = p.canvas.getBoundingClientRect();
  
    // --- Label + live value display (above the slider) ---
    rateLabel = p.createDiv('Inflation Rate: 2.7%');
    rateLabel.id('inflation-rate-label');
    rateLabel.position(
      canvasRect.left + window.scrollX + MARGIN_LEFT,
      canvasRect.bottom + window.scrollY + 15
    );
    rateLabel.style('font-family', 'monospace');
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
