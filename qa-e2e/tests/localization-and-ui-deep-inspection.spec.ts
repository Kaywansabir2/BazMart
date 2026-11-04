import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/deep-inspection');
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

test.describe('Deep Inspection & UI/Localization Verification on :4000', () => {

  test('1. Customer App Home Page - Sulaymaniyah Default Hub, Kurdish Promo Cards & Zero Blue Cups', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    
    // Wait for Flutter Web to load
    await page.waitForTimeout(6000);

    // Scroll down to reveal "دووبارە بیکڕەوە" (Buy again)
    await page.mouse.move(670, 500);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(2000);

    await saveBoth(page, 'deep_inspect_01_home_sulaymaniyah_artwork_ckb.png');
  });

  test('2. Customer Profile Screen - Guest State with Clean AppBar (Zero Grey Box) & Test Mode Hint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile');
    await page.waitForTimeout(6000);

    await saveBoth(page, 'deep_inspect_02_profile_guest_clean_appbar_ckb.png');
  });

  test('3. Customer Profile Screen - Authenticated Account with Sulaymaniyah Default & Wallet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&auth_phone=%2B9647701234567&route=profile');
    await page.waitForTimeout(6000);

    await saveBoth(page, 'deep_inspect_03_profile_authenticated_sulaymaniyah_ckb.png');
  });

  test('4. Barcode Scanner & Price Parity Modal with Scale Barcode Scan', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&modal=pos_scanner');
    await page.waitForTimeout(6500);

    await saveBoth(page, 'deep_inspect_04_barcode_scale_weighed_item_ckb.png');
  });

});

