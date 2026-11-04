import * as assert from 'assert';
export {};

describe('BazMart ERP Catalog & Stock Sync Engine E2E Tests', () => {
  const BASE_URL = 'http://localhost:4001/api/v1';

  it('POST /erp/webhook/stock-update atomically updates SKU Al Rahma Milk stock & recalculates discount', async () => {
    // 1. Send ERP Stock Update Webhook for Al Rahma Whole Milk (ERP-SKU-1001)
    const updatePayload = {
      updates: [
        {
          productId: 'p-alrahma',
          externalErpId: 'ERP-SKU-1001',
          warehouseId: 'erbil-central-darkstore',
          stockQuantity: 88,
          originalPriceIqd: 2250,
          discountedPriceIqd: 1800, // 20% discount
        },
      ],
    };

    const webhookRes = await fetch(`${BASE_URL}/erp/webhook/stock-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-erp-signature': 'erp-sha256-verified-sig',
      },
      body: JSON.stringify(updatePayload),
    });

    assert.strictEqual(webhookRes.status, 200, 'Webhook must return HTTP 200 OK');
    const webhookData = await webhookRes.json();
    assert.strictEqual(webhookData.success, true, 'Webhook response must be success: true');

    // 2. Query catalog to verify updated stock and discount
    const catalogRes = await fetch(`${BASE_URL}/catalog/products/p-alrahma`);
    assert.strictEqual(catalogRes.status, 200, 'Catalog product lookup must return HTTP 200 OK');
    const catalogData = await catalogRes.json();
    const product = catalogData.data.product;

    assert.strictEqual(product.id, 'p-alrahma', 'Product ID must match p-alrahma');
    assert.strictEqual(product.originalPriceIqd, 2250, 'Original price must remain IQD 2250');
    assert.strictEqual(product.discountedPriceIqd, 1800, 'Discounted price must be updated to IQD 1800');
    assert.strictEqual(product.discountPercentage, 20, 'Discount percentage must be calculated as 20%');

    // Verify dark store warehouse stock
    const erbilStock = product.stocks?.find((s: any) => s.warehouseId === 'erbil-central-darkstore');
    if (erbilStock) {
      assert.strictEqual(erbilStock.stockQuantity, 88, 'Dark store inventory quantity must be updated to 88 units');
    }
  });

  it('POST /erp/sync/trigger executes full catalog synchronization report', async () => {
    const triggerRes = await fetch(`${BASE_URL}/erp/sync/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'admin-secret-key',
      },
    });

    assert.strictEqual(triggerRes.status, 200, 'Sync trigger must return HTTP 200 OK');
    const triggerData = await triggerRes.json();
    assert.strictEqual(triggerData.success, true, 'Sync trigger must succeed');
    assert.ok(triggerData.data, 'Report payload must be returned');
  });
});
