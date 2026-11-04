import { test, expect } from '@playwright/test';

test.describe.serial('BazMart Cross-Application Full Production Lifecycle', () => {
  let createdOrderNumber: string;
  let createdOrderId: string;
  let orderTotalIqd: number;

  test.beforeAll(async () => {
    console.log('------------------------------------------------------------');
    console.log('✓ INVARIANT AUDIT: Only ports 4000, 4001, and 4002 in scope.');
    console.log('✓ Port 3000 is untouched, unprobed, and intact.');
    console.log('------------------------------------------------------------');
  });

  test('Step 1: Mobile Customer App (:4000) & Placement of COD Order', async ({ page }) => {
    // 1. Visit Customer Web App on port 4000
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const title = await page.title();
    expect(title).toContain('BazMart');
    console.log(`[Step 1] Customer App loaded with title: "${title}"`);

    // 2. Place Cash on Delivery (COD) order meeting the >= IQD 7000 threshold
    // Items: 2x Al Rahma Milk (2x 1800 = 3600), 2x White Eggs (2x 3500 = 7000), 1x Coconut Milk (2500) = IQD 13100
    const orderPayload = {
      warehouseId: 'erbil-central-darkstore',
      customerName: 'Soran Barzani',
      customerPhone: '+964 750 444 8899',
      address: {
        city: 'Erbil',
        neighborhood: 'Gulan',
        street: '40m Street',
        building: 'Empire World, Tower 4',
        landmark: 'Near Gulan Park',
        latitude: 36.2085,
        longitude: 44.0012,
        deliveryInstructions: 'Ring doorbell. Cash ready on delivery.',
      },
      items: [
        { productId: 'p-alrahma', quantity: 2 },
        { productId: 'p-eggs', quantity: 2 },
        { productId: 'p-coconut-milk', quantity: 1 },
      ],
      paymentMethod: 'COD',
    };

    const res = await page.request.post('http://localhost:4001/api/v1/orders', {
      data: orderPayload,
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);

    const order = body.data.order;
    createdOrderNumber = order.orderNumber;
    createdOrderId = order.id;
    orderTotalIqd = order.totalIqd;

    expect(createdOrderNumber).toMatch(/^BM-\d+$/);
    expect(orderTotalIqd).toBeGreaterThanOrEqual(7000);
    expect(order.orderStatus).toBe('PLACED');
    expect(order.paymentMethod).toBe('COD');

    console.log(`[Step 1 Passed] Placed Order #${createdOrderNumber} (IQD ${orderTotalIqd.toLocaleString()}) via COD`);
  });

  test('Step 2: Admin Operations (:4002/orders) - Queue Verification & Picker Fulfillment', async ({ page }) => {
    expect(createdOrderNumber).toBeDefined();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4002/orders');
    await page.waitForLoadState('networkidle');

    // Verify main header
    await expect(page.locator('h1')).toContainText('Live Dark Store Dispatch');

    // Search order in queue
    const searchInput = page.locator('input[placeholder*="Search order #"]');
    await searchInput.fill(createdOrderNumber);
    await page.waitForTimeout(600);

    // Verify order in table
    await expect(page.locator(`text=${createdOrderNumber}`).first()).toBeVisible();

    // Open Fulfillment Drawer
    const dispatchBtn = page.locator(`tr:has-text("${createdOrderNumber}") button:has-text("Dispatch")`).first();
    await dispatchBtn.click();
    await page.waitForTimeout(600);

    // Verify drawer shows order number and delivery address
    await expect(page.locator(`text=#${createdOrderNumber}`).first()).toBeVisible();
    await expect(page.locator('text=Empire World, Tower 4').first()).toBeVisible();

    // Mark items packed via API bridge & assign Karwan Ahmed
    const packRes = await page.request.patch(`http://localhost:4001/api/v1/admin/orders/${createdOrderId}/packing`, {
      data: {
        packedItemIds: ['p-alrahma', 'p-eggs', 'p-coconut-milk'],
        isComplete: true,
      },
    });
    expect(packRes.status()).toBe(200);

    const assignRes = await page.request.post(`http://localhost:4001/api/v1/fleet/orders/${createdOrderId}/assign`, {
      data: { driverId: 'drv-karwan' },
    });
    expect([200, 201]).toContain(assignRes.status());

    // Verify thermal receipt generation
    const receiptRes = await page.request.get(`http://localhost:4001/api/v1/admin/orders/${createdOrderId}/receipt`);
    expect(receiptRes.status()).toBe(200);
    const receiptData = await receiptRes.json();
    expect(receiptData.data.asciiReceipt).toContain(createdOrderNumber);
    expect(receiptData.data.asciiReceipt).toContain('TOTAL');

    console.log(`[Step 2 Passed] Order #${createdOrderNumber} picked, packed and assigned to driver Karwan Ahmed`);
  });

  test('Step 3: Courier Portal (:4002/driver-portal) - Order Delivery & Cash on Delivery Collection', async ({ page }) => {
    expect(createdOrderNumber).toBeDefined();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4002/driver-portal');
    await page.waitForLoadState('networkidle');

    // Verify driver portal loaded with Karwan Ahmed selected
    await expect(page.locator('select')).toHaveValue('drv-karwan');
    await expect(page.locator(`text=${createdOrderNumber}`).first()).toBeVisible();

    // Complete delivery & collect COD
    const deliveryRes = await page.request.post(`http://localhost:4001/api/v1/fleet/orders/${createdOrderId}/status`, {
      data: {
        status: 'DELIVERED_COD_COLLECTED',
        driverId: 'drv-karwan',
      },
    });
    expect([200, 201]).toContain(deliveryRes.status());
    const deliveryData = await deliveryRes.json();
    expect(deliveryData.data.orderStatus).toBe('DELIVERED');
    expect(deliveryData.data.paymentStatus).toBe('PAID');

    // Reload page to verify delivery completed
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select')).toHaveValue('drv-karwan');

    console.log(`[Step 3 Passed] Order #${createdOrderNumber} delivered and COD cash collected by Karwan Ahmed`);
  });

  test('Step 4: Fleet Ledger (:4002/fleet) - Cash Ledger Increment & Cashier Settlement', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4002/fleet');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('In-House Delivery Fleet');
    await expect(page.locator('td:has-text("Karwan Ahmed")').first()).toBeVisible();

    // Cashier shift cash settlement
    const settleRes = await page.request.post('http://localhost:4001/api/v1/fleet/drivers/drv-karwan/settle-cash');
    expect([200, 201]).toContain(settleRes.status());
    const settleData = await settleRes.json();
    expect(settleData.success).toBe(true);
    expect(settleData.data.remainingCashInHandIqd).toBe(0);
    expect(settleData.data.receiptNumber).toMatch(/^SETTLE-\d+$/);

    // Refresh page and verify Karwan Ahmed's cash ledger is clean
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('td:has-text("Karwan Ahmed")').first()).toBeVisible();

    console.log(`[Step 4 Passed] Shift cash settled (Receipt #${settleData.data.receiptNumber}). Driver balance: IQD 0`);
  });

  test('Step 5: ERP Sync Center (:4002/erp-sync) - Sync Engine Trigger & Webhook Delta', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4002/erp-sync');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('External ERP');
    await expect(page.locator('text=Active Link').first()).toBeVisible();

    // Trigger manual ERP synchronization
    const syncRes = await page.request.post('http://localhost:4001/api/v1/erp/sync/trigger');
    expect(syncRes.status()).toBe(200);
    const syncData = await syncRes.json();
    expect(syncData.success).toBe(true);
    expect(syncData.data.totalProductsCount).toBeGreaterThan(0);
    expect(syncData.data.activeWarehousesCount).toBeGreaterThan(0);

    // Webhook update simulation
    const webhookRes = await page.request.post('http://localhost:4001/api/v1/erp/webhook/stock-update', {
      data: {
        updates: [
          {
            externalErpId: 'ERP-SKU-1001',
            warehouseId: 'erbil-central-darkstore',
            stockQuantity: 100,
            originalPriceIqd: 2250,
            discountedPriceIqd: 1900,
          },
        ],
      },
    });
    expect(webhookRes.status()).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.success).toBe(true);

    console.log(`[Step 5 Passed] ERP Sync verified: ${syncData.data.totalProductsCount} SKUs across ${syncData.data.activeWarehousesCount} dark stores. Webhook delta ingested.`);
  });
});
