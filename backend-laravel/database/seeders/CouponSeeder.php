<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $file = __DIR__ . '/data/coupons.json';
        if (!file_exists($file)) return;
        $items = json_decode(file_get_contents($file), true);
        foreach ($items as $item) {
            Coupon::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

