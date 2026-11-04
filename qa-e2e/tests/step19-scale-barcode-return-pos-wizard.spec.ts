import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/step19');
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

test.describe('Step 19: Supermarket Scale Barcode Engine, Partial Return Recalculation & Live POS Connection Wizard', () => {

  test('1. Scale Barcode (2001005012509) Verification & Live Weight Math on :4002 /picker-portal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/picker-portal');
    await page.waitForTimeout(3000);

    // Verify right-docked sidebar and Kurdish RTL layout
    await expect(page.locator('h1:has-text("پۆرتاڵی ئامادەکاری ناو ڕەفە")')).toBeVisible();
    await expect(page.locator('text=سووپەرمارکێتی هاوبەشی سلێمانی - شەقامی سالم').first()).toBeVisible();

    // Click the Scale Barcode quick test chip
    const scaleBtn = page.locator('[data-testid="scale-barcode-chip-btn"]');
    await expect(scaleBtn).toBeVisible();
    await scaleBtn.click();
    await page.waitForTimeout(1500);

    // Verify Scale Barcode Modal pops up with exact 1,806 IQD math
    await expect(page.locator('h3:has-text("پشکنینی تەرازووی دیجیتاڵ")')).toBeVisible();
    await expect(page.locator('text=2001005012509').first()).toBeVisible();
    await expect(page.locator('text=1,806').or(page.locator('text=١,٨٠٦')).first()).toBeVisible();

    // Capture screenshot
    await saveBoth(page, 'step19_01_scale_barcode_verifier_ckb.png');
  });

  test('2. Doorstep Partial Return & Automatic 3% / 97% Commission Recalculation on :4002 /partner-portal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/partner-portal');
    await page.waitForTimeout(3000);

    // Verify Executive Contract Header
    await expect(page.locator('h1:has-text("پۆرتاڵی شەفافیەتی هاوبەشی سووپەرمارکێت")')).toBeVisible();
    await expect(page.locator('text=١٠٠٪ نرخی سەر ڕەفەی سووپەرمارکێت • ٩٧٪ پشکی سافی سووپەرمارکێت • ٣٪ عموولەی جێگیری بازمارت')).toBeVisible();

    // Verify 4 self-reconciling KPI cards
    await expect(page.locator('text=کۆی فرۆشی سەر ڕەفە')).toBeVisible();
    await expect(page.locator('text=پشکی سافی سووپەرمارکێت').first()).toBeVisible();
    await expect(page.locator('text=عموولەی پلاتفۆرمی بازمارت')).toBeVisible();
    await expect(page.locator('text=هاوسەنگی نرخی ڕەفە')).toBeVisible();

    // Verify Order-by-Order breakdown and partial return note
    await expect(page.locator('h2:has-text("تۆماری داواکارییەکان و دابەشکاریی دارایی")')).toBeVisible();
    await expect(page.locator('text=گەڕاندنەوەی بەشەکی کاڵا لە دەرگا').or(page.locator('text=گەڕاندنەوەی ١ دانە لە دەرگا')).first()).toBeVisible();

    // Capture screenshot
    await saveBoth(page, 'step19_02_partial_return_commission_recalc_ckb.png');
  });

  test('3. Live POS Database Connection & Column-Mapping Wizard on :4002 /erp-sync', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('http://localhost:4002/erp-sync');
    await page.waitForTimeout(3000);

    // Scroll down to the Live POS Database Connection Wizard card
    const wizardHeading = page.locator('text=ڕێکخستنی بەستنەوەی ڕاستەوخۆ بە داتابەیسی کاشێری سووپەرمارکێت');
    await expect(wizardHeading).toBeVisible();
    await wizardHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Click the test POS connection button
    const testBtn = page.locator('button:has-text("تاقیکردنەوەی پەیوەندی و پشکنینی هاوتابوونی ٤٠٠ کاڵا")');
    await expect(testBtn).toBeVisible();
    await testBtn.click();
    await page.waitForTimeout(2000);

    // Verify the live verified confirmation badge appears
    await expect(page.locator('text=پەیوەندی چەسپێنرا: 400/400').or(page.locator('text=400/400'))).toBeVisible();

    // Capture screenshot
    await saveBoth(page, 'step19_03_pos_connection_wizard_ckb.png');
  });

});
