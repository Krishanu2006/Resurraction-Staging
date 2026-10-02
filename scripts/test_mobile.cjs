const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testMobile() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const outDir = path.resolve(__dirname, 'screenshots');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Wait 4.5s for reveal sequence to settle on mobile
  await new Promise(r => setTimeout(r, 4500));

  const mobilePath = path.join(outDir, 'hero_mobile_fresh.png');
  await page.screenshot({ path: mobilePath });
  console.log('Saved fresh mobile screenshot to:', mobilePath);

  // Full page on mobile
  const mobileFull = path.join(outDir, 'mobile_full_page.png');
  await page.screenshot({ path: mobileFull, fullPage: true });
  console.log('Saved mobile full page to:', mobileFull);

  await browser.close();
}

testMobile().catch(console.error);
