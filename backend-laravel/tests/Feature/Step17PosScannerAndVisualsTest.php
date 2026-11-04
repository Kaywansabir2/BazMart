<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class Step17PosScannerAndVisualsTest extends TestCase
{
    /**
     * Test 1: Verify Barcode API returns 100% shelf price parity for benchmark products.
     */
    public function test_barcode_endpoint_returns_exact_shelf_price_parity(): void
    {
        $response = $this->getJson('/api/v1/catalog/barcode/6291100010014');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'barcode' => '6291100010014',
            'parityCertified' => true,
            'varianceIqd' => 0,
            'shelfPriceParityPercent' => 100,
        ]);

        $data = $response->json();
        $this->assertEquals($data['posShelfPriceIqd'], $data['activePriceIqd']);
        $this->assertEquals(0, $data['varianceIqd']);
        $this->assertStringContainsString('Sulaymaniyah', $data['partnerSupermarket']);
    }

    /**
     * Test 2: Verify ERP Stock & Price webhook maintains 100% shelf price parity.
     */
    public function test_erp_webhook_updates_pos_shelf_price_without_markup(): void
    {
        $payload = [
            'externalErpId' => 'ERP-SKU-1001',
            'stockUpdates' => [
                ['warehouseId' => 'suly-main-darkstore', 'stockQuantity' => 180],
            ],
            'newOriginalPriceIqd' => 2400,
        ];

        $response = $this->postJson('/api/v1/erp/webhook/stock-update', $payload);
        $response->assertStatus(200);

        // Verify product in database reflects updated price with zero markup
        $product = DB::table('products')->where('external_erp_id', 'ERP-SKU-1001')->first();
        $this->assertNotNull($product);
        $this->assertEquals(2400, $product->original_price_iqd);
        $this->assertEquals(2400, $product->pos_shelf_price_iqd);
        $this->assertEquals(1, $product->pos_parity_verified);
    }

    /**
     * Test 3: Verify Sulaymaniyah #POS-SET-10001 has 100,000 IQD benchmark and exact 3% / 97% math.
     */
    public function test_sulaymaniyah_settlement_voucher_math(): void
    {
        $voucher = DB::table('supermarket_settlements')
            ->where('settlement_number', 'POS-SET-10001')
            ->first();

        $this->assertNotNull($voucher);
        $this->assertEquals('suly-main-darkstore', $voucher->warehouse_id);
        $this->assertEquals(100000, $voucher->total_shelf_sales_iqd);
        $this->assertEquals(3000, $voucher->bazmart_commission_3pct_iqd);
        $this->assertEquals(97000, $voucher->supermarket_net_payable_97pct_iqd);
        $this->assertEquals('SETTLED', $voucher->status);

        // Mathematical proof: 3% + 97% == 100%
        $this->assertEquals(
            $voucher->total_shelf_sales_iqd,
            $voucher->bazmart_commission_3pct_iqd + $voucher->supermarket_net_payable_97pct_iqd
        );
    }

    /**
     * Test 4: Verify all 14 customers restored with Sulaymaniyah & Erbil VIP accounts.
     */
    public function test_all_14_customers_restored_and_active(): void
    {
        $count = DB::table('customers')->count();
        $this->assertGreaterThanOrEqual(14, $count);

        $ako = DB::table('customers')->where('phone', '+9647701234567')->first();
        $this->assertNotNull($ako);
        $this->assertEquals('ckb', $ako->preferred_language);
        $this->assertGreaterThanOrEqual(5000, $ako->wallet_balance_iqd);
        $this->assertEquals('ACTIVE', $ako->status);

        $ahmad = DB::table('customers')->where('phone', '+9647501234567')->first();
        $this->assertNotNull($ahmad);
        $this->assertEquals('ckb', $ahmad->preferred_language);
        $this->assertEquals(15000, $ahmad->wallet_balance_iqd);
        $this->assertEquals('ACTIVE', $ahmad->status);
    }

    /**
     * Test 5: Verify 100% of 400 catalog products have shelf price parity verified.
     */
    public function test_all_catalog_skus_have_parity_verified(): void
    {
        $totalProducts = DB::table('products')->count();
        $this->assertEquals(400, $totalProducts);

        $unverifiedCount = DB::table('products')
            ->where('pos_parity_verified', '!=', 1)
            ->orWhereNull('pos_parity_verified')
            ->count();

        $this->assertEquals(0, $unverifiedCount, 'All 400 catalog SKUs must have pos_parity_verified = 1');
    }
}
