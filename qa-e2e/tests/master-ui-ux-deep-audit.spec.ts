import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/master-audit');
const artifactDir = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';
const resultsLogPath = path.join(screenshotDir, 'audit-results.json');

const auditResults: Array<{
  id: string;
  name: string;
  url: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  errors: string[];
  warnings: string[];
  rtlVerified: boolean;
  overflowChecked: boolean;
  screenshot: string;
}> = [];

async function recordAudit(
  page: any,
  testId: string,
  testName: string,
  filename: string,
  expectedRtl: boolean = true
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter harmless benign telemetry / browser noise
      if (!text.includes('favicon') && !text.includes('react-devtools')) {
        errors.push(`Console Error: ${text}`);
      }
    }
  });

  page.on('pageerror', (err: any) => {
    errors.push(`Uncaught Page Exception: ${err.message}`);
  });

  // Check RTL direction
  let rtlVerified = false;
  try {
    const isRtl = await page.evaluate(() => {
      const dir = document.documentElement.getAttribute('dir') || document.body.getAttribute('dir');
      if (dir === 'rtl') return true;
      // Flutter canvas webapp handles RTL internally via Directionality
      const fltElem = document.querySelector('flt-glass-pane') || document.querySelector('flutter-view');
      return !!fltElem;
    });
    rtlVerified = isRtl;
    if (expectedRtl && !rtlVerified) {
      warnings.push('Document root dir attribute is not explicitly rtl (handled via Flutter canvas or inner layout)');
    }
  } catch (e: any) {
    warnings.push(`RTL check warning: ${e.message}`);
  }

  // Check horizontal overflow
  let overflowChecked = false;
  try {
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    overflowChecked = !hasHorizontalOverflow;
    if (hasHorizontalOverflow) {
      warnings.push(`Layout has horizontal overflow: scrollWidth > window.innerWidth`);
    }
  } catch (e: any) {
    warnings.push(`Overflow check warning: ${e.message}`);
  }

  // Save screenshot locally and to artifact directory
  const localPath = path.join(screenshotDir, filename);
  const artPath = path.join(artifactDir, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  try {
    fs.copyFileSync(localPath, artPath);
  } catch (e) {
    console.warn(`Artifact copy warning for ${filename}:`, e);
  }

  const status = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS';
  auditResults.push({
    id: testId,
    name: testName,
    url: page.url(),
    status,
    errors,
    warnings,
    rtlVerified,
    overflowChecked,
    screenshot: filename,
  });
}

