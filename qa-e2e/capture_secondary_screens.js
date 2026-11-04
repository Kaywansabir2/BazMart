const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\85ad3565-5f5b-4232-a621-be418a0ce773';
const SCREENSHOT_DIR = path.join(__dirname, 'audit-screenshots');

function saveDual(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACT_DIR, filename);
  return Promise.all([
    page.screenshot({ path: p1 }),
    page.screenshot({ path: p2 }),
  ]);
}

async function captureSecondary() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Visit Customer Home
  await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Scroll down to see Buy Again & Best Sellers
  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(1000);
  await saveDual(page, 'audit_14_customer_buy_again_best_sellers.png');
  console.log('✓ Captured audit_14_customer_buy_again_best_sellers.png');

  // Scroll down to Top Savers & Categories Grid
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);
  await saveDual(page, 'audit_15_customer_top_savers_discounts.png');
  console.log('✓ Captured audit_15_customer_top_savers_discounts.png');

  // Scroll down to Around The World Countries
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(1000);
  await saveDual(page, 'audit_16_customer_countries_and_brands.png');
  console.log('✓ Captured audit_16_customer_countries_and_brands.png');

  await browser.close();
  console.log('Secondary captures finished successfully.');
}

captureSecondary().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

