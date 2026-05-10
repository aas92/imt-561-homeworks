// Example 10 placeholder
registerSketch('sk16', function (p) {
  let clockFont = "Calisto";

  p.setup = function () {
    p.createCanvas(800, 600);
    p.noStroke();
  };

  p.draw = function () {



    const shelfY_hours = p.height * 0.30;
    const shelfY_minutes = p.height * 0.55;
    const shelfY_seconds = p.height * 0.80;
    const mn = p.minute();
    const sc = p.second();
    let hr24 = p.hour();
    let hr = hr24 % 12;

    if (hr === 0) hr = 12;

    if (hr24 >= 12) {
      p.background('#22253bff');
    } else {
      p.background('#fcf3f3ff');
    }


    drawShelfPlank(shelfY_hours);
    drawShelfPlank(shelfY_minutes);
    drawShelfPlank(shelfY_seconds);

    drawBooks(shelfY_hours, hr, 12);   // hours shelf
    drawBooks(shelfY_minutes, mn, 60); // minutes shelf
    drawBooks(shelfY_seconds, sc, 60); // seconds shelf

    drawPlant(shelfY_hours, hr);
    drawPlant(shelfY_minutes, mn);
    drawPlant(shelfY_seconds, sc);


  };

  function drawShelfPlank(y) {
    p.fill(139, 90, 43);
    p.rect(50, y, p.width - 100, 40, 5);
  }

  function drawPlant(shelfY, time) {
    //pot
    const potWidth = 60;
    const potHeight = 40;
    const potX = p.width - 150;
    const potY = shelfY - potHeight;

    p.fill(200, 100, 100);
    p.rect(potX, potY, potWidth, potHeight, 5);

    p.fill(180, 80, 80);
    p.rect(potX, potY, potWidth, 10, 5);

    //leaves
    p.fill(100, 200, 100);
    p.ellipse(potX + potWidth / 2, potY - 10, 20, 40);
    p.ellipse(potX + potWidth / 2 - 15, potY - 5, 20, 30);
    p.ellipse(potX + potWidth / 2 + 15, potY - 5, 20, 30);

    p.fill(80, 180, 80);
    p.ellipse(potX + potWidth / 2, potY - 10, 15, 30);
    p.ellipse(potX + potWidth / 2 - 10, potY - 5, 15, 20);
    p.ellipse(potX + potWidth / 2 + 10, potY - 5, 15, 20);

    //time
    p.fill('#fcf3f3dc');
    p.textFont(clockFont);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(25);
    p.text(time + "", potX + potWidth / 2, potY + 40);
  }

  function drawBooks(shelfY, count, maxCount) {
    const leftMargin = 100;
    const rightMargin = 100;
    const usableWidth = p.width - leftMargin - (rightMargin + 70);
    const bookSpacing = 4;
    const bookW = usableWidth / maxCount - bookSpacing;

    const palette = [
      '#9E87C0',
      '#9E8015',
      '#97A0F7',
      '#D7AAA8',
      '#2F5ACA',
      '#CBA4DF',
      '#bdb2ff',
      '#566539'
    ];

    let x = leftMargin;
    for (let i = 0; i < count; i++) {
      const c = palette[i % palette.length];

      let h = 90;

      if (i % 2 === 0) {
        h -= 5;
      } else {
        h += 5;
      }

      const yTop = shelfY - h;

      p.fill(c);
      p.rect(x, yTop, bookW, h);

      // spine
      p.fill(0, 40);
      p.rect(x + bookW - 3, yTop, 3, h);

      x += bookW + bookSpacing;
    }

  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
