const { chromium } = require('playwright');
async function inspectDom() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', res => {
    if (res.status() >= 400) console.log('BAD STATUS:', res.status(), res.url());
    else console.log('RES:', res.status(), res.url());
  });

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);
  await browser.close();
}
inspectDom().catch(console.error);