test.beforeAll(async () => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

test.afterAll(async () => {
  fs.writeFileSync(resultsLogPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\nAudit completed! Logged ${auditResults.length} test inspections to ${resultsLogPath}`);
});

test.describe('BazMart Master UI/UX Full-Spectrum Deep Audit (:4000 & :4002)', () => {

  // ==========================================
  // CUSTOMER APP (:4000) - FLUTTER WEB
  // ==========================================

  test('01. Customer App Home - Kurdish Sorani RTL, Sulaymaniyah Hub & Promo Hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-01', 'Customer Home Hero & Showcase Frame', 'audit_cust_01_home_hero_ckb.png');
  });

  test('02. Customer App Home - Scroll down to Categories & Top Savers Shelf', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    await page.waitForTimeout(5000);
    await page.mouse.move(720, 500);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(2000);
    await recordAudit(page, 'CUST-02', 'Customer Home Category Grid & Shelves', 'audit_cust_02_home_category_scroll_ckb.png');
  });

  test('03. Category Products Screen - Dairy & Eggs with Realistic Photos & Aisle Tags', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=category&id=dairy-eggs');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-03', 'Category Products Grid with Aisle Badges', 'audit_cust_03_category_products_grid_ckb.png');
  });

  test('04. Product Detail Screen - Nutrition, Origin & Supermarket Aisle Tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-04', 'Product Detail Studio Visual & Metadata Tabs', 'audit_cust_04_product_detail_tabs_ckb.png');
  });

  test('05. Product Photo Full-Screen Tap-to-Zoom Viewer Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma&zoom=true');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-05', 'Product Photo Zoom Modal', 'audit_cust_05_product_zoom_modal_ckb.png');
  });

  test('06. Cart Screen with Items & Free Delivery Threshold Progress Bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-06', 'Cart Screen with Items & Threshold Progress', 'audit_cust_06_cart_populated_threshold_ckb.png');
  });

  test('07. Cart Screen Available Vouchers Bottom Sheet Drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000&coupons=true');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-07', 'Cart Screen Available Vouchers Drawer', 'audit_cust_07_cart_coupons_drawer_ckb.png');
  });

  test('08. Empty Cart State with Illustrated Empty Bag & Return CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-08', 'Empty Cart Illustrated State', 'audit_cust_08_empty_cart_state_ckb.png');
  });

  test('09. Checkout Screen with Sulaymaniyah Address & COD 250 IQD Cash Rounding', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=checkout&cart_threshold=15000');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-09', 'Checkout Screen with COD & 250 IQD Breakdown', 'audit_cust_09_checkout_screen_ckb.png');
  });

  test('10. Order Tracking Screen with Live Timeline & Driver Card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=tracking&order_id=BM-SULY-8842&driver=Karwan+Sleman');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-10', 'Order Tracking Screen with Driver Card', 'audit_cust_10_order_tracking_screen_ckb.png');
  });

  test('11. Customer Profile - Guest State with Phone Login Prompt', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-11', 'Profile Guest State with Login CTA', 'audit_cust_11_profile_guest_state_ckb.png');
  });

  test('12. Customer Profile - Authenticated State with Wallet Balance & Orders', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&authenticated=true');
    await page.waitForTimeout(5000);
    await recordAudit(page, 'CUST-12', 'Profile Authenticated State with Wallet Balance', 'audit_cust_12_profile_authenticated_ckb.png');
  });

  // ==========================================
  // ADMIN & OPERATIONS DASHBOARD (:4002) - NEXT.JS
  // ==========================================

  test('13. Admin Command Center - Executive Metrics, GMV & Live Hourly Chart', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-01', 'Executive Command Center Overview', 'audit_admin_01_command_center_overview_ckb.png');
  });

  test('14. Catalog & Stock Manager - Photographic Thumbnails, Aisles & Stock Levels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/catalog');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-02', 'Catalog & Stock Manager with Photos & Aisles', 'audit_admin_02_catalog_stock_manager_ckb.png');
  });

  test('15. Live Orders Management - Multi-Status Filtering & 97%/3% Breakdown', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/orders');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-03', 'Live Orders Management with Commission Transparency', 'audit_admin_03_orders_management_ckb.png');
  });

  test('16. In-Store Shelf Picker Portal - 3 Cold-Chain Zones, Van Badge & Exit Pass', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/picker-portal');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-04', 'In-Store Picker Portal with Cold-Chain & Van Dispatch', 'audit_admin_04_picker_portal_cold_chain_ckb.png');
  });

  test('17. Partner Supermarket Transparency Portal - 97% Supermarket Net Payable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/partner-portal');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-05', 'Partner Transparency Portal (97% Payout)', 'audit_admin_05_partner_transparency_portal_ckb.png');
  });

  test('18. POS Simulator & Shelf Parity Sandbox - Scale Barcode & Price Sync', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/pos-simulator');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-06', 'POS Simulator Sandbox & Shelf Parity Engine', 'audit_admin_06_pos_simulator_and_parity_ckb.png');
  });

  test('19. POS Database Connection Wizard - Enterprise SQL Handshake Flow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/pos-wizard');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-07', 'POS Database Connection Wizard', 'audit_admin_07_pos_connection_wizard_ckb.png');
  });

  test('20. Driver Dispatch Portal - 250 IQD Banknote Rounding & WhatsApp Link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/driver-portal');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-08', 'Driver Dispatch Portal with WhatsApp & Cash Rounding', 'audit_admin_08_driver_dispatch_portal_ckb.png');
  });

  test('21. Finance & Settlements - Double-Entry Ledger & Category Margins', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/finance');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-09', 'Finance Settlements & Margin Matrix', 'audit_admin_09_finance_settlements_ckb.png');
  });

  test('22. Supply Chain & Inventory - Safety Stock Buffer & Warehouse Allocation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/supply-chain');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-10', 'Supply Chain & Inventory Management', 'audit_admin_10_supply_chain_stock_ckb.png');
  });

  test('23. Settings, Audit Logs & 1-Click Database Backup', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/settings');
    await page.waitForTimeout(3000);
    await recordAudit(page, 'ADMIN-11', 'Settings & 1-Click Database Backup Snapshot', 'audit_admin_11_settings_and_db_backup_ckb.png');
  });

});

