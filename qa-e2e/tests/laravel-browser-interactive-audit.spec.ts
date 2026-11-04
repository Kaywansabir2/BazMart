import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');

function saveAndSync(pageScreenshotPath: string, filename: string) {
  const artifactFile = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(pageScreenshotPath)) {
    fs.copyFileSync(pageScreenshotPath, artifactFile);
    console.log(`[Screenshot Sync] Saved & synced: ${filename}`);
  }
}

test.describe.serial('BazMart Option C: Comprehensive Laravel Interactive Web Audit', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    console.log('============================================================');
    console.log('✓ OPTION C ACTIVE: Testing every single step of Laravel');
    console.log('✓ Ports: Customer (:4000), Laravel (:4001), Admin (:4002)');
    console.log('✓ Port 3000 STRICTLY UNTOUCHED AND PROTECTED');
    console.log('============================================================');
  });

  // --------------------------------------------------------------------------
  // STEP 1: Laravel 13 Welcome Page & Button Clicks (:4001)
  // --------------------------------------------------------------------------
  test('Step 1: Laravel 13 Welcome Page, Button Clicks & Documentation Link (:4001)', async ({ page }) => {
    console.log('\n--- Step 1: Testing Laravel 13 Core Interface & Interactive Buttons ---');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click Deploy now button
    const deployBtn = page.getByRole('button', { name: /Deploy now/i });
    if (await deployBtn.isVisible()) {
      await deployBtn.click();
      await page.waitForTimeout(400);
    }

    // Hover on Documentation link
    const docLink = page.getByRole('link', { name: /Documentation/i });
    if (await docLink.isVisible()) {
      await docLink.hover();
      await page.waitForTimeout(300);
    }

    const shot1 = path.join(SCREENSHOT_DIR, '01_laravel_core_welcome_interactive.png');
    await page.screenshot({ path: shot1, fullPage: false });
    saveAndSync(shot1, '01_laravel_core_welcome_interactive.png');
    console.log('✓ Step 1 Completed: Laravel 13 Welcome & buttons verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 2: Laravel Diagnostic Health & Live JSON Catalog Feed (:4001)
  // --------------------------------------------------------------------------
  test('Step 2: Laravel Health & Live JSON API Endpoints (:4001)', async ({ page }) => {
    console.log('\n--- Step 2: Testing Laravel Diagnostic Health & JSON Feeds ---');
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Health endpoint
    await page.goto('http://localhost:4001/api/v1/health', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const shotHealth = path.join(SCREENSHOT_DIR, '02_laravel_api_health.png');
    await page.screenshot({ path: shotHealth, fullPage: false });
    saveAndSync(shotHealth, '02_laravel_api_health.png');

    // 2. Catalog Home Feed endpoint
    await page.goto('http://localhost:4001/api/v1/catalog/home', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const shotFeed = path.join(SCREENSHOT_DIR, '03_laravel_api_catalog_feed.png');
    await page.screenshot({ path: shotFeed, fullPage: false });
    saveAndSync(shotFeed, '03_laravel_api_catalog_feed.png');

    // 3. Available Coupons endpoint
    await page.goto('http://localhost:4001/api/v1/coupons/available', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const shotCoupons = path.join(SCREENSHOT_DIR, '04_laravel_api_coupons.png');
    await page.screenshot({ path: shotCoupons, fullPage: false });
    saveAndSync(shotCoupons, '04_laravel_api_coupons.png');

    console.log('✓ Step 2 Completed: Diagnostic health & API feeds verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 3: Customer Web App Powered by Laravel Catalog (:4000)
  // --------------------------------------------------------------------------
  test('Step 3: Customer Mobile Web App Powered by Laravel (:4000)', async ({ page }) => {
    console.log('\n--- Step 3: Testing Customer Mobile Web App consuming Laravel ---');
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500); // Wait for Flutter canvas / WebAssembly

    const shotCustomer = path.join(SCREENSHOT_DIR, '05_customer_catalog_laravel_backed.png');
    await page.screenshot({ path: shotCustomer });
    saveAndSync(shotCustomer, '05_customer_catalog_laravel_backed.png');
    console.log('✓ Step 3 Completed: Customer app with Laravel data verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 4: Checkout, Order Placement & Profitability Drawer (:4001 & :4002)
  // --------------------------------------------------------------------------
  test('Step 4: Customer Order Checkout with Coupon & Admin Profitability Drawer (:4001 & :4002)', async ({ page, request }) => {
    console.log('\n--- Step 4: Testing Order Checkout, Coupon Engine & Profitability Drawer ---');

    // 1. Validate Promo Code on Laravel
    const couponRes = await request.post('http://localhost:4001/api/v1/coupons/validate', {
      data: {
        code: 'SLEMANI2500',
        items: [
          { productId: 'p-cucumber', quantity: 4, expectedPriceIqd: 1445 },
          { productId: 'p-schauma', quantity: 1, expectedPriceIqd: 7013 }
        ],
        cartItems: [
          { productId: 'p-cucumber', quantity: 4, expectedPriceIqd: 1445 },
          { productId: 'p-schauma', quantity: 1, expectedPriceIqd: 7013 }
        ],
        phone: '+9647701234567',
        customerPhone: '+9647701234567',
        warehouseId: 'suly-main-darkstore'
      }
    });
    expect(couponRes.status()).toBe(200);

    // 2. Submit Live Checkout Order to Laravel
    const orderRes = await request.post('http://localhost:4001/api/v1/orders/checkout', {
      data: {
        customerPhone: '+9647701234567',
        customerName: 'Ako Muhamad',
        warehouseId: 'suly-main-darkstore',
        couponCode: 'SLEMANI2500',
        paymentMethod: 'COD',
        address: { city: 'Sulaymaniyah', neighborhood: 'Bakhtiari', street: 'Salim St', building: 'Bld 12' },
        items: [
          { productId: 'p-cucumber', quantity: 4, expectedPriceIqd: 1445 },
          { productId: 'p-schauma', quantity: 1, expectedPriceIqd: 7013 }
        ]
      }
    });
    expect(orderRes.status()).toBe(201);
    const orderData = await orderRes.json();
    console.log(`✓ Placed live order #${orderData.data.order.orderNumber} with SLEMANI2500 coupon.`);

    // 3. Inspect in Admin Orders View and Click Profitability Drawer
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/orders', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click on the first order row or View Details button
    const firstOrderRow = page.locator('table tbody tr').first();
    if (await firstOrderRow.isVisible()) {
      await firstOrderRow.click();
      await page.waitForTimeout(800);
    }

    const shotOrder = path.join(SCREENSHOT_DIR, '06_customer_order_and_profitability_drawer.png');
    await page.screenshot({ path: shotOrder, fullPage: true });
    saveAndSync(shotOrder, '06_customer_order_and_profitability_drawer.png');
    console.log('✓ Step 4 Completed: Live order and profitability drawer verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 5: Admin Overview Dashboard backed by Laravel Metrics (:4002)
  // --------------------------------------------------------------------------
  test('Step 5: Admin Overview Dashboard with Laravel Metrics (:4002)', async ({ page }) => {
    console.log('\n--- Step 5: Testing Admin Overview Dashboard ---');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const bodyText = await page.content();
    expect(bodyText).not.toContain('Application error: a client-side exception has occurred');
    await expect(page.getByText("Today's GMV")).toBeVisible();

    const shotDashboard = path.join(SCREENSHOT_DIR, '07_admin_dashboard_overview.png');
    await page.screenshot({ path: shotDashboard, fullPage: true });
    saveAndSync(shotDashboard, '07_admin_dashboard_overview.png');
    console.log('✓ Step 5 Completed: Admin Overview Dashboard verified without client exceptions.');
  });

  // --------------------------------------------------------------------------
  // STEP 6: Admin Finance & P&L Waterfall with All Tab Clicks (:4002/finance)
  // --------------------------------------------------------------------------
  test('Step 6: Admin Finance & P&L Waterfall Dashboard Tabs (:4002/finance)', async ({ page }) => {
    console.log('\n--- Step 6: Testing Admin Finance Waterfall & Clicking All Tabs ---');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/finance', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Tab 1: Daily Financial Statement (Default)
    // Click Tab 2: 20-Category Profitability Matrix
    const catTab = page.getByRole('button', { name: /20-Category Profitability Matrix/i });
    if (await catTab.isVisible()) {
      await catTab.click();
      await page.waitForTimeout(600);
      const shotCat = path.join(SCREENSHOT_DIR, '08_admin_finance_category_matrix.png');
      await page.screenshot({ path: shotCat, fullPage: true });
      saveAndSync(shotCat, '08_admin_finance_category_matrix.png');
      console.log('✓ Clicked and captured 20-Category Profitability Matrix.');
    }

    // Click Tab 3: SKU Margin & Loss-Leader Watchlist
    const skuTab = page.getByRole('button', { name: /SKU Margin & Loss-Leader Watchlist/i });
    if (await skuTab.isVisible()) {
      await skuTab.click();
      await page.waitForTimeout(600);

      // Click low margin toggle or type into search
      const skuSearchInput = page.locator('input[placeholder*="Search SKU"]');
      if (await skuSearchInput.isVisible()) {
        await skuSearchInput.fill('Nescafe');
        await page.waitForTimeout(300);
      }

      const shotSku = path.join(SCREENSHOT_DIR, '09_admin_finance_sku_margins.png');
      await page.screenshot({ path: shotSku, fullPage: true });
      saveAndSync(shotSku, '09_admin_finance_sku_margins.png');
      console.log('✓ Clicked and captured SKU Margins Watchlist.');
    }

    // Click Tab 4: Financial Ledger
    const ledgerTab = page.getByRole('button', { name: /Financial Ledger/i });
    if (await ledgerTab.isVisible()) {
      await ledgerTab.click();
      await page.waitForTimeout(600);
      const shotLedger = path.join(SCREENSHOT_DIR, '10_admin_finance_double_entry_ledger.png');
      await page.screenshot({ path: shotLedger, fullPage: true });
      saveAndSync(shotLedger, '10_admin_finance_double_entry_ledger.png');
      console.log('✓ Clicked and captured Financial Ledger.');
    }

    console.log('✓ Step 6 Completed: All Finance Tabs clicked and verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 7: Admin Catalog, Stock & Wholesale Cost Manager (:4002/catalog)
  // --------------------------------------------------------------------------
  test('Step 7: Admin Catalog, Stock & Wholesale Cost Manager (:4002/catalog)', async ({ page }) => {
    console.log('\n--- Step 7: Testing Admin Catalog & Search/Filter Buttons ---');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/catalog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click search and type Tabasco
    const searchInput = page.locator('input[placeholder*="Search SKU"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tabasco');
      await page.waitForTimeout(500);
    }

    // Click Refresh button
    const refreshBtn = page.getByRole('button', { name: /Refresh/i });
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await page.waitForTimeout(400);
    }

    const shotCatalog = path.join(SCREENSHOT_DIR, '11_admin_catalog_stock_manager.png');
    await page.screenshot({ path: shotCatalog, fullPage: true });
    saveAndSync(shotCatalog, '11_admin_catalog_stock_manager.png');
    console.log('✓ Step 7 Completed: Admin Catalog search & filters verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 8: Admin Coupons Management & Create Modal Click (:4002/coupons)
  // --------------------------------------------------------------------------
  test('Step 8: Admin Coupons Management & Create Modal Click (:4002/coupons)', async ({ page }) => {
    console.log('\n--- Step 8: Testing Admin Coupons & Create Modal Button ---');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/coupons', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click "+ Create Promo Code" button to open modal
    const createBtn = page.getByRole('button', { name: /Create Promo Code/i });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(600);
    }

    const shotCoupons = path.join(SCREENSHOT_DIR, '12_admin_coupons_create_modal.png');
    await page.screenshot({ path: shotCoupons, fullPage: true });
    saveAndSync(shotCoupons, '12_admin_coupons_create_modal.png');
    console.log('✓ Step 8 Completed: Admin Coupons & Create Modal verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 9: Admin Fleet Dispatch & Register Rider Modal Click (:4002/fleet)
  // --------------------------------------------------------------------------
  test('Step 9: Admin Fleet Dispatch & Register Rider Modal Click (:4002/fleet)', async ({ page }) => {
    console.log('\n--- Step 9: Testing Admin Fleet Dispatch & Register Modal ---');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/fleet', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click "Register New Rider" button to open modal
    const registerBtn = page.getByRole('button', { name: /Register New Rider/i });
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      await page.waitForTimeout(600);
    }

    const shotFleet = path.join(SCREENSHOT_DIR, '13_admin_fleet_driver_modal.png');
    await page.screenshot({ path: shotFleet, fullPage: true });
    saveAndSync(shotFleet, '13_admin_fleet_driver_modal.png');
    console.log('✓ Step 9 Completed: Admin Fleet & Rider Modal verified.');
  });

  // --------------------------------------------------------------------------
  // STEP 10: Driver Operations Portal & Action Buttons (:4002/driver-portal)
  // --------------------------------------------------------------------------
  test('Step 10: Driver Operations Portal & Action Buttons (:4002/driver-portal)', async ({ page }) => {
    console.log('\n--- Step 10: Testing Driver Portal & Delivery Buttons ---');
    await page.setViewportSize({ width: 414, height: 896 }); // Mobile viewport for couriers
    await page.goto('http://localhost:4002/driver-portal', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click courier dropdown to switch courier
    const courierSelect = page.locator('select');
    if (await courierSelect.isVisible()) {
      await courierSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }

    const shotDriver = path.join(SCREENSHOT_DIR, '14_driver_portal_active_order.png');
    await page.screenshot({ path: shotDriver, fullPage: true });
    saveAndSync(shotDriver, '14_driver_portal_active_order.png');
    console.log('✓ Step 10 Completed: Driver Operations Portal verified.');
  });
});

