<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class Step16UIOverhaulAndDataAuditTest extends TestCase
{
    /**
     * Test 1: Zero Operational Tables with 0 rows in active SQLite database.
     */
    public function test_zero_operational_tables_have_zero_rows(): void
    {
        $operationalTables = [
            'admin_audit_logs' => 15,
            'supermarket_settlements' => 5,
            'order_ratings' => 10,
            'coupon_redemptions' => 8,
            'stock_alert_subscriptions' => 4,
            'erp_sync_logs' => 10,
            'users' => 3,
            'customers' => 3,
            'products' => 400,
            'orders' => 20,
            'warehouses' => 2,
            'brands' => 15,
            'country_origins' => 4,
        ];

        foreach ($operationalTables as $table => $minExpectedRows) {
            $count = DB::table($table)->count();
            $this->assertGreaterThanOrEqual(
                $minExpectedRows,
                $count,
                "Operational table '{$table}' has {$count} rows, which is less than expected minimum {$minExpectedRows}."
            );
        }
    }

    /**
     * Test 2: Fixed 3% Commission & Zero Markup Supermarket Settlement Mathematical Invariant.
     */
    public function test_supermarket_settlement_voucher_math(): void
    {
        $voucher = DB::table('supermarket_settlements')
            ->where('settlement_number', 'POS-SET-10001')
            ->first();

        $this->assertNotNull($voucher, 'Voucher POS-SET-10001 must exist in supermarket_settlements.');
        $this->assertEquals(100000, $voucher->total_shelf_sales_iqd);
        $this->assertEquals(3000, $voucher->bazmart_commission_3pct_iqd);
        $this->assertEquals(97000, $voucher->supermarket_net_payable_97pct_iqd);
        $this->assertEquals('SETTLED', $voucher->status);

        // Verify all vouchers satisfy: commission + net_payable == shelf_sales
        $allVouchers = DB::table('supermarket_settlements')->get();
        foreach ($allVouchers as $v) {
            $this->assertEquals(
                $v->total_shelf_sales_iqd,
                $v->bazmart_commission_3pct_iqd + $v->supermarket_net_payable_97pct_iqd,
                "Settlement {$v->settlement_number} total does not equal commission + net payable."
            );
            $expectedCommission = (int) round($v->total_shelf_sales_iqd * 0.03);
            $this->assertEquals(
                $expectedCommission,
                $v->bazmart_commission_3pct_iqd,
                "Settlement {$v->settlement_number} commission does not match 3%."
            );
        }
    }

    /**
     * Test 3: Locked Country Origins (KRD, EU, USA, KOR) with >= 25 products each.
     */
    public function test_country_origins_locked_to_four_with_sufficient_catalog(): void
    {
        $countries = DB::table('country_origins')->orderBy('sort_order')->get();
        $this->assertCount(4, $countries);

        $codes = $countries->pluck('code')->toArray();
        $this->assertEquals(['KRD', 'EU', 'USA', 'KOR'], $codes);

        $krd = $countries->firstWhere('code', 'KRD');
        $this->assertEquals('هەرێمی کوردستان', $krd->name_ckb);
        $this->assertEquals('إقليم كوردستان', $krd->name_ar);

        $usa = $countries->firstWhere('code', 'USA');
        $this->assertEquals('ویلایەتە یەکگرتووەکان', $usa->name_ckb);

        // Verify each country has at least 25 assigned products
        foreach ($countries as $c) {
            $prodCount = DB::table('products')->where('country_origin_id', $c->id)->count();
            $this->assertGreaterThanOrEqual(
                25,
                $prodCount,
                "Country {$c->code} has {$prodCount} products, expected at least 25."
            );
        }
    }

    /**
     * Test 4: Featured Brands locked to 1..8 in exact order.
     */
    public function test_featured_brands_grid_locked(): void
    {
        $expectedBrands = [
            1 => 'Maggi',
            2 => 'Parex',
            3 => 'Kinder',
            4 => 'Nescafe Dolce Gusto',
            5 => 'John West',
            6 => 'Vaseline',
            7 => 'Sanita',
            8 => 'Coca-Cola',
        ];

        $featuredBrands = DB::table('brands')
            ->where('is_featured_grid', 1)
            ->orderBy('sort_order')
            ->take(8)
            ->get();

        $this->assertCount(8, $featuredBrands);

        foreach ($featuredBrands as $b) {
            $this->assertEquals(
                $expectedBrands[$b->sort_order],
                $b->name,
                "Brand at sort_order {$b->sort_order} should be '{$expectedBrands[$b->sort_order]}', found '{$b->name}'."
            );
        }
    }

    /**
     * Test 5: VIP Test Customer Account (+9647501234567) state.
     */
    public function test_vip_test_customer_account(): void
    {
        $customer = DB::table('customers')->where('phone', '+9647501234567')->first();
        $this->assertNotNull($customer);
        $this->assertEquals('ACTIVE', $customer->status);
        $this->assertEquals(1, $customer->is_onboarded);
        $this->assertEquals(15000, $customer->wallet_balance_iqd);
    }
}

