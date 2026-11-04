<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Brand;
use App\Models\CountryOrigin;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Product;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use App\Services\FinancialAccountingService;

class Step121RemediationTest extends TestCase
{
    /** Fix 1: 4 canonical countries with sort_order 1..4 and >= 25 products each */
    public function test_fix_1_countries_origin_alignment(): void
    {
        $countries = CountryOrigin::orderBy('sort_order', 'asc')->get();
        $this->assertCount(4, $countries);

        $expected = [
            ['code' => 'KRD', 'sort_order' => 1, 'name_en' => 'Kurdistan Region', 'name_ckb' => 'هەرێمی کوردستان'],
            ['code' => 'EU', 'sort_order' => 2, 'name_en' => 'European Union', 'name_ckb' => 'یەکێتی ئەورووپا'],
            ['code' => 'USA', 'sort_order' => 3, 'name_en' => 'United States', 'name_ckb' => 'ویلایەتە یەکگرتووەکان'],
            ['code' => 'KOR', 'sort_order' => 4, 'name_en' => 'South Korea', 'name_ckb' => 'کۆریای باشوور'],
        ];

        foreach ($expected as $idx => $exp) {
            $c = $countries[$idx];
            $this->assertEquals($exp['code'], $c->code);
            $this->assertEquals($exp['sort_order'], $c->sort_order);
            $this->assertEquals($exp['name_en'], $c->name_en);
            $this->assertEquals($exp['name_ckb'], $c->name_ckb);
            $this->assertNotEmpty($c->flag_asset);

            $prodCount = Product::where('country_origin_id', $c->id)->count();
            $this->assertGreaterThanOrEqual(25, $prodCount, "Country {$c->code} has {$prodCount} products (<25)");
        }
    }

    /** Fix 2: 8 primary grid brands with sort_order 1..8, other brands > 8 */
    public function test_fix_2_shop_by_brand_grid_alignment(): void
    {
        $gridBrands = Brand::where('is_featured_grid', true)->orderBy('sort_order', 'asc')->get();
        $this->assertCount(8, $gridBrands);

        $expectedNames = [
            1 => 'Maggi',
            2 => 'Parex',
            3 => 'Kinder',
            4 => 'Nescafe Dolce Gusto',
            5 => 'John West',
            6 => 'Vaseline',
            7 => 'Sanita',
            8 => 'Coca-Cola',
        ];

        foreach ($gridBrands as $b) {
            $this->assertEquals($expectedNames[$b->sort_order], $b->name);
        }

        $otherBrands = Brand::where('is_featured_grid', false)->get();
        foreach ($otherBrands as $b) {
            $this->assertGreaterThan(8, $b->sort_order);
        }
    }

    /** Fix 3: 7 canonical coupons & CouponRedemption persistence on order checkout */
    public function test_fix_3_coupons_and_redemption_persistence(): void
    {
        $expectedCodes = ['BAZ20', 'SLEMANI2500', 'FIRST5000', 'FREEDEL', 'EXPIRED10', 'ERBIL1000', 'FRESHONLY15'];
        foreach ($expectedCodes as $code) {
            $coupon = Coupon::where('code', $code)->first();
            $this->assertNotNull($coupon, "Coupon {$code} is missing");
        }

        $targetCoupon = Coupon::where('code', 'SLEMANI2500')->first();
        $initialUsage = $targetCoupon->current_usage_count;

        $fulfillment = app(OrderFulfillmentService::class);
        $orderRes = $fulfillment->createOrder([
            'customerPhone' => '+9647701234567',
            'customerName' => 'Ako Muhamad',
            'warehouseId' => 'erbil-central-darkstore',
            'couponCode' => 'SLEMANI2500',
            'paymentMethod' => 'COD',
            'address' => [
                'title' => 'Home',
                'city' => 'Sulaymaniyah',
                'neighborhood' => 'Bakhtiari',
                'street' => 'Street 24',
                'building' => 'House 12',
                'latitude' => 35.5669,
                'longitude' => 45.4144,
            ],
            'items' => [
                ['productId' => 'p-cucumber', 'quantity' => 4, 'expectedPriceIqd' => 1445],
                ['productId' => 'p-schauma', 'quantity' => 1, 'expectedPriceIqd' => 7013],
            ],
        ]);

        $createdOrder = $orderRes['order'];
        $this->assertEquals('SLEMANI2500', $createdOrder->coupon_code);
        $this->assertEquals(2500, $createdOrder->coupon_discount_iqd);

        // Verify CouponRedemption record
        $redemption = CouponRedemption::where('order_id', $createdOrder->id)->first();
        $this->assertNotNull($redemption, 'CouponRedemption row was not created');
        $this->assertEquals($targetCoupon->id, $redemption->coupon_id);
        $this->assertEquals(2500, $redemption->discount_applied_iqd);

        // Verify usage increment
        $targetCoupon->refresh();
        $this->assertEquals($initialUsage + 1, $targetCoupon->current_usage_count);
    }

