<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\WarehouseStock;
use App\Models\FinancialLedgerEntry;
use Illuminate\Support\Str;

class Step19ScaleBarcodeAndPartialReturnTest extends TestCase
{
    /**
     * Test variable weight scale barcode parsing (2001005012509)
     */
    public function test_scale_barcode_2001005012509_parses_weight_and_parity(): void
    {
        $response = $this->postJson('/api/v1/catalog/parse-scale-barcode', [
            'barcode' => '2001005012509',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'isScaleBarcode' => true,
                'barcode' => '2001005012509',
                'plu' => '01005',
                'canonicalErpSku' => 'ERP-SKU-1005',
                'weightGrams' => 1250,
                'weightKg' => 1.25,
                'totalShelfPriceIqd' => 1806,
                'priceVarianceIqd' => 0,
                'parityRate' => 100.0,
                'bazmartCommission3pctIqd' => 54,
                'supermarketNet97pctIqd' => 1752,
            ],
        ]);

        // Also test GET /api/v1/catalog/barcode/:barcode
        $getRes = $this->getJson('/api/v1/catalog/barcode/2001005012509');
        $getRes->assertStatus(200);
        $getRes->assertJson([
            'success' => true,
            'isScaleBarcode' => true,
            'posShelfPriceIqd' => 1806,
            'varianceIqd' => 0,
            'bazmartCommission3pctIqd' => 54,
            'supermarketNet97pctIqd' => 1752,
        ]);
    }

    /**
     * Test doorstep partial item return on an order of IQD 100,000 returning IQD 10,000 worth of items
     * Subtotal: 100,000 -> 90,000
     * BazMart 3%: 3,000 -> 2,700
     * Supermarket 97%: 97,000 -> 87,300
     * Stock restored to darkstore
     */
    public function test_doorstep_partial_item_return_and_commission_recalculation(): void
    {
        $warehouseId = 'suly-main-darkstore';

        // 1. Fetch an existing seeded product
        $product = Product::first();
        $this->assertNotNull($product, 'At least one product must exist in database');

        // 2. Ensure initial stock
        $stock = WarehouseStock::firstOrCreate(
            ['warehouse_id' => $warehouseId, 'product_id' => $product->id],
            ['stock_quantity' => 50, 'safety_stock' => 10]
        );
        $initialStockQty = (int)$stock->stock_quantity;

        // 3. Create a benchmark order of IQD 100,000 (10 units x 10,000 IQD)
        $orderId = 'ord-test-' . Str::random(8);
        $order = Order::create([
            'id' => $orderId,
            'order_number' => '#BM-RET-' . strtoupper(Str::random(5)),
            'customer_phone' => '+9647701234567',
            'warehouse_id' => $warehouseId,
            'address_snapshot' => ['city' => 'Sulaymaniyah', 'street' => 'Salim St'],
            'gross_merchandise_value_iqd' => 100000,
            'total_cogs_iqd' => 70000,
            'gross_profit_before_coupon_iqd' => 30000,
            'subtotal_iqd' => 100000,
            'pos_shelf_subtotal_iqd' => 100000,
            'commission_rate_percent' => 3.00,
            'bazmart_commission_iqd' => 3000,
            'supermarket_payable_iqd' => 97000,
            'total_iqd' => 100000,
            'payment_method' => 'COD',
            'order_status' => 'OUT_FOR_DELIVERY',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price_iqd' => 10000,
            'pos_shelf_unit_price_iqd' => 10000,
            'total_iqd' => 100000,
            'returned_quantity' => 0,
        ]);

        // 4. Execute Doorstep Partial Return of 1 unit (10,000 IQD)
        $response = $this->postJson("/api/v1/fleet/orders/{$order->id}/partial-return", [
            'orderItemId' => (string)$orderItem->id,
            'returnedQuantity' => 1,
            'reason' => 'Doorstep refusal due to damaged packaging',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'orderId' => (string)$order->id,
                'returnedQuantity' => 1,
                'returnAmountIqd' => 10000,
                'oldSubtotalIqd' => 100000,
                'newSubtotalIqd' => 90000,
                'bazmartCommission3pctIqd' => 2700,
                'supermarketPayable97pctIqd' => 87300,
                'newTotalIqd' => 90000,
            ],
        ]);

        // 5. Database Assertions
        $order->refresh();
        $this->assertEquals(90000, $order->subtotal_iqd);
        $this->assertEquals(90000, $order->pos_shelf_subtotal_iqd);
        $this->assertEquals(2700, $order->bazmart_commission_iqd);
        $this->assertEquals(87300, $order->supermarket_payable_iqd);
        $this->assertEquals(90000, $order->total_iqd);
        $this->assertTrue((bool)$order->has_partial_returns);

        // Check stock restored
        $stock->refresh();
        $this->assertEquals($initialStockQty + 1, $stock->stock_quantity);

        // Check StockMovement
        $movement = StockMovement::where('order_id', (string)$order->id)
            ->where('movement_type', 'ORDER_PARTIAL_RETURN_RESTORE')
            ->first();
        $this->assertNotNull($movement);
        $this->assertEquals(1, $movement->quantity_change);

        // Check FinancialLedgerEntry
        $ledger = FinancialLedgerEntry::where('order_id', (string)$order->id)
            ->where('entry_type', 'DOORSTEP_PARTIAL_RETURN_REVERSAL')
            ->first();
        $this->assertNotNull($ledger);
        $this->assertEquals(10000, $ledger->amount_iqd);

        // Clean up test order
        $orderItem->delete();
        $order->delete();
    }

    /**
     * Test Live POS Database Connection Wizard endpoint
     */
    public function test_live_pos_database_connection_test_wizard(): void
    {
        $response = $this->postJson('/api/v1/admin/erp/test-connection', [
            'engine' => 'sqlsrv',
            'host' => '192.168.1.100',
            'port' => '1433',
            'database' => 'SulyHypermarket_POS_DB',
            'tableName' => 'tbl_ItemsShelfMaster',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'connectionStatus' => 'CONNECTED_ACTIVE',
                'targetEngine' => 'sqlsrv',
                'verifiedSkusCount' => 400,
                'priceVarianceIqd' => 0,
                'commissionRatePercent' => 3.00,
                'supermarketSharePercent' => 97.00,
            ],
        ]);
    }
}
