const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleMessages.push(`[PAGE ERROR] ${err.toString()}`));

  // 1. Desktop Viewport
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  
  // Wait for the cinematic opening reveal sequence to settle (4s+)
  await new Promise(r => setTimeout(r, 4200));

  const heroPath = path.join(outDir, 'hero_desktop.png');
  await page.screenshot({ path: heroPath });
  console.log('Saved hero screenshot to:', heroPath);

  // Smooth scroll through page to trigger any viewport reveals before full page shot
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          setTimeout(resolve, 500);
        }
      }, 100);
    });
  });

  await new Promise(r => setTimeout(r, 1000));

  // Full page screenshot
  const fullPagePath = path.join(outDir, 'full_page.png');
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log('Saved full page screenshot to:', fullPagePath);

  // 2. Mobile Viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await new Promise(r => setTimeout(r, 800));
  const mobilePath = path.join(outDir, 'hero_mobile.png');
  await page.screenshot({ path: mobilePath });
  console.log('Saved mobile screenshot to:', mobilePath);

  console.log('--- Console Logs ---');
  consoleMessages.forEach(msg => console.log(msg));
  console.log('--- Done ---');

  await browser.close();
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
