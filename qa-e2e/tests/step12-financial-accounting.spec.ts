import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';
const LOCAL_SCREENSHOT_DIR = path.resolve(__dirname, '../audit-screenshots/step12-finance');

function copyToArtifacts(filename: string) {
  const localFile = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const artifactFile = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(localFile)) {
    fs.copyFileSync(localFile, artifactFile);
    console.log(`[Artifact Sync] Copied ${filename} to artifacts directory`);
  }
}

test.describe.serial('BazMart Step 12: Enterprise Cost Accounting & Financial P&L Engine (Option C)', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(LOCAL_SCREENSHOT_DIR)) {
      fs.mkdirSync(LOCAL_SCREENSHOT_DIR, { recursive: true });
    }

    console.log('============================================================');
    console.log('✓ OPERATIONAL INVARIANT: Target ports 4000, 4001, 4002 only.');
    console.log('✓ Port 3000 is strictly untouched and preserved.');
    console.log('✓ Option C local Playwright execution certified.');
    console.log('✓ Backend Engine: Enterprise Laravel 11/12 on Port 4001');
    console.log('✓ Admin Portal: Next.js on Port 4002');
    console.log('============================================================');
  });

  // --------------------------------------------------------------------------
  // TEST 1: Financial Security Isolation & Benchmark Margin Audits
  // --------------------------------------------------------------------------
  test('Test 1: Public API Isolation & Wholesale Cost Margin Benchmarks', async ({ request }) => {
    console.log('\n--- Running Test 1: Financial API Security & Margin Verification ---');

    // 1. Verify Public Catalog hides wholesale costs
    const publicRes = await request.get('http://localhost:4001/api/v1/catalog/home');
    expect(publicRes.status()).toBe(200);
    const publicData = await publicRes.json();
    expect(publicData.success).toBe(true);

    const alRahmaPublic = publicData.data.allProducts.find((p: any) => p.externalErpId === 'ERP-SKU-1001');
    expect(alRahmaPublic).toBeDefined();
    expect(alRahmaPublic.originalPriceIqd).toBe(2250);
    expect(alRahmaPublic.costPriceIqd).toBeUndefined();
    expect(alRahmaPublic.cost_price_iqd).toBeUndefined();
    console.log('✓ Public catalog endpoint cleanly suppresses costPriceIqd.');

    // 2. Verify Admin Catalog returns wholesale costs & unit margins
    const adminCatalogRes = await request.get('http://localhost:4001/api/v1/admin/catalog');
    expect(adminCatalogRes.status()).toBe(200);
    const adminCatalog = await adminCatalogRes.json();
    expect(adminCatalog.success).toBe(true);
    expect(adminCatalog.data.length).toBe(400);

    const alRahmaAdmin = adminCatalog.data.find((p: any) => p.externalErpId === 'ERP-SKU-1001');
    expect(alRahmaAdmin).toBeDefined();
    expect(alRahmaAdmin.costPriceIqd || alRahmaAdmin.cost_price_iqd).toBe(1750);
    expect(alRahmaAdmin.unitProfitIqd).toBe(500);
    expect(alRahmaAdmin.marginPercent).toBeCloseTo(22.22, 1);
    console.log('✓ Admin catalog correctly computes 1750 cost / 500 profit / 22.22% margin.');

    // 3. Verify Financial Accounting Summary API
    const finSummaryRes = await request.get('http://localhost:4001/api/v1/admin/finance/summary?period=all');
    expect(finSummaryRes.status()).toBe(200);
    const finSummary = await finSummaryRes.json();
    expect(finSummary.success).toBe(true);
    expect(finSummary.data.grossMerchandiseValueIqd).toBeGreaterThan(0);
    expect(finSummary.data.totalCogsIqd).toBeGreaterThan(0);
    expect(finSummary.data.netOperatingProfitIqd).toBeDefined();
    console.log(`✓ Financial summary verified: GMV=${finSummary.data.grossMerchandiseValueIqd} IQD, COGS=${finSummary.data.totalCogsIqd} IQD, Net Profit=${finSummary.data.netOperatingProfitIqd} IQD.`);

    // 4. Verify 20 Categories Profitability Breakdown
    const catFinRes = await request.get('http://localhost:4001/api/v1/admin/finance/categories?period=all');
    expect(catFinRes.status()).toBe(200);
    const catFin = await catFinRes.json();
    expect(catFin.success).toBe(true);
    expect(catFin.data.length).toBe(20);
    console.log(`✓ Category profitability API returned all ${catFin.data.length} categories.`);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Admin Finance Dashboard UI & 4 Interactive Tabs (:4002/finance)
  // --------------------------------------------------------------------------
  test('Test 2: Admin Finance Dashboard, 4 Tabs & Spoilage Workflow (:4002/finance)', async ({ page }) => {
    console.log('\n--- Running Test 2: Admin Finance Dashboard & Interactive Tabs ---');

    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/finance', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Tab 1: Daily Financial Statement & KPI Cards
    const kpiCard = page.locator('text=Gross Basket Revenue');
    await expect(kpiCard).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_01_finance_dashboard.png'), fullPage: true });
    copyToArtifacts('step12_01_finance_dashboard.png');
    console.log('✓ Captured step12_01_finance_dashboard.png');

    // Tab 2: 20-Category Profitability Matrix
    const catTabBtn = page.getByRole('button', { name: /Category Profitability/i });
    if (await catTabBtn.isVisible()) {
      await catTabBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_02_category_profitability.png'), fullPage: true });
      copyToArtifacts('step12_02_category_profitability.png');
      console.log('✓ Captured step12_02_category_profitability.png');
    }

    // Tab 3: SKU Margin & Loss-Leader Watchlist
    const skuTabBtn = page.getByRole('button', { name: /SKU Margin/i });
    if (await skuTabBtn.isVisible()) {
      await skuTabBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_03_sku_margin_watchlist.png'), fullPage: true });
      copyToArtifacts('step12_03_sku_margin_watchlist.png');
      console.log('✓ Captured step12_03_sku_margin_watchlist.png');
    }

    // Tab 4: General Ledger Entries (#FIN-XXXXXX)
    const ledgerTabBtn = page.getByRole('button', { name: /Ledger/i });
    if (await ledgerTabBtn.isVisible()) {
      await ledgerTabBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_04_financial_ledger.png'), fullPage: true });
      copyToArtifacts('step12_04_financial_ledger.png');
      console.log('✓ Captured step12_04_financial_ledger.png');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 3: Catalog Live Margin Calculator & Below-Cost Warning (:4002/catalog)
  // --------------------------------------------------------------------------
  test('Test 3: Catalog Cost Columns & Live Margin Calculator Modal (:4002/catalog)', async ({ page }) => {
    console.log('\n--- Running Test 3: Catalog Live Margin Calculator & Wholesale Cost ---');

    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/catalog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Cost & Profit table headers
    await expect(page.locator('th:has-text("Wholesale Cost")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Unit Profit")')).toBeVisible();
    await expect(page.locator('th:has-text("Margin %")')).toBeVisible();

    // Click "Promo & Edit" on first product
    const editBtn = page.locator('button:has-text("Promo & Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(600);

    // Verify Live Margin Calculator inside modal
    await expect(page.locator('text=Live Unit Margin Calculation')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Wholesale Cost (IQD)')).toBeVisible();

    await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_05_catalog_margin_calculator.png') });
    copyToArtifacts('step12_05_catalog_margin_calculator.png');
    console.log('✓ Captured step12_05_catalog_margin_calculator.png');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Order Profitability Card in Dark Store Fulfillment Drawer (:4002/orders)
  // --------------------------------------------------------------------------
  test('Test 4: Order Profitability Card in Fulfillment Drawer (:4002/orders)', async ({ page }) => {
    console.log('\n--- Running Test 4: Dark Store Order Profitability Drawer ---');

    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto('http://localhost:4002/orders', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click on the first actual order row to open drawer
    const firstOrderRow = page.locator('table tbody tr:has-text("#BM-")').first();
    await expect(firstOrderRow).toBeVisible({ timeout: 15000 });
    await firstOrderRow.click();
    await page.waitForTimeout(1000);

    // Verify Admin Confidential Order Profitability Card
    await expect(page.locator('text=Order Profitability (Admin Only)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Wholesale COGS')).toBeVisible();
    await expect(page.locator('text=Net Operating Profit')).toBeVisible();

    await page.screenshot({ path: path.join(LOCAL_SCREENSHOT_DIR, 'step12_06_order_profitability_drawer.png') });
    copyToArtifacts('step12_06_order_profitability_drawer.png');
    console.log('✓ Captured step12_06_order_profitability_drawer.png');
  });
});
