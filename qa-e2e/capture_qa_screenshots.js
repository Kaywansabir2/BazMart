const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\85ad3565-5f5b-4232-a621-be418a0ce773';

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome' });

  // 1. Mobile App Customer Viewport (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_01_mobile_customer_home.png') });
  console.log('✓ Captured qa_01_mobile_customer_home.png');
  await mobileContext.close();

  // 2. Desktop Admin Overview (1280x800)
  const adminContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const adminPage = await adminContext.newPage();

  // Overview
  await adminPage.goto('http://localhost:4002', { waitUntil: 'networkidle' });
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_02_admin_overview.png') });
  console.log('✓ Captured qa_02_admin_overview.png');

  // Orders & Fulfillment
  await adminPage.goto('http://localhost:4002/orders', { waitUntil: 'networkidle' });
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_03_admin_orders.png') });
  console.log('✓ Captured qa_03_admin_orders.png');

  // Fleet Reconciliation
  await adminPage.goto('http://localhost:4002/fleet', { waitUntil: 'networkidle' });
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_04_fleet_reconciliation.png') });
  console.log('✓ Captured qa_04_fleet_reconciliation.png');

  // ERP Sync
  await adminPage.goto('http://localhost:4002/erp-sync', { waitUntil: 'networkidle' });
  await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_05_erp_sync_control.png') });
  console.log('✓ Captured qa_05_erp_sync_control.png');

  // Driver Portal Mobile View
  const driverContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:4002/driver-portal', { waitUntil: 'networkidle' });
  await driverPage.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_06_driver_portal_mobile.png') });
  console.log('✓ Captured qa_06_driver_portal_mobile.png');
  await driverContext.close();

  await adminContext.close();
  await browser.close();
  console.log('ALL QA SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch(console.error);

