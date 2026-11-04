<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class Step17OperationalDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Ensure Sulaymaniyah & Erbil Dark Stores exist and are active
        $warehouses = [
            [
                'id' => 'suly-main-darkstore',
                'name' => 'Sulaymaniyah Partner Hypermarket (POS #01 - Salim St)',
                'city' => 'Sulaymaniyah',
                'latitude' => 35.5669,
                'longitude' => 45.4167,
                'delivery_radius_km' => 25,
                'min_order_iqd' => 7000,
                'delivery_fee_iqd' => 0,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'erbil-central-darkstore',
                'name' => 'Erbil Central Partner Supermarket',
                'city' => 'Erbil',
                'latitude' => 36.1901,
                'longitude' => 44.0091,
                'delivery_radius_km' => 20,
                'min_order_iqd' => 7000,
                'delivery_fee_iqd' => 0,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($warehouses as $w) {
            DB::table('warehouses')->updateOrInsert(['id' => $w['id']], $w);
        }

        // 2. Full 14 Customers Restoration with Sulaymaniyah Flagship Hub
        $all14Customers = [
            [
                'id' => 'c-suly-1002',
                'phone' => '+9647701234567',
                'name' => 'Ako Muhamad',
                'preferred_language' => 'ckb',
                'email' => 'ako@suly.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 15000,
                'referral_code' => 'AKO-SULY',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'c-erbil-1001',
                'phone' => '+9647501234567',
                'name' => 'Ahmad Erbil (VIP)',
                'preferred_language' => 'ckb',
                'email' => 'ahmad@erbil.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 15000,
                'referral_code' => 'AHMAD77',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'c-suly-1003',
                'phone' => '+9647509876543',
                'name' => 'Layla Suly',
                'preferred_language' => 'ckb',
                'email' => 'layla@suly.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 8500,
                'referral_code' => 'LAYLA33',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvw1n7o200011c61xiuffpbd',
                'phone' => '+964 750 999 1122',
                'name' => 'ڕێبوار ساڵح (Rebwar Salih)',
                'preferred_language' => 'ckb',
                'email' => 'rebwar@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 12000,
                'referral_code' => 'REBWAR99',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvw3ckhs0001d50zfld6utvs',
                'phone' => '+964 750 999 8877',
                'name' => 'سۆران عەلی (Soran Ali)',
                'preferred_language' => 'ckb',
                'email' => 'soran.ali@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 6000,
                'referral_code' => 'SORAN88',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvw43o00000md50zzpcb47et',
                'phone' => '+964 770 555 4433',
                'name' => 'دیار هەورامی (Diyar Hawrami)',
                'preferred_language' => 'ckb',
                'email' => 'diyar@hawrami.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 10000,
                'referral_code' => 'DIYAR55',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvw4g0ri001td50zxezbdu7r',
                'phone' => '+964 750 444 8899',
                'name' => 'سۆران بارزانی (Soran Barzani)',
                'preferred_language' => 'ckb',
                'email' => 'soran.b@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 7500,
                'referral_code' => 'BARZAN44',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwa9ot40004zuybeh6m1301',
                'phone' => '07504445566',
                'name' => 'کڕیار هەولێر (Buyer A)',
                'preferred_language' => 'ckb',
                'email' => 'buyer.a@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 4000,
                'referral_code' => 'BUYER01',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwac06j000vzuyb3ts4pa5y',
                'phone' => '07509998877',
                'name' => 'کاک زانا (QA Tester)',
                'preferred_language' => 'ckb',
                'email' => 'tester@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 5000,
                'referral_code' => 'IDEMP99',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwavsbh0014zuybvpmtbj07',
                'phone' => '+964 750 111 2233',
                'name' => 'کاروان محەمەد (Karwan M.)',
                'preferred_language' => 'ckb',
                'email' => 'karwan.m@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 3500,
                'referral_code' => 'RACE11',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwaz0ny002lzuybznpkurtk',
                'phone' => '+964 750 000 1122',
                'name' => 'پێشەوا عوسمان (Peshawa O.)',
                'preferred_language' => 'ckb',
                'email' => 'peshawa@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 4500,
                'referral_code' => 'TAMPER00',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwb14co003szuybt6gclltl',
                'phone' => '+964 750 555 4433',
                'name' => 'سەرکەوت قادر (Sarkawt Q.)',
                'preferred_language' => 'ckb',
                'email' => 'sarkawt@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 6500,
                'referral_code' => 'DOUBLE55',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwcr1wv000111lqj74xb3ph',
                'phone' => '+964 750 777 6655',
                'name' => 'ئارام قادر (Aram Qadir)',
                'preferred_language' => 'ckb',
                'email' => 'aram.q@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 9000,
                'referral_code' => 'ARAM77',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
            [
                'id' => 'cmvwll930000iv84nakbogemh',
                'phone' => '+9647508887766',
                'name' => 'دانا ئەحمەد (Dana Ahmad)',
                'preferred_language' => 'ckb',
                'email' => 'dana@bazmart.iq',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 11000,
                'referral_code' => 'DANA88',
                'status' => 'ACTIVE',
                'last_login_at' => $now,
            ],
        ];

        foreach ($all14Customers as $c) {
            $existing = DB::table('customers')->where('phone', $c['phone'])->first();
            if ($existing) {
                unset($c['id']); // Preserve existing primary key to prevent FK constraint violations
                $c['updated_at'] = $now;
                DB::table('customers')->where('phone', $c['phone'])->update($c);
            } else {
                $c['created_at'] = $now;
                $c['updated_at'] = $now;
                DB::table('customers')->insert($c);
            }
        }

        // Customer Addresses (Sulaymaniyah & Erbil)
        $sulyCustId = DB::table('customers')->where('phone', '+9647701234567')->value('id');
        if ($sulyCustId) {
            DB::table('customer_addresses')->updateOrInsert(
                ['customer_id' => $sulyCustId, 'is_default' => 1],
                [
                    'id' => 'addr-suly-1002',
                    'customer_id' => $sulyCustId,
                    'title' => 'Home',
                    'city' => 'Sulaymaniyah',
                    'neighborhood' => 'Bakhtiari',
                    'street' => 'Salim Main Street',
                    'building' => 'Building 14, Floor 3',
                    'latitude' => 35.5669,
                    'longitude' => 45.4167,
                    'is_default' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        // 3. Supermarket Settlements: #POS-SET-10001 Hardened to Sulaymaniyah Hub
        $settlements = [
            [
                'settlement_number' => 'POS-SET-10001',
                'warehouse_id' => 'suly-main-darkstore', // HARDENED TO SULAYMANIYAH PARTNER HYPERMARKET
                'period_date' => $now->copy()->subDays(4)->toDateString(),
                'orders_count' => 6,
                'total_shelf_sales_iqd' => 100000, // EXACT IQD 100,000 BENCHMARK
                'bazmart_commission_3pct_iqd' => 3000, // EXACT 3% = IQD 3,000
                'supermarket_net_payable_97pct_iqd' => 97000, // EXACT 97% = IQD 97,000
                'status' => 'SETTLED',
                'settled_at' => $now->copy()->subDays(4)->setTime(23, 59),
                'created_at' => $now->copy()->subDays(4),
                'updated_at' => $now->copy()->subDays(4),
            ],
            [
                'settlement_number' => 'POS-SET-10002',
                'warehouse_id' => 'suly-main-darkstore',
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
                'warehouse_id' => 'suly-main-darkstore',
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
            DB::table('supermarket_settlements')->updateOrInsert(
                ['settlement_number' => $s['settlement_number']],
                $s
            );
        }

        // 4. Ensure 100% Shelf-Price Parity across all products (0 IQD variance)
        DB::table('products')->update([
            'pos_shelf_price_iqd' => DB::raw('original_price_iqd'),
            'pos_promo_price_iqd' => null,
            'pos_parity_verified' => 1,
            'commission_rate_percent' => 3.00,
            'updated_at' => $now,
        ]);
    }
}
