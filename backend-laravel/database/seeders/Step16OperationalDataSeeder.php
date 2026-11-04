<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class Step16OperationalDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Seed users table (Admin and Ops Staff)
        $users = [
            [
                'name' => 'Super Administrator',
                'email' => 'admin@bazmart.iq',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Karwan Sleman (Ops Lead)',
                'email' => 'karwan@bazmart.iq',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Zana Omer (Dispatcher)',
                'email' => 'zana@bazmart.iq',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        foreach ($users as $u) {
            DB::table('users')->updateOrInsert(['email' => $u['email']], $u);
        }

        // 2. Ensure test customers exist first
        $testCustomers = [
            [
                'phone' => '+9647501234567',
                'name' => 'Ahmad Erbil (VIP)',
                'preferred_language' => 'ckb',
                'email' => 'ahmad@erbil.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 15000,
                'referral_code' => 'AHMAD77',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
                'updated_at' => $now,
            ],
            [
                'phone' => '+9647701234567',
                'name' => 'Ako Muhamad',
                'preferred_language' => 'ckb',
                'email' => 'soran@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 5000,
                'referral_code' => 'SORAN55',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
                'updated_at' => $now,
            ],
            [
                'phone' => '+9647509876543',
                'name' => 'Layla Suly',
                'preferred_language' => 'ckb',
                'email' => 'layla@suly.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 2500,
                'referral_code' => 'LAYLA33',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
                'updated_at' => $now,
            ],
        ];
        foreach ($testCustomers as $tc) {
            $exists = DB::table('customers')->where('phone', $tc['phone'])->first();
            if ($exists) {
                DB::table('customers')->where('phone', $tc['phone'])->update($tc);
            } else {
                $tc['id'] = 'c-' . substr(md5($tc['phone']), 0, 10);
                $tc['created_at'] = $now;
                DB::table('customers')->insert($tc);
            }
        }
        $c1Id = DB::table('customers')->where('phone', '+9647501234567')->value('id');
        $c2Id = DB::table('customers')->where('phone', '+9647701234567')->value('id');
        $c3Id = DB::table('customers')->where('phone', '+9647509876543')->value('id');

        // 3. Seed supermarket_settlements (5 Vouchers)
        $settlements = [
            [
                'settlement_number' => 'POS-SET-10001',
                'warehouse_id' => 'erbil-central-darkstore',
                'period_date' => $now->copy()->subDays(4)->toDateString(),
                'orders_count' => 6,
                'total_shelf_sales_iqd' => 100000,
                'bazmart_commission_3pct_iqd' => 3000,
                'supermarket_net_payable_97pct_iqd' => 97000,
                'status' => 'SETTLED',
                'settled_at' => $now->copy()->subDays(4)->setTime(23, 59),
                'created_at' => $now->copy()->subDays(4),
                'updated_at' => $now->copy()->subDays(4),
            ],
            [
                'settlement_number' => 'POS-SET-10002',
                'warehouse_id' => 'erbil-central-darkstore',
                'period_date' => $now->copy()->subDays(3)->toDateString(),
                'orders_count' => 18,
                'total_shelf_sales_iqd' => 342500,
                'bazmart_commission_3pct_iqd' => 10275,
                'supermarket_net_payable_97pct_iqd' => 332225,
                'status' => 'SETTLED',
                'settled_at' => $now->copy()->subDays(3)->setTime(23, 59),
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
            [
                'settlement_number' => 'POS-SET-10003',
                'warehouse_id' => 'suly-main-darkstore',
                'period_date' => $now->copy()->subDays(2)->toDateString(),
                'orders_count' => 14,
                'total_shelf_sales_iqd' => 265000,
                'bazmart_commission_3pct_iqd' => 7950,
                'supermarket_net_payable_97pct_iqd' => 257050,
                'status' => 'SETTLED',
                'settled_at' => $now->copy()->subDays(2)->setTime(23, 59),
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],
            [
                'settlement_number' => 'POS-SET-10004',
                'warehouse_id' => 'erbil-central-darkstore',
                'period_date' => $now->copy()->subDay()->toDateString(),
                'orders_count' => 22,
                'total_shelf_sales_iqd' => 480000,
                'bazmart_commission_3pct_iqd' => 14400,
                'supermarket_net_payable_97pct_iqd' => 465600,
                'status' => 'SETTLED',
                'settled_at' => $now->copy()->subDay()->setTime(23, 59),
                'created_at' => $now->copy()->subDay(),
                'updated_at' => $now->copy()->subDay(),
            ],
            [
                'settlement_number' => 'POS-SET-10005',
                'warehouse_id' => 'erbil-central-darkstore',
                'period_date' => $now->toDateString(),
                'orders_count' => 12,
                'total_shelf_sales_iqd' => 218750,
                'bazmart_commission_3pct_iqd' => 6563,
                'supermarket_net_payable_97pct_iqd' => 212187,
                'status' => 'PENDING',
                'settled_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        foreach ($settlements as $s) {
            DB::table('supermarket_settlements')->updateOrInsert(['settlement_number' => $s['settlement_number']], $s);
        }

        // 4. Seed order_ratings (10 reviews) referencing valid orders
        $orderList = DB::table('orders')->pluck('id')->toArray();
        $ratings = [
            [
                'order_id' => $orderList[0] ?? 'order-101',
                'customer_id' => $c1Id,
                'customer_phone' => '+9647501234567',
                'driver_id' => 'drv-karwan',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['FAST_DELIVERY', 'FRESH_ITEMS', 'POLITE_RIDER']),
                'comment' => 'گەیاندنی زۆر خێرا بوو و کەلوپەلەکان تازە بوون، دەستان خۆش بێت!',
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
            [
                'order_id' => $orderList[1] ?? 'order-102',
                'customer_id' => $c2Id,
                'customer_phone' => '+9647701234567',
                'driver_id' => 'drv-aram',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['GOOD_PACKAGING', 'FAST_DELIVERY']),
                'comment' => 'نان و شیرەکە زۆر تەڕ و تازە بوون، سوپاس بۆ کاک کاروان.',
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
            [
                'order_id' => $orderList[2] ?? 'order-103',
                'customer_id' => $c3Id,
                'customer_phone' => '+9647509876543',
                'driver_id' => 'drv-diyar',
                'overall_store_stars' => 4,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['SHELF_PRICE_MATCH']),
                'comment' => 'نرخەکان هاوتای مارکێتەکەن بەبێ هیچ زیادکردنێک، زۆر نایابە.',
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],
            [
                'order_id' => $orderList[3] ?? 'order-104',
                'customer_id' => $c1Id,
                'customer_phone' => '+9647501234567',
                'driver_id' => 'drv-karwan',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['FAST_DELIVERY']),
                'comment' => 'لە ماوەی ١٣ خولەک گەیشتە دریم ستی! زۆر سەرسوڕهێنەرە.',
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],
            [
                'order_id' => $orderList[4] ?? 'order-105',
                'customer_id' => $c1Id,
                'customer_phone' => '+9647501234567',
                'driver_id' => 'drv-aram',
                'overall_store_stars' => 5,
                'driver_stars' => 4,
                'feedback_tags' => json_encode(['FRESH_ITEMS']),
                'comment' => 'مریشکی کوردستان و هێلکەکان زۆر لە پێشینە بوون.',
                'created_at' => $now->copy()->subDay(),
                'updated_at' => $now->copy()->subDay(),
            ],
            [
                'order_id' => $orderList[5] ?? 'order-106',
                'customer_id' => $c2Id,
                'customer_phone' => '+9647701234567',
                'driver_id' => 'drv-diyar',
                'overall_store_stars' => 4,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['POLITE_RIDER']),
                'comment' => 'گەیەنەرەکە زۆر بەڕێز بوو و پەیوەندی پێوە کردم پێش گەیشتن.',
                'created_at' => $now->copy()->subDay(),
                'updated_at' => $now->copy()->subDay(),
            ],
            [
                'order_id' => $orderList[6] ?? 'order-107',
                'customer_id' => $c3Id,
                'customer_phone' => '+9647509876543',
                'driver_id' => 'drv-hiwa',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['FAST_DELIVERY', 'CORRECT_ITEMS']),
                'comment' => 'هەموو شتێک بێ کەم و کوڕی گەیشت، بەردەوام بن.',
                'created_at' => $now->copy()->subHours(18),
                'updated_at' => $now->copy()->subHours(18),
            ],
            [
                'order_id' => $orderList[7] ?? 'order-108',
                'customer_id' => $c3Id,
                'customer_phone' => '+9647509876543',
                'driver_id' => 'drv-mohammed',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['SHELF_PRICE_MATCH', 'FRESH_ITEMS']),
                'comment' => 'ئەپڵیکەیشنێکی زۆر پێویست بۆ هەولێر و کوردستان.',
                'created_at' => $now->copy()->subHours(12),
                'updated_at' => $now->copy()->subHours(12),
            ],
            [
                'order_id' => $orderList[8] ?? 'order-109',
                'customer_id' => $c1Id,
                'customer_phone' => '+9647501234567',
                'driver_id' => 'drv-karwan',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['FAST_DELIVERY']),
                'comment' => 'Perfect on-time delivery to Empire World. Highly recommended!',
                'created_at' => $now->copy()->subHours(6),
                'updated_at' => $now->copy()->subHours(6),
            ],
            [
                'order_id' => $orderList[9] ?? 'order-110',
                'customer_id' => $c2Id,
                'customer_phone' => '+9647701234567',
                'driver_id' => 'drv-aram',
                'overall_store_stars' => 5,
                'driver_stars' => 5,
                'feedback_tags' => json_encode(['POLITE_RIDER', 'FRESH_ITEMS']),
                'comment' => 'Excellent service and 100% shelf price parity as promised.',
                'created_at' => $now->copy()->subHours(2),
                'updated_at' => $now->copy()->subHours(2),
            ],
        ];
        foreach ($ratings as $r) {
            DB::table('order_ratings')->updateOrInsert(['order_id' => $r['order_id']], $r);
        }

        // 5. Seed admin_audit_logs (15 entries)
        $auditLogs = [
            ['actor_name' => 'System Auto-Sync', 'actor_role' => 'SYSTEM', 'action_type' => 'ERP_SYNC', 'target_reference' => 'POS-BRIDGE-01', 'details' => 'Full ERP Catalog sync completed: 400 SKUs matched, 0 IQD variance.', 'created_at' => $now->copy()->subMinutes(15)],
            ['actor_name' => 'Karwan Sleman', 'actor_role' => 'OPS_MANAGER', 'action_type' => 'ITEM_SUBSTITUTION', 'target_reference' => 'order-101', 'details' => 'Approved substitution: Fresh Milk 1L -> Al Rahma 1L (shelf price matched 2,250 IQD).', 'created_at' => $now->copy()->subMinutes(45)],
            ['actor_name' => 'Zana Omer', 'actor_role' => 'DISPATCHER', 'action_type' => 'DRIVER_ASSIGNMENT', 'target_reference' => 'order-102', 'details' => 'Assigned order to rider Karwan Sleman (Route: Dream City).', 'created_at' => $now->copy()->subHours(1)],
            ['actor_name' => 'Super Administrator', 'actor_role' => 'SUPER_ADMIN', 'action_type' => 'VOUCHER_SETTLEMENT', 'target_reference' => 'POS-SET-10001', 'details' => 'Settled voucher POS-SET-10001 (Gross: 100,000 IQD, Commission: 3,000 IQD, Net: 97,000 IQD).', 'created_at' => $now->copy()->subHours(2)],
            ['actor_name' => 'System Security', 'actor_role' => 'SECURITY', 'action_type' => 'AUTH_LOGIN', 'target_reference' => 'admin@bazmart.iq', 'details' => 'Admin dashboard signed in successfully from IP 127.0.0.1.', 'created_at' => $now->copy()->subHours(3)],
            ['actor_name' => 'Karwan Sleman', 'actor_role' => 'OPS_MANAGER', 'action_type' => 'FEFO_INSPECTION', 'target_reference' => 'WH-ERBIL-01', 'details' => 'FEFO radar verified: Batch IB-004 prioritized for dispatch (expiry: 3 days).', 'created_at' => $now->copy()->subHours(5)],
            ['actor_name' => 'System Auto-Sync', 'actor_role' => 'SYSTEM', 'action_type' => 'STOCK_RESERVE', 'target_reference' => 'order-103', 'details' => 'Reserved 6 SKUs in Erbil Central Dark Store.', 'created_at' => $now->copy()->subHours(7)],
            ['actor_name' => 'Zana Omer', 'actor_role' => 'DISPATCHER', 'action_type' => 'RIDER_CASH_SETTLEMENT', 'target_reference' => 'drv-karwan', 'details' => 'Driver Karwan Sleman settled IQD 45,000 COD cash bag.', 'created_at' => $now->copy()->subHours(9)],
            ['actor_name' => 'Super Administrator', 'actor_role' => 'SUPER_ADMIN', 'action_type' => 'PROMO_CREATED', 'target_reference' => 'BAZ20', 'details' => 'Created promo coupon BAZ20 (20% discount on orders above 10,000 IQD).', 'created_at' => $now->copy()->subHours(12)],
            ['actor_name' => 'Karwan Sleman', 'actor_role' => 'OPS_MANAGER', 'action_type' => 'STOCK_RESTOCK', 'target_reference' => 'p-alrahma', 'details' => 'Restocked 150 units of Al Rahma Fresh Milk 1L.', 'created_at' => $now->copy()->subHours(16)],
            ['actor_name' => 'System Auto-Sync', 'actor_role' => 'SYSTEM', 'action_type' => 'PRICE_AUDIT', 'target_reference' => 'CATALOG-400', 'details' => '100% Shelf-Price Parity verified: Zero markup across all 400 active SKUs.', 'created_at' => $now->copy()->subHours(20)],
            ['actor_name' => 'Zana Omer', 'actor_role' => 'DISPATCHER', 'action_type' => 'ORDER_STATUS_UPDATE', 'target_reference' => 'order-104', 'details' => 'Marked order as DELIVERED in 14 minutes.', 'created_at' => $now->copy()->subHours(24)],
            ['actor_name' => 'Super Administrator', 'actor_role' => 'SUPER_ADMIN', 'action_type' => 'COMMISSION_RULE_CHECK', 'target_reference' => 'FINANCE_ENGINE', 'details' => 'Verified fixed 3.00% commission calculation across all partner supermarket settlements.', 'created_at' => $now->copy()->subDays(2)],
            ['actor_name' => 'Karwan Sleman', 'actor_role' => 'OPS_MANAGER', 'action_type' => 'QUALITY_CHECK', 'target_reference' => 'PRODUCE_SECTION', 'details' => 'Visual inspection passed: Fresh farm cucumbers and tomatoes approved.', 'created_at' => $now->copy()->subDays(2)],
            ['actor_name' => 'System Security', 'actor_role' => 'SECURITY', 'action_type' => 'Z_REPORT_GENERATED', 'target_reference' => 'Z-REP-20261102', 'details' => 'Daily Cashier Z-Report generated: Total POS receipts matched financial ledger.', 'created_at' => $now->copy()->subDays(3)],
        ];
        foreach ($auditLogs as $log) {
            DB::table('admin_audit_logs')->insert($log);
        }

        // 6. Seed coupon_redemptions (8 records)
        $couponIds = DB::table('coupons')->pluck('id')->toArray();
        $c1 = $couponIds[0] ?? 'cp-1';
        $c2 = $couponIds[1] ?? 'cp-2';
        $c3 = $couponIds[2] ?? 'cp-3';

        $couponRedemptions = [
            ['coupon_id' => $c1, 'order_id' => $orderList[0] ?? 'order-101', 'customer_phone' => '+9647501234567', 'discount_applied_iqd' => 3000, 'redeemed_at' => $now->copy()->subDays(3)],
            ['coupon_id' => $c2, 'order_id' => $orderList[1] ?? 'order-102', 'customer_phone' => '+9647701234567', 'discount_applied_iqd' => 5000, 'redeemed_at' => $now->copy()->subDays(3)],
            ['coupon_id' => $c1, 'order_id' => $orderList[2] ?? 'order-103', 'customer_phone' => '+9647509876543', 'discount_applied_iqd' => 2500, 'redeemed_at' => $now->copy()->subDays(2)],
            ['coupon_id' => $c3, 'order_id' => $orderList[3] ?? 'order-104', 'customer_phone' => '+9647501234567', 'discount_applied_iqd' => 3000, 'redeemed_at' => $now->copy()->subDays(2)],
            ['coupon_id' => $c1, 'order_id' => $orderList[4] ?? 'order-105', 'customer_phone' => '+9647504443322', 'discount_applied_iqd' => 3500, 'redeemed_at' => $now->copy()->subDay()],
            ['coupon_id' => $c2, 'order_id' => $orderList[5] ?? 'order-106', 'customer_phone' => '+9647701234567', 'discount_applied_iqd' => 2000, 'redeemed_at' => $now->copy()->subHours(18)],
            ['coupon_id' => $c1, 'order_id' => $orderList[6] ?? 'order-107', 'customer_phone' => '+9647507778899', 'discount_applied_iqd' => 4000, 'redeemed_at' => $now->copy()->subHours(12)],
            ['coupon_id' => $c2, 'order_id' => $orderList[7] ?? 'order-108', 'customer_phone' => '+9647501234567', 'discount_applied_iqd' => 5000, 'redeemed_at' => $now->copy()->subHours(4)],
        ];
        foreach ($couponRedemptions as $cr) {
            DB::table('coupon_redemptions')->insert($cr);
        }

        // 7. Seed stock_alert_subscriptions (4 records)
        $products = DB::table('products')->pluck('id')->toArray();
        $stockAlerts = [
            ['customer_id' => $c1Id, 'customer_phone' => '+9647501234567', 'product_id' => $products[0] ?? 'p-7up-can', 'warehouse_id' => 'erbil-central-darkstore', 'status' => 'WAITING', 'created_at' => $now->copy()->subHours(10), 'updated_at' => $now->copy()->subHours(10)],
            ['customer_id' => $c2Id, 'customer_phone' => '+9647701234567', 'product_id' => $products[1] ?? 'p-almarai', 'warehouse_id' => 'erbil-central-darkstore', 'status' => 'NOTIFIED', 'created_at' => $now->copy()->subDays(1), 'updated_at' => $now->copy()->subHours(2)],
            ['customer_id' => $c3Id, 'customer_phone' => '+9647509876543', 'product_id' => $products[2] ?? 'p-afia-corn-oil', 'warehouse_id' => 'suly-main-darkstore', 'status' => 'WAITING', 'created_at' => $now->copy()->subHours(6), 'updated_at' => $now->copy()->subHours(6)],
            ['customer_id' => $c1Id, 'customer_phone' => '+9647501234567', 'product_id' => $products[3] ?? 'p-ahmad-tea-ceylon', 'warehouse_id' => 'erbil-central-darkstore', 'status' => 'NOTIFIED', 'created_at' => $now->copy()->subDays(2), 'updated_at' => $now->copy()->subHours(5)],
        ];
        foreach ($stockAlerts as $sa) {
            DB::table('stock_alert_subscriptions')->insert($sa);
        }

        // 8. Seed erp_sync_logs (10 records)
        for ($i = 9; $i >= 0; $i--) {
            DB::table('erp_sync_logs')->insert([
                'source' => 'POS_POSTGRES_CONNECTOR',
                'synced_skus_count' => 400,
                'status' => 'SUCCESS',
                'details' => json_encode([
                    'variance_iqd' => 0,
                    'latency_ms' => 120 + ($i * 7),
                    'partner_store' => 'Erbil Hypermarket POS #01',
                    'parity_audit' => '100% Shelf-Price Parity Guaranteed',
                ]),
                'created_at' => $now->copy()->subMinutes($i * 30),
                'updated_at' => $now->copy()->subMinutes($i * 30),
            ]);
        }
    }
}
