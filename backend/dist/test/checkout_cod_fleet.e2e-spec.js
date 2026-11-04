"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
describe('BazMart Checkout, COD Payment & Fleet Operations E2E Tests', () => {
    const BASE_URL = 'http://localhost:4001/api/v1';
    it('POST /orders rejects cart below minimum order threshold (< IQD 7000) with HTTP 400', async () => {
        const smallOrderPayload = {
            warehouseId: 'erbil-central-darkstore',
            customerName: 'Shwan Bakr',
            customerPhone: '+964 750 111 2233',
            address: {
                city: 'Erbil',
                neighborhood: 'Dream City',
                street: 'Villa 45',
                latitude: 36.195,
                longitude: 43.992,
            },
            items: [
                { productId: 'p-cucumber', quantity: 1 },
            ],
            paymentMethod: 'COD',
        };
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(smallOrderPayload),
        });
        assert.strictEqual(res.status, 400, 'Orders below IQD 7000 must be rejected with HTTP 400 Bad Request');
        const data = await res.json();
        assert.ok(data.message?.includes('minimum order requirement') || data.message?.includes('7000'), 'Error message must specify minimum order threshold requirement of IQD 7000');
    });
    it('Complete COD Lifecycle: Valid Checkout -> Dispatch -> Delivery -> Cash Ledger -> Cashier Settlement', async () => {
        const validOrderPayload = {
            warehouseId: 'erbil-central-darkstore',
            customerName: 'Diyar Hawrami',
            customerPhone: '+964 770 555 4433',
            address: {
                city: 'Erbil',
                neighborhood: 'Bakhtiyari',
                street: 'Street 15',
                building: 'Building B, Floor 2',
                landmark: 'Opposite Family Mall',
                latitude: 36.205,
                longitude: 44.01,
            },
            items: [
                { productId: 'p-alrahma', quantity: 3 },
                { productId: 'p-cucumber', quantity: 2 },
            ],
            paymentMethod: 'COD',
        };
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validOrderPayload),
        });
        assert.strictEqual(orderRes.status, 201, 'Valid order placement must return HTTP 201 Created');
        const orderData = await orderRes.json();
        assert.strictEqual(orderData.success, true);
        const order = orderData.data.order;
        assert.ok(order.orderNumber.startsWith('BM-'), 'Order number must follow BM-XXXXX format');
        assert.ok(order.totalIqd >= 7000, 'Total IQD must meet minimum order threshold');
        assert.strictEqual(order.paymentMethod, 'COD', 'Payment method must be COD');
        assert.strictEqual(order.orderStatus, 'PLACED', 'Initial order status must be PLACED');
        const driverInitialRes = await fetch(`${BASE_URL}/fleet/drivers/drv-karwan`);
        assert.strictEqual(driverInitialRes.status, 200);
        const initialDriver = (await driverInitialRes.json()).data;
        const initialCashInHand = initialDriver.cashInHandIqd || 0;
        const assignRes = await fetch(`${BASE_URL}/fleet/orders/${order.id}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId: 'drv-karwan' }),
        });
        assert.ok(assignRes.status === 200 || assignRes.status === 201, 'Courier assignment must succeed with HTTP 200/201');
        const assignedOrder = (await assignRes.json()).data;
        assert.strictEqual(assignedOrder.orderStatus, 'OUT_FOR_DELIVERY', 'Order status must be OUT_FOR_DELIVERY');
        assert.strictEqual(assignedOrder.driverId, 'drv-karwan');
        const deliverRes = await fetch(`${BASE_URL}/fleet/orders/${order.id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'DELIVERED_COD_COLLECTED',
                driverId: 'drv-karwan',
            }),
        });
        assert.ok(deliverRes.status === 200 || deliverRes.status === 201, 'Delivery status update must succeed');
        const deliveredOrder = (await deliverRes.json()).data;
        assert.strictEqual(deliveredOrder.orderStatus, 'DELIVERED', 'Order status must be DELIVERED');
        assert.strictEqual(deliveredOrder.paymentStatus, 'PAID', 'Payment status must be marked PAID upon COD collection');
        const driverPostDeliveryRes = await fetch(`${BASE_URL}/fleet/drivers/drv-karwan`);
        const postDeliveryDriver = (await driverPostDeliveryRes.json()).data;
        assert.strictEqual(postDeliveryDriver.cashInHandIqd, initialCashInHand + order.totalIqd, `Driver cash ledger must increment by exactly IQD ${order.totalIqd}`);
        const settleRes = await fetch(`${BASE_URL}/fleet/drivers/drv-karwan/settle-cash`, {
            method: 'POST',
        });
        assert.ok(settleRes.status === 200 || settleRes.status === 201, 'Cash settlement must succeed');
        const settlementResJson = await settleRes.json();
        assert.strictEqual(settlementResJson.success, true);
        const settlementData = settlementResJson.data;
        assert.strictEqual(settlementData.remainingCashInHandIqd, 0, 'Driver balance must reset to 0 after cashier settlement');
        assert.ok(settlementData.receiptNumber.startsWith('SETTLE-'), 'Settlement receipt number must be generated');
        const driverSettledRes = await fetch(`${BASE_URL}/fleet/drivers/drv-karwan`);
        const settledDriver = (await driverSettledRes.json()).data;
        assert.strictEqual(settledDriver.cashInHandIqd, 0, 'Driver cashInHandIqd in database must be exactly 0');
    });
});
//# sourceMappingURL=checkout_cod_fleet.e2e-spec.js.map