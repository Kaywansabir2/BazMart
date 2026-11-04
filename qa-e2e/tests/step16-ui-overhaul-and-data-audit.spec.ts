import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/step16');
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

test.describe('Step 16: Ultra-Premium UI/UX Visual Overhaul, Kurdish RTL Polish & Zero-Empty-Table Audit', () => {

  test('1. Customer App Showcase Mode (iPhone 16 Pro Bezel & Live POS Inspector Card)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/');
    
    // Allow Flutter Web engine and CanvasKit to fully initialize and render
    await page.waitForTimeout(6000);

    // Save screenshot of the Showcase Shell
    await saveBoth(page, 'step16_01_customer_showcase_mode_ckb.png');
  });

  test('2. Customer App Fullscreen / Widescreen Storefront Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(5000);

    // Click mode toggle on inspector card (around x: 1050, y: 340)
    await page.mouse.click(1050, 340);
    await page.waitForTimeout(2000);

    await saveBoth(page, 'step16_02_customer_fullscreen_mode_ckb.png');
  });

  test('3. Customer App Search Screen & Kurdish Sorani Chips & Packaging Visuals', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(5000);

    // Click on the search bar area inside the iPhone frame (around x: 670, y: 155)
    await page.mouse.click(670, 155);
    await page.waitForTimeout(2500);

    await saveBoth(page, 'step16_03_customer_product_detail_and_cart_ckb.png');
  });

  test('4. Admin Command Center Executive SVG Charts & RTL Sidebar Scrollbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Ensure Kurdish Sorani is active
    const kurdishBtn = page.locator('button:has-text("کوردی")');
    if (await kurdishBtn.isVisible()) {
      await kurdishBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verify Executive SVG Charts are rendered
    const chartHeading = page.locator('h3:has-text("داھاتی ٧ ڕۆژی سوپەرمارکێت"), h3:has-text("7-Day Supermarket Sales")').first();
    await expect(chartHeading).toBeVisible();

    // Verify Dark Store v16.0 Enterprise badge in sidebar
    await expect(page.locator('text=Dark Store v16.0 Enterprise').first()).toBeVisible();

    await saveBoth(page, 'step16_04_admin_command_center_charts_ckb.png', { fullPage: true });
  });

  test('5. Admin Finance Partner Supermarket Settlements (100% Shelf-Price & Fixed 3% Commission)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/finance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Switch to settlements tab
    const settlementsTab = page.locator('button:has-text("Supermarket Settlements"), button:has-text("حیساباتی مارکێتە هاوبەشەکان")').first();
    await expect(settlementsTab).toBeVisible();
    await settlementsTab.click();
    await page.waitForTimeout(1500);

    // Verify vouchers are visible in table
    await expect(page.locator('text=POS-SET-10001').first()).toBeVisible();
    await expect(page.locator('text=POS-SET-10005').first()).toBeVisible();

    await saveBoth(page, 'step16_05_admin_finance_3pct_settlements_ckb.png', { fullPage: true });
  });

  test('6. Admin ERP Sync Interactive POS Architecture Flow Diagram & Latency Ping', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/erp-sync');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Verify POS diagram is visible
    await expect(page.locator('text=Partner Supermarket POS').first()).toBeVisible();
    await expect(page.locator('text=142ms Sync Latency').first()).toBeVisible();

    // Click Test POS Bridge Ping button
    const pingBtn = page.locator('button:has-text("Test POS Bridge Ping"), button:has-text("Verifying Bridge")').first();
    if (await pingBtn.isVisible()) {
      await pingBtn.click();
      await page.waitForTimeout(1500);
    }

    await saveBoth(page, 'step16_06_admin_pos_bridge_diagram_ckb.png', { fullPage: true });
  });

  test('7. Admin Staff Audit Trail & Verified Customer Ratings', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/ratings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify customer reviews loaded
    await expect(page.getByText('Customer Ratings & Reviews').first()).toBeVisible();
    await expect(page.getByText(/Excellent service|گەیاندنی زۆر خێرا بوو|سوپاس بۆ کاک کاروان/).first()).toBeVisible();

    await saveBoth(page, 'step16_07_admin_ratings_and_audit_logs_ckb.png', { fullPage: true });
  });

});
