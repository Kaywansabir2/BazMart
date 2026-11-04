import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/step21');
const artifactDir = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';

async function saveBoth(page: any, filename: string, options: any = {}) {
  const localPath = path.join(screenshotDir, filename);
  const artPath = path.join(artifactDir, filename);
  await page.screenshot({ path: localPath, ...options });
  try {
    fs.copyFileSync(localPath, artPath);
  } catch (e) {
    console.warn('Failed to copy to artifact dir:', e);
  }
}

test.beforeAll(async () => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

test.describe('Step 21 Master Deep UI & UX Audit (:4000 & :4002)', () => {

  // ==========================================
  // CUSTOMER APP (:4000)
  // ==========================================

  test('01. Customer App Home Page - Kurdish Sorani RTL, Sulaymaniyah Hub & Promo Cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_01_home_hero_and_artwork_ckb.png');
  });

  test('02. Customer App Home Page - Scroll to Category Grid & Top Savers Shelf', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    await page.waitForTimeout(5000);
    await page.mouse.move(720, 500);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(2000);
    await saveBoth(page, 'step21_cust_02_home_category_grid_and_shelf_ckb.png');
  });

  test('03. Category Products Screen - Dairy & Eggs with Realistic Photos & Aisle Tags', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=category&id=dairy-eggs');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_03_category_products_grid_ckb.png');
  });

  test('04. Product Detail Screen - Studio Photo, 3 Metadata Badges & Quantity Selector', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_04_product_detail_photo_and_tabs_ckb.png');
  });

  test('05. Product Photo Full-Screen Tap-to-Zoom Viewer Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma&zoom=true');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_05_product_photo_zoom_modal_ckb.png');
  });

  test('06. Cart Screen with Items, Subtotal & Free Delivery Threshold Progress', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_06_cart_with_items_and_threshold_ckb.png');
  });

  test('07. Cart Screen Available Vouchers Bottom Sheet Drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000&coupons=true');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_07_cart_coupons_drawer_ckb.png');
  });

  test('08. Empty Cart State with Illustrated Empty Bag & Return to Shopping CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_08_empty_cart_screen_ckb.png');
  });

  test('09. Checkout Screen with Sulaymaniyah Default Delivery Address & COD', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=checkout&cart_threshold=15000');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_09_checkout_screen_sulaymaniyah_ckb.png');
  });

  test('10. Order Tracking Screen with Live Timeline, Driver Card & Sulaymaniyah Route', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=tracking&order_id=BM-SULY-8842&driver=Karwan+Sleman');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_10_order_tracking_screen_ckb.png');
  });

  test('11. Customer Profile Screen - Guest State (Clean Header, Dev Hint & 1-Tap Login)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_11_profile_guest_state_ckb.png');
  });

  test('12. Customer Profile Screen - Authenticated Account (Ako Muhamad, Wallet & Addresses)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&auth_phone=%2B9647701234567');
    await page.waitForTimeout(5000);
    await saveBoth(page, 'step21_cust_12_profile_authenticated_sulaymaniyah_ckb.png');
  });

  // ==========================================
  // ADMIN & OPERATIONS PORTALS (:4002)
  // ==========================================

  test('13. Admin Dashboard Command Center (Kurdish Sorani RTL, GMV & 3% Commission)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_01_command_center_ckb.png');
  });

  test('14. Admin Catalog Table with 44x44px Rounded Photo Thumbnails & In-Store Aisles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/catalog');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_02_catalog_photos_and_aisles_ckb.png');
  });

  test('15. Admin Orders Management Screen with Kurdish Customer Profiles & Dispatch Actions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/orders');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_03_orders_management_ckb.png');
  });

  test('16. In-Store Picker Portal with Aisle Coordinates & 48x48px Realistic Photos', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/picker-portal');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_04_picker_portal_with_aisles_and_photos_ckb.png');
  });

  test('17. Partner Supermarket Transparency Portal (97% Partner Payable / 3% BazMart Settlement)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/partner-portal');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_05_partner_transparency_portal_ckb.png');
  });

  test('18. POS Live Simulator Sandbox (100% Shelf Price Parity & Commission Calculator)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/pos-simulator');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_06_pos_simulator_and_parity_ckb.png');
  });

  test('19. POS Database Connection Wizard (Live Ping, Schema Mapping & Dark Store Binding)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/pos-wizard');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_07_pos_connection_wizard_ckb.png');
  });

  test('20. Driver Dispatch & Fleet Portal (Active Deliveries & Status Workflow)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/driver-portal');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_08_driver_dispatch_portal_ckb.png');
  });

  test('21. Finance & Double-Entry Accounting Ledger (Daily Supermarket Settlements)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/finance');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_09_finance_settlements_ckb.png');
  });

  test('22. Supply Chain & Dark Store Replenishment (Real-Time Stock Depletion Alerts)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/supply-chain');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_10_supply_chain_and_stock_ckb.png');
  });

  test('23. Admin Settings & Audit Logs (Operating Hours & Governance Trail)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/settings');
    await page.waitForTimeout(4000);
    await saveBoth(page, 'step21_admin_11_settings_and_audit_logs_ckb.png');
  });

});
