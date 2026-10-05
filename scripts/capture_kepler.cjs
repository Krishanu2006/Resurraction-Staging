const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function captureKepler() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\154.0.4258.53\\msedge.exe';
  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleMessages.push(`[PAGE ERROR] ${err.toString()}`));

  // 1. Desktop Viewport
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?theme=kepler', { waitUntil: 'networkidle0' });
  
  // Wait for 3D textures, shaders, and bloom to settle
  await new Promise(r => setTimeout(r, 3500));

  const keplerHeroPath = path.join(outDir, 'kepler_hero.png');
  await page.screenshot({ path: keplerHeroPath });
  console.log('Saved Kepler hero screenshot to:', keplerHeroPath);

  // 2. Scroll test: scroll down to trigger 30% progress
  await page.evaluate(() => {
    window.scrollTo({ top: 800, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));

  const keplerScrollPath = path.join(outDir, 'kepler_hero_scroll.png');
  await page.screenshot({ path: keplerScrollPath });
  console.log('Saved Kepler scrolled screenshot to:', keplerScrollPath);

  console.log('--- Console Logs ---');
  consoleMessages.forEach(msg => console.log(msg));
  console.log('--- Done ---');

  await browser.close();
}

captureKepler().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
