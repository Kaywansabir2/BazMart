import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/step17');
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

test.describe('Step 17: Complete 400-SKU Bespoke Artwork Engine, Barcode Scanner Parity & Live POS Simulator', () => {

  test('1. Customer App Home Lower Sections with Bespoke Artwork & Zero Blue Cups', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    
    // Wait for Flutter web engine to render
    await page.waitForTimeout(6000);

    // Scroll down inside the phone frame (around center x: 670, y: 500)
    await page.mouse.move(670, 500);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(2000);

    // Capture Home Lower Sections (Buy Again, Category Grid, Best Sellers)
    await saveBoth(page, 'step17_01_home_lower_sections_artwork_ckb.png');
  });

  test('2. Customer App Search Screen & Kurdish Sorani Chips & Packaging Visuals', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=search');
    await page.waitForTimeout(6500);

    // Save Search Screen with Kurdish Chips and clean search bar (no grey box)
    await saveBoth(page, 'step17_02_category_grid_artwork_ckb.png');
  });

  test('3. Interactive Supermarket Shelf Barcode Scanner & Price-Parity Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&modal=pos_scanner');
    await page.waitForTimeout(7000);

    // Save Barcode Scanner & Price Parity Certificate Modal
    await saveBoth(page, 'step17_03_barcode_scanner_parity_modal_ckb.png');
  });

  test('4. Admin Portal Live POS Cashier Simulator (Tool A Price Sync & Tool B 3% Calculator)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/erp-sync');
    await page.waitForTimeout(4000);

    // Scroll down slightly to display Tool A and Tool B side-by-side
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(1500);

    // Save Admin Live POS Cashier Simulator
    await saveBoth(page, 'step17_04_admin_pos_live_simulator_ckb.png');
  });

  test('5. Customer App Profile Screen with Sulaymaniyah Default & 1-Tap Login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&auth_phone=%2B9647701234567');
    await page.waitForTimeout(6500);

    // Save Profile with Ako Muhamad, Sulaymaniyah default address & 15,000 IQD wallet
    await saveBoth(page, 'step17_05_profile_screen_sulaymaniyah_ckb.png');
  });

});
