<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SupermarketSettlement;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Step18PickerAndPartnerPortalTest extends TestCase
{
    /**
     * Test in-store picker item scanning and shelf price parity verification
     */
    public function test_in_store_picker_item_scan_and_shelf_parity(): void
    {
        $order = Order::with('items.product')->where('order_status', 'PLACED')->first();
        if (!$order) {
            $order = Order::with('items.product')->first();
        }
        $this->assertNotNull($order, 'An active test order must exist');

        $item = $order->items->first();
        $this->assertNotNull($item, 'Order must contain at least one item');

        $response = $this->patchJson("/api/v1/admin/orders/{$order->id}/pick-item", [
            'itemId' => (string)$item->id,
            'barcode' => $item->product ? $item->product->barcode : null,
            'isPicked' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'orderId' => (string)$order->id,
                'itemId' => (string)$item->id,
                'isPicked' => true,
                'shelfParityVerified' => true,
            ],
        ]);

        $this->assertGreaterThan(0, $response->json('data.shelfPriceIqd'));
    }

    /**
     * Test complete order picking and thermal bag label generation
     */
    public function test_complete_order_picking_and_bag_label_generation(): void
    {
        $order = Order::with('items')->first();
        $this->assertNotNull($order);

        $response = $this->postJson("/api/v1/admin/orders/{$order->id}/complete-picking");

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('READY_FOR_PICKUP', $response->json('data.order.orderStatus') ?? $response->json('data.order.order_status'));
        $this->assertTrue((bool)($response->json('data.order.isPacked') ?? $response->json('data.order.is_packed')));
        $this->assertEquals($order->order_number, $response->json('data.bagLabel.orderNumber'));

        $this->assertNotEmpty($response->json('data.bagLabel.storeName'));
        $this->assertNotEmpty($response->json('data.bagLabel.parityVerified'));
    }

    /**
     * Test Partner Supermarket Executive Transparency Summary (Strict 97% / 3% Math)
     */
    public function test_partner_supermarket_summary_enforces_97_3_percent_math(): void
    {
        $response = $this->getJson('/api/v1/admin/partner-portal/summary?warehouseId=suly-main-darkstore');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'supermarketSharePercent' => 97.00,
                'bazmartCommissionPercent' => 3.00,
                'priceVarianceIqd' => 0,
                'priceParityRate' => 100.0,
            ],
        ]);

        $totalSales = $response->json('data.totalShelfSalesIqd');
        $bazmartCommission = $response->json('data.bazmartCommissionIqd');
        $supermarketPayable = $response->json('data.supermarketPayableIqd');

        $this->assertGreaterThan(0, $totalSales);
        $expectedCommission = (int)round($totalSales * 0.03);
        $expectedSupermarket = $totalSales - $expectedCommission;

        $this->assertEquals($expectedCommission, $bazmartCommission, 'BazMart 3% Commission must exactly equal round(totalSales * 0.03)');
        $this->assertEquals($expectedSupermarket, $supermarketPayable, 'Supermarket 97% Net must exactly equal totalSales - 3% Commission');
        $this->assertEquals($totalSales, $bazmartCommission + $supermarketPayable, 'Total Shelf Sales must equal BazMart Commission + Supermarket Payable');
    }

    /**
     * Test Partner Supermarket Order-by-Order 97% / 3% Breakdown
     */
    public function test_partner_portal_orders_breakdown(): void
    {
        $response = $this->getJson('/api/v1/admin/partner-portal/orders?warehouseId=suly-main-darkstore');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $orders = $response->json('data');
        $this->assertNotEmpty($orders, 'Partner portal must return order breakdown list');

        foreach ($orders as $o) {
            $this->assertArrayHasKey('orderNumber', $o);
            $this->assertArrayHasKey('grossShelfSalesIqd', $o);
            $this->assertArrayHasKey('bazmartCommissionIqd', $o);
            $this->assertArrayHasKey('supermarketNetIqd', $o);
            $this->assertTrue($o['shelfParityVerified']);

            $gross = $o['grossShelfSalesIqd'];
            $comm = $o['bazmartCommissionIqd'];
            $net = $o['supermarketNetIqd'];

            $this->assertEquals($gross, $comm + $net, 'Per-order gross must equal 3% commission + 97% net');
        }
    }

    /**
     * Test Partner Supermarket Settlement Voucher Generation
     */
    public function test_partner_portal_settlement_voucher_generation(): void
    {
        $response = $this->postJson('/api/v1/admin/partner-portal/generate-settlement', [
            'warehouseId' => 'suly-main-darkstore',
            'amountIqd' => 100000,
            'ordersCount' => 6,
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $data = $response->json('data');
        $shelfSales = $data['totalShelfSalesIqd'] ?? $data['total_shelf_sales_iqd'];
        $commission = $data['bazmartCommission3pctIqd'] ?? $data['bazmart_commission_3pct_iqd'];
        $payable = $data['supermarketNetPayable97pctIqd'] ?? $data['supermarket_net_payable_97pct_iqd'];

        $this->assertEquals(100000, $shelfSales);
        $this->assertEquals(3000, $commission);
        $this->assertEquals(97000, $payable);
        $this->assertEquals('SETTLED_WITH_SUPERMARKET', $data['status']);

        $settlement = SupermarketSettlement::where('total_shelf_sales_iqd', 100000)
            ->where('bazmart_commission_3pct_iqd', 3000)
            ->where('supermarket_net_payable_97pct_iqd', 97000)
            ->first();

        $this->assertNotNull($settlement, 'Settlement voucher must be persisted in database');
    }
}