    /** Fix 4: All 20 canonical reference SKUs exist with titles, prices, and wholesale costs */
    public function test_fix_4_canonical_20_skus_and_wholesale_costs(): void
    {
        for ($i = 1001; $i <= 1020; $i++) {
            $sku = 'ERP-SKU-' . $i;
            $prod = Product::where('external_erp_id', $sku)->first();
            $this->assertNotNull($prod, "SKU {$sku} missing from products table");
            $this->assertNotEmpty($prod->title_en);
            $this->assertGreaterThan(0, $prod->original_price_iqd);
            $this->assertGreaterThan(0, $prod->cost_price_iqd);
            $this->assertLessThan($prod->original_price_iqd, $prod->cost_price_iqd, "Cost price must be less than original price for {$sku}");
        }

        // Specific checks for Tabasco Ramen flavours
        $tabasco12 = Product::where('external_erp_id', 'ERP-SKU-1012')->first();
        $tabasco13 = Product::where('external_erp_id', 'ERP-SKU-1013')->first();
        $tabasco14 = Product::where('external_erp_id', 'ERP-SKU-1014')->first();
        $this->assertStringContainsString('Chicken', $tabasco12->title_en);
        $this->assertStringContainsString('Beef', $tabasco13->title_en);
        $this->assertStringContainsString('Curry', $tabasco14->title_en);

        // Specific checks for Nescafe Iced Coffee flavours
        $nescafe15 = Product::where('external_erp_id', 'ERP-SKU-1015')->first();
        $nescafe16 = Product::where('external_erp_id', 'ERP-SKU-1016')->first();
        $nescafe17 = Product::where('external_erp_id', 'ERP-SKU-1017')->first();
        $this->assertStringContainsString('Latte', $nescafe15->title_en);
        $this->assertStringContainsString('Cappuccino', $nescafe16->title_en);
        $this->assertStringContainsString('Spanish', $nescafe17->title_en);
    }

    /** Fix 5: P&L Waterfall Mathematical Identity */
    public function test_fix_5_finance_pnl_waterfall_math_identity(): void
    {
        $finance = app(FinancialAccountingService::class);
        $summary = $finance->getFinancialSummary(null, '7days');

        $netBasket = $summary['netBasketRevenueIqd'];
        $cogs = $summary['totalCogsIqd'];
        $grossProfit = $summary['grossProfitIqd'];
        $deductions = $summary['totalDeductionsIqd'];
        $netOperatingProfit = $summary['netOperatingProfitIqd'];

        // Strict Mathematical Identity 1: Net Basket Revenue - COGS === Gross Profit
        $this->assertEquals($netBasket - $cogs, $grossProfit, "Identity 1 failed: Net Basket - COGS != Gross Profit");

        // Strict Mathematical Identity 2: Gross Profit - Deductions === Net Operating Profit
        $this->assertEquals($grossProfit - $deductions, $netOperatingProfit, "Identity 2 failed: Gross Profit - Deductions != Net Operating Profit");
    }

    /** Fix 6: Ako Muhamad has Home and Office saved addresses, and total addresses >= 8 */
    public function test_fix_6_demo_customer_addresses(): void
    {
        $cust = Customer::where('phone', '+9647701234567')->first();
        $this->assertNotNull($cust);
        $this->assertEquals('Ako Muhamad', $cust->name);

        $addresses = CustomerAddress::where('customer_id', $cust->id)->get();
        $this->assertGreaterThanOrEqual(2, $addresses->count());

        $home = $addresses->firstWhere('title', 'Home');
        $this->assertNotNull($home, 'Home address missing for Ako Muhamad');
        $this->assertEquals('Sulaymaniyah', $home->city);
        $this->assertEquals('Bakhtiari', $home->neighborhood);
        $this->assertTrue((bool)$home->is_default);

        $office = $addresses->firstWhere('title', 'Office');
        $this->assertNotNull($office, 'Office address missing for Ako Muhamad');
        $this->assertEquals('Erbil', $office->city);
        $this->assertEquals('Empire World', $office->neighborhood);

        $totalAddresses = CustomerAddress::count();
        $this->assertGreaterThanOrEqual(8, $totalAddresses, "Total addresses ({$totalAddresses}) < 8");
    }
}

