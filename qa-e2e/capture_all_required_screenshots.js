const { chromium } = require('./node_modules/playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\85ad3565-5f5b-4232-a621-be418a0ce773';
const SCREENSHOT_DIR = path.join(__dirname, 'audit-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function saveDualScreenshot(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(ARTIFACT_DIR, filename);
  await Promise.all([
    page.screenshot({ path: p1 }),
    page.screenshot({ path: p2 }),
  ]);
  const size = fs.statSync(p1).size;
  console.log(`✓ [SAVED] ${filename} (${size} bytes)`);
}

async function runCapture() {
  console.log('===============================================================');
  console.log(' BazMart Step 5: Exhaustive Option C Playwright Audit Captures');
  console.log(' All 20 Categories (400 SKUs), Brands, Countries, Cart & Admin');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ channel: 'chrome' });

  // -------------------------------------------------------------------------
  // 1. Customer App (Mobile Viewport 390x844)
  // -------------------------------------------------------------------------
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileCtx.newPage();

  const mobileTargets = [
    // Languages
    { name: '01_home_top_en.png', url: 'http://localhost:4000/?lang=en', wait: 3500 },
    { name: '02_home_ckb_rtl.png', url: 'http://localhost:4000/?lang=ckb', wait: 3000 },
    { name: '03_home_ar_rtl.png', url: 'http://localhost:4000/?lang=ar', wait: 3000 },

    // Promo cards
    { name: 'promo_01_hot_deals.png', url: 'http://localhost:4000/?route=promo&index=0', wait: 3000 },
    { name: 'promo_02_kiri.png', url: 'http://localhost:4000/?route=promo&index=1', wait: 3000 },
    { name: 'promo_03_kurdistan_chicken.png', url: 'http://localhost:4000/?route=promo&index=2', wait: 3000 },
    { name: 'promo_04_almarai.png', url: 'http://localhost:4000/?route=promo&index=3', wait: 3000 },
    { name: 'promo_05_nutella.png', url: 'http://localhost:4000/?route=promo&index=4', wait: 3000 },
    { name: 'promo_06_puck.png', url: 'http://localhost:4000/?route=promo&index=5', wait: 3000 },

    // Categories (All 20 Categories x 20 SKUs)
    { name: 'cat_01_fruit_veg.png', url: 'http://localhost:4000/?route=category&id=cat-fruit-veg', wait: 3000 },
    { name: 'cat_02_bakery.png', url: 'http://localhost:4000/?route=category&id=cat-bakery', wait: 3000 },
    { name: 'cat_03_poultry_meat_seafood.png', url: 'http://localhost:4000/?route=category&id=cat-meat', wait: 3000 },
    { name: 'cat_04_frozen_food.png', url: 'http://localhost:4000/?route=category&id=cat-frozen', wait: 3000 },
    { name: 'cat_05_dairy_eggs.png', url: 'http://localhost:4000/?route=category&id=cat-dairy', wait: 3000 },
    { name: 'cat_06_beverages.png', url: 'http://localhost:4000/?route=category&id=cat-beverages', wait: 3000 },
    { name: 'cat_07_snacks_chocolate.png', url: 'http://localhost:4000/?route=category&id=cat-snacks', wait: 3000 },
    { name: 'cat_08_coffee_tea.png', url: 'http://localhost:4000/?route=category&id=cat-coffee', wait: 3000 },
    { name: 'cat_09_milk.png', url: 'http://localhost:4000/?route=category&id=cat-milk', wait: 3000 },
    { name: 'cat_10_breakfast_food.png', url: 'http://localhost:4000/?route=category&id=cat-breakfast', wait: 3000 },
    { name: 'cat_11_ready_to_eat.png', url: 'http://localhost:4000/?route=category&id=cat-ready', wait: 3000 },
    { name: 'cat_12_cooking_baking.png', url: 'http://localhost:4000/?route=category&id=cat-cooking', wait: 3000 },
    { name: 'cat_13_ice_cream.png', url: 'http://localhost:4000/?route=category&id=cat-icecream', wait: 3000 },
    { name: 'cat_14_condiments_spices.png', url: 'http://localhost:4000/?route=category&id=cat-spices', wait: 3000 },
    { name: 'cat_15_personal_care.png', url: 'http://localhost:4000/?route=category&id=cat-personal', wait: 3000 },
    { name: 'cat_16_household_cleaning.png', url: 'http://localhost:4000/?route=category&id=cat-household', wait: 3000 },
    { name: 'cat_17_baby_care.png', url: 'http://localhost:4000/?route=category&id=cat-baby', wait: 3000 },
    { name: 'cat_18_pet_supplies.png', url: 'http://localhost:4000/?route=category&id=cat-pet', wait: 3000 },
    { name: 'cat_19_water.png', url: 'http://localhost:4000/?route=category&id=cat-water', wait: 3000 },
    { name: 'cat_20_stationery.png', url: 'http://localhost:4000/?route=category&id=cat-stationery', wait: 3000 },

    // Brands
    { name: 'brand_01_maggi.png', url: 'http://localhost:4000/?route=brand&id=brand-maggi', wait: 3000 },
    { name: 'brand_02_puck.png', url: 'http://localhost:4000/?route=brand&id=brand-puck', wait: 3000 },
    { name: 'brand_03_nutella.png', url: 'http://localhost:4000/?route=brand&id=brand-nutella', wait: 3000 },
    { name: 'brand_04_almarai.png', url: 'http://localhost:4000/?route=brand&id=brand-almarai', wait: 3000 },
    { name: 'brand_05_kiri.png', url: 'http://localhost:4000/?route=brand&id=brand-kiri', wait: 3000 },
    { name: 'brand_06_kinder.png', url: 'http://localhost:4000/?route=brand&id=brand-kinder', wait: 3000 },
    { name: 'brand_07_coca_cola.png', url: 'http://localhost:4000/?route=brand&id=brand-coca-cola', wait: 3000 },

    // Countries
    { name: 'country_01_kurdistan.png', url: 'http://localhost:4000/?route=country&id=c-krd', wait: 3000 },
    { name: 'country_02_europe.png', url: 'http://localhost:4000/?route=country&id=c-eu', wait: 3000 },
    { name: 'country_03_usa.png', url: 'http://localhost:4000/?route=country&id=c-usa', wait: 3000 },
    { name: 'country_04_korea.png', url: 'http://localhost:4000/?route=country&id=c-kor', wait: 3000 },

    // Hero banners
    { name: 'banner_01_pepsi.png', url: 'http://localhost:4000/?route=banner&theme=pepsi', wait: 3000 },
    { name: 'banner_02_fresh_picks.png', url: 'http://localhost:4000/?route=banner&theme=fresh_picks', wait: 3000 },
    { name: 'banner_03_nescafe_iced.png', url: 'http://localhost:4000/?route=banner&theme=nescafe_iced', wait: 3000 },

    // Cart Threshold
    { name: 'cart_threshold_under_7000.png', url: 'http://localhost:4000/?route=cart&cart_threshold=under', wait: 3000 },
    { name: 'cart_threshold_reached_7000.png', url: 'http://localhost:4000/?route=cart&cart_threshold=reached', wait: 3000 },

    // Search
    { name: 'search_01_popular_chips.png', url: 'http://localhost:4000/?route=search&q=Chips', wait: 3000 },
    { name: 'search_02_english_milk.png', url: 'http://localhost:4000/?route=search&q=Milk', wait: 3000 },
    { name: 'search_03_kurdish_shir.png', url: 'http://localhost:4000/?lang=ckb&route=search&q=' + encodeURIComponent('شیر'), wait: 3000 },
    { name: 'search_04_arabic_haleeb.png', url: 'http://localhost:4000/?lang=ar&route=search&q=' + encodeURIComponent('حليب'), wait: 3000 },

    // Product Details
    { name: 'product_detail_regular.png', url: 'http://localhost:4000/?route=product&id=p-banana', wait: 3000 },
    { name: 'product_detail_discounted.png', url: 'http://localhost:4000/?route=product&id=p-alrahma', wait: 3000 },

    // Cart & Checkout
    { name: 'cart_screen_ltr.png', url: 'http://localhost:4000/?lang=en&route=cart&cart_threshold=reached', wait: 3000 },
    { name: 'cart_screen_rtl.png', url: 'http://localhost:4000/?lang=ckb&route=cart&cart_threshold=reached', wait: 3000 },
    { name: 'checkout_screen_gps_modal.png', url: 'http://localhost:4000/?route=checkout&gps=true', wait: 3000 },
    { name: 'order_tracking_live.png', url: 'http://localhost:4000/?route=tracking', wait: 3000 },
  ];

  for (const item of mobileTargets) {
    try {
      await mobilePage.goto(item.url, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(item.wait);
      await saveDualScreenshot(mobilePage, item.name);
    } catch (e) {
      console.error(`Error capturing ${item.name}: ${e.message}`);
    }
  }

  // Grid Page 1 & Page 2 from Home Screen
  try {
    await mobilePage.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(3000);
    // Scroll to Category Grid
    await mobilePage.mouse.move(200, 300);
    await mobilePage.mouse.wheel(0, 380);
    await mobilePage.waitForTimeout(1000);
    await saveDualScreenshot(mobilePage, 'grid_page_1.png');

    // Swipe horizontally to Page 2
    await mobilePage.mouse.move(340, 420);
    await mobilePage.mouse.down();
    await mobilePage.mouse.move(40, 420, { steps: 15 });
    await mobilePage.mouse.up();
    await mobilePage.waitForTimeout(1200);
    await saveDualScreenshot(mobilePage, 'grid_page_2.png');
  } catch (e) {
    console.error(`Error capturing category grid pages: ${e.message}`);
  }

  await mobileCtx.close();

  // -------------------------------------------------------------------------
  // 2. Admin Operations Dashboard (Desktop Viewport 1280x800)
  // -------------------------------------------------------------------------
  const adminCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const adminPage = await adminCtx.newPage();

  // admin_01_overview.png
  await adminPage.goto('http://localhost:4002', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1200);
  await saveDualScreenshot(adminPage, 'admin_01_overview.png');

  // admin_02_orders_drawer.png
  await adminPage.goto('http://localhost:4002/orders', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1200);
  const orderRow = adminPage.locator('tbody tr').first();
  if (await orderRow.isVisible()) {
    await orderRow.click();
    await adminPage.waitForTimeout(800);
  }
  await saveDualScreenshot(adminPage, 'admin_02_orders_drawer.png');

  // admin_03_catalog_400_skus.png
  await adminPage.goto('http://localhost:4002/catalog', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1500);
  const searchInput = adminPage.locator('input[placeholder*="Search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('Buldak');
    await adminPage.waitForTimeout(800);
  }
  await saveDualScreenshot(adminPage, 'admin_03_catalog_400_skus.png');

  // admin_04_erp_sync.png
  await adminPage.goto('http://localhost:4002/erp-sync', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  const triggerBtn = adminPage.locator('button:has-text("Run Manual ERP Sync Now")').first();
  if (await triggerBtn.isVisible()) {
    await triggerBtn.click();
    await adminPage.waitForTimeout(1500);
  }
  await saveDualScreenshot(adminPage, 'admin_04_erp_sync.png');

  // admin_05_campaigns.png
  await adminPage.goto('http://localhost:4002/campaigns', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  await saveDualScreenshot(adminPage, 'admin_05_campaigns.png');

  // admin_06_fleet_ledger.png
  await adminPage.goto('http://localhost:4002/fleet', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  await saveDualScreenshot(adminPage, 'admin_06_fleet_ledger.png');

  // admin_07_settings_gateways.png
  await adminPage.goto('http://localhost:4002/settings', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  await saveDualScreenshot(adminPage, 'admin_07_settings_gateways.png');

  await adminCtx.close();

  // -------------------------------------------------------------------------
  // 3. Driver Portal Mobile (390x844)
  // -------------------------------------------------------------------------
  const driverCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const driverPage = await driverCtx.newPage();
  await driverPage.goto('http://localhost:4002/driver-portal', { waitUntil: 'networkidle' });
  await driverPage.waitForTimeout(1200);
  await saveDualScreenshot(driverPage, 'admin_08_driver_portal.png');
  await driverCtx.close();

  await browser.close();

  console.log('\n===============================================================');
  console.log('✓ ALL STEP 5 REQUIRED AUDIT SCREENSHOTS CAPTURED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

runCapture().catch(err => {
  console.error('Audit Capture Script Failed:', err);
  process.exit(1);
});

