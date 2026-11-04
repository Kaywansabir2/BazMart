<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Order;
use App\Models\FinancialLedgerEntry;
use App\Models\WarehouseStock;

class FinancialAccountingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        \App\Models\CouponRedemption::where('customer_phone', '+9647701234567')->delete();
    }

    public function test_al_rahma_milk_margin_benchmark(): void
    {
        $alRahma = Product::find('p-alrahma');
        $this->assertNotNull($alRahma);
        $this->assertEquals(2250, $alRahma->original_price_iqd);
        $this->assertEquals(1750, $alRahma->cost_price_iqd);

        $unitProfit = $alRahma->original_price_iqd - $alRahma->cost_price_iqd;
        $this->assertEquals(500, $unitProfit);

        $marginPct = round(($unitProfit / $alRahma->original_price_iqd) * 100, 2);
        $this->assertEquals(22.22, $marginPct);
    }

    public function test_security_customer_endpoints_hide_cost_prices(): void
    {
        // 1. Home Screen
        $homeRes = $this->getJson('/api/v1/catalog/home');
        $homeRes->assertStatus(200);
        $firstProduct = $homeRes->json('data.allProducts.0');
        $this->assertArrayNotHasKey('costPriceIqd', $firstProduct);
        $this->assertArrayNotHasKey('cost_price_iqd', $firstProduct);

        // 2. Product Detail
        $pdpRes = $this->getJson('/api/v1/catalog/products/p-alrahma');
        $pdpRes->assertStatus(200);
        $pdpData = $pdpRes->json('data');
        $this->assertArrayNotHasKey('costPriceIqd', $pdpData);
        $this->assertArrayNotHasKey('cost_price_iqd', $pdpData);
    }

    public function test_order_placement_snapshots_cogs_and_writes_ledger(): void
    {
        Product::where('id', 'p-alrahma')->update(['discounted_price_iqd' => null]);
        WarehouseStock::where('warehouse_id', 'erbil-central-darkstore')->where('product_id', 'p-eggs')->update(['stock_quantity' => 50]);
        $idempotencyKey = 'fin-test-' . bin2hex(random_bytes(8));

        $orderPayload = [
            'customerPhone' => '+9647701234567',
            'customerName' => 'Financial Test Customer',
            'warehouseId' => 'erbil-central-darkstore',
            'address' => [
                'city' => 'Erbil',
                'neighborhood' => 'Gulan',
                'latitude' => 36.1911,
                'longitude' => 44.0092,
            ],
            'items' => [
                [
                    'productId' => 'p-alrahma',
                    'quantity' => 4, // 4 x 2250 = 9000 (Cost: 4 x 1750 = 7000)
                ],
                [
                    'productId' => 'p-eggs',
                    'quantity' => 1, // 1 x 3750 = 3750 (Cost: 1 x 2950 = 2950)
                ],
            ],
            'couponCode' => 'BAZ20', // 20% discount on 12750 = 2550
            'paymentMethod' => 'COD',
        ];

        $res = $this->withHeader('idempotency-key', $idempotencyKey)
            ->postJson('/api/v1/orders', $orderPayload);

        $res->assertStatus(201);
        $order = $res->json('data.order');

        $this->assertEquals(12750, $order['subtotalIqd']);
        $this->assertEquals(2550, $order['couponDiscountIqd']);

        // Verify customer view hides COGS & margins
        $this->assertArrayNotHasKey('totalCogsIqd', $order);
        $this->assertArrayNotHasKey('netProfitIqd', $order);

        // Verify database persistence of financial accounting fields
        $dbOrder = Order::find($order['id']);
        $this->assertNotNull($dbOrder);
        $this->assertEquals(12750, $dbOrder->subtotal_iqd);
        $this->assertEquals(9950, $dbOrder->total_cogs_iqd);
        $this->assertEquals(2800, $dbOrder->gross_profit_before_coupon_iqd);
        $this->assertEquals(2550, $dbOrder->coupon_discount_iqd);
        $this->assertEquals(-750, $dbOrder->net_profit_iqd); // 12750 - 9950 - 2550 + 0 - 1000 = -750

        // Check Financial Ledger
        $entries = FinancialLedgerEntry::where('order_id', $order['id'])->get();
        $this->assertGreaterThanOrEqual(4, $entries->count());

        $revEntry = $entries->firstWhere('entry_type', 'ORDER_REVENUE');
        $this->assertNotNull($revEntry);
        $this->assertEquals(12750, $revEntry->amount_iqd);
        $this->assertEquals('CREDIT', $revEntry->direction);

        $cogsEntry = $entries->firstWhere('entry_type', 'ORDER_COGS');
        $this->assertNotNull($cogsEntry);
        $this->assertEquals(9950, $cogsEntry->amount_iqd);
        $this->assertEquals('DEBIT', $cogsEntry->direction);
    }

    public function test_admin_finance_summary_and_reports(): void
    {
        $summary = $this->getJson('/api/v1/admin/finance/summary');
        $summary->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'grossMerchandiseValueIqd',
                    'netBasketRevenueIqd',
                    'totalCogsIqd',
                    'grossProfitIqd',
                    'netOperatingProfitIqd',
                    'netMarginPercent',
                ],
            ]);

        $daily = $this->getJson('/api/v1/admin/finance/daily-report');
        $daily->assertStatus(200);
        $this->assertNotEmpty($daily->json('data'));

        $catProf = $this->getJson('/api/v1/admin/finance/category-profitability');
        $catProf->assertStatus(200);
        $this->assertCount(20, $catProf->json('data'));

        $skuMargins = $this->getJson('/api/v1/admin/finance/sku-margins');
        $skuMargins->assertStatus(200);
        $this->assertCount(400, $skuMargins->json('data'));
    }

    public function test_inventory_wastage_write_off(): void
    {
        $stockBefore = WarehouseStock::where('warehouse_id', 'erbil-central-darkstore')
            ->where('product_id', 'p-cucumber')
            ->first()->stock_quantity;

        $res = $this->postJson('/api/v1/admin/finance/wastage', [
            'productId' => 'p-cucumber',
            'warehouseId' => 'erbil-central-darkstore',
            'quantity' => 2,
            'reason' => 'Spoiled produce in transit',
        ]);

        $res->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'productId' => 'p-cucumber',
                    'quantityWrittenOff' => 2,
                    'totalLossAmountIqd' => 2100, // 2 x 1050
                ],
            ]);

        $stockAfter = WarehouseStock::where('warehouse_id', 'erbil-central-darkstore')
            ->where('product_id', 'p-cucumber')
            ->first()->stock_quantity;

        $this->assertEquals($stockBefore - 2, $stockAfter);
    }
}
