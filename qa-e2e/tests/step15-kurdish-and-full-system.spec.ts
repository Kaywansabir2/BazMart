import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/step15-kurdish');

test.beforeAll(async () => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

test.describe('Step 15: Kurdish Localization, Dark Store Operations & Full Parity Audit', () => {

  test('1. Admin Portal Kurdish Sorani RTL Overview & Layout Flipping', async ({ page }) => {
    await page.goto('http://localhost:4002/');
    await page.waitForLoadState('networkidle');

    // Switch to Kurdish Sorani
    const kurdishBtn = page.locator('button:has-text("کوردی")');
    if (await kurdishBtn.isVisible()) {
      await kurdishBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify dir="rtl" is set on the container
    const rtlContainer = page.locator('div[dir="rtl"]');
    await expect(rtlContainer).toBeVisible();

    // Verify Kurdish Sorani title and brand
    await expect(page.locator('text=بازاڕی بازماڕت').first()).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '01_admin_kurdish_rtl_overview.png'),
      fullPage: true,
    });
  });

  test('2. Dark Store Picker Item Substitution & Out-of-Stock Resolution', async ({ page }) => {
    await page.goto('http://localhost:4002/orders');
    await page.waitForLoadState('networkidle');

    // Wait for orders to load in the table
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(800);

    // Verify drawer is open
    await expect(page.locator('text=Dark Store Picker Checklist').first()).toBeVisible();

    // Click substitute button on the first item
    const substituteBtn = page.locator('button:has-text("Substitute")').first();
    await expect(substituteBtn).toBeVisible();
    await substituteBtn.click();
    await page.waitForTimeout(500);

    // Verify substitution modal is visible
    await expect(page.getByText('Item Substitution & Out-of-Stock Resolution')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '02_admin_item_substitution_modal.png'),
    });
  });

  test('3. Daily Cashier Closing Z-Report Modal & Printable Thermal Receipt', async ({ page }) => {
    await page.goto('http://localhost:4002/finance');
    await page.waitForLoadState('networkidle');

    // Click the Daily Cashier Z-Report button
    const zReportBtn = page.locator('button:has-text("Daily Cashier Z-Report")').first();
    await expect(zReportBtn).toBeVisible();
    await zReportBtn.click();
    await page.waitForTimeout(1000);

    // Verify modal and ascii receipt
    await expect(page.getByText('BAZMART DARK STORE POS')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '03_admin_daily_cashier_z_report.png'),
    });
  });

  test('4. Staff Directory & Immutable Audit Trail (RBAC)', async ({ page }) => {
    await page.goto('http://localhost:4002/staff');
    await page.waitForLoadState('networkidle');

    // Verify team members and audit trail
    await expect(page.getByText('Zanyar Soran').first()).toBeVisible();
    await expect(page.getByText('Shkar Hama').first()).toBeVisible();
    await expect(page.getByText('Enterprise Audit Trail').first()).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '04_admin_staff_and_audit_trail.png'),
      fullPage: true,
    });
  });

  test('5. Supply Chain & FEFO Expiry Radar', async ({ page }) => {
    await page.goto('http://localhost:4002/supply-chain');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Supply Chain & FEFO Expiry Radar')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '05_admin_supply_chain_fefo_radar.png'),
      fullPage: true,
    });
  });

  test('6. Customer Mobile Web App (Port 4000)', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(screenshotDir, '06_customer_app_home_step15.png'),
    });
  });

  test('7. Enterprise Services Gateway Portal (Port 4001)', async ({ page }) => {
    await page.goto('http://localhost:4001/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('BazMart Enterprise Services Gateway')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, '07_laravel_gateway_portal.png'),
    });
  });

});
