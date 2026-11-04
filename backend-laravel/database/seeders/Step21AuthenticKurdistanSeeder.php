<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Carbon\Carbon;

class Step21AuthenticKurdistanSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Populate aisle_location and photographic image_url for all 400 products
        $products = Product::all();
        foreach ($products as $p) {
            $cat = strtolower($p->category_id ?? '');
            $title = strtolower($p->title_en . ' ' . ($p->title_ckb ?? ''));

            $aisle = "ڕێڕەوی C1 • پێداویستی گشتی سووپەرمارکێت";
            $imageKey = "grocery_generic";

            if (str_contains($cat, 'dairy') || str_contains($cat, 'milk') || str_contains($title, 'milk') || str_contains($title, 'شیر')) {
                $aisle = "ڕێڕەوی A1 • ساردکەرەوەی شیرەمەنی (5°C)";
                $imageKey = "milk";
            } elseif (str_contains($cat, 'fruit') || str_contains($cat, 'veg') || str_contains($title, 'سەوزە') || str_contains($title, 'میوە')) {
                $aisle = "ڕێڕەوی B2 • بەشی میوە و سەوزەی تازە";
                $imageKey = "produce";
            } elseif (str_contains($cat, 'poultry') || str_contains($cat, 'meat') || str_contains($cat, 'seafood') || str_contains($title, 'مریشک') || str_contains($title, 'گۆشت')) {
                $aisle = "ڕێڕەوی A2 • ساردکەرەوەی گۆشت و مریشکی فرێش (0°C)";
                $imageKey = "meat";
            } elseif (str_contains($cat, 'frozen') || str_contains($cat, 'ice') || str_contains($title, 'دۆندرمە')) {
                $aisle = "ڕێڕەوی A3 • بەفرگری بەستوو (-18°C)";
                $imageKey = "frozen";
            } elseif (str_contains($cat, 'bakery') || str_contains($cat, 'bread') || str_contains($title, 'نان')) {
                $aisle = "ڕێڕەوی B1 • بەشی نانەواخانە و هەویرەمەنی گەرم";
                $imageKey = "bakery";
            } elseif (str_contains($cat, 'beverage') || str_contains($cat, 'water') || str_contains($title, 'cola') || str_contains($title, 'dew') || str_contains($title, 'ئاو')) {
                $aisle = "ڕێڕەوی C4 • بەشی خواردنەوە ساردەکان و ئاو";
                $imageKey = "beverage";
            } elseif (str_contains($cat, 'coffee') || str_contains($cat, 'tea') || str_contains($title, 'nescafe') || str_contains($title, 'چای')) {
                $aisle = "ڕێڕەوی C2 • بەشی قاوە و چای کوردی";
                $imageKey = "coffee";
            } elseif (str_contains($cat, 'snack') || str_contains($cat, 'chocolate') || str_contains($title, 'chips') || str_contains($title, 'چکلێت')) {
                $aisle = "ڕێڕەوی D1 • بەشی چیپس و چکلێت";
                $imageKey = "snack";
            } elseif (str_contains($cat, 'ready') || str_contains($title, 'noodle') || str_contains($title, 'tabasco')) {
                $aisle = "ڕێڕەوی D2 • بەشی نۆدڵز و خواردنی خێرا";
                $imageKey = "noodles";
            } elseif (str_contains($cat, 'cooking') || str_contains($cat, 'condiment') || str_contains($cat, 'spices')) {
                $aisle = "ڕێڕەوی C1 • بەشی برنج و زەیت و بەهارات";
                $imageKey = "pantry";
            } elseif (str_contains($cat, 'personal') || str_contains($cat, 'baby') || str_contains($title, 'shampoo')) {
                $aisle = "ڕێڕەوی E1 • بەشی چاودێری تاکەکەسی و منداڵ";
                $imageKey = "personal_care";
            } elseif (str_contains($cat, 'household') || str_contains($cat, 'clean')) {
                $aisle = "ڕێڕەوی E2 • بەشی پاککەرەوەی ماڵ";
                $imageKey = "cleaning";
            } elseif (str_contains($cat, 'stationery') || str_contains($title, 'pen')) {
                $aisle = "ڕێڕەوی E3 • بەشی کتێب و قەڵەم";
                $imageKey = "stationery";
            }

            // Benchmark specific photographic mappings
            $benchmarkMap = [
                'p-alrahma' => 'milk_alrahma',
                'p-ramak' => 'milk_ramak',
                'p-eggs' => 'eggs',
                'p-almarai' => 'milk_almarai',
                'p-cucumber' => 'cucumber',
                'p-pen' => 'pen',
                'p-mountain-dew' => 'mountain_dew',
                'p-schauma' => 'shampoo',
                'p-shallot' => 'shallot',
                'p-grapefruit' => 'grapefruit',
                'p-pepper-color' => 'pepper_color',
                'p-tabasco-chicken' => 'tabasco_chicken',
                'p-tabasco-curry' => 'tabasco_curry',
                'p-tabasco-beef' => 'tabasco_chicken',
                'p-nescafe-latte' => 'nescafe_latte',
                'p-nescafe-cappuccino' => 'nescafe_cappuccino',
                'p-nescafe-spanish' => 'nescafe_spanish',
                'p-canned-coconut' => 'canned_coconut',
                'p-lollipop-fruit' => 'lollipop_fruit',
                'p-my-chewy' => 'my_chewy',
                'p-pepsi-can' => 'pepsi_can',
            ];

            if (isset($benchmarkMap[$p->id])) {
                $imageKey = $benchmarkMap[$p->id];
            }

            $photoUrl = "/images/products/{$imageKey}.png";
            $p->aisle_location = $aisle;
            $p->image_url = $photoUrl;
            $p->save();
        }

        // 2. Seed 100% Authentic Kurdistan / Sulaymaniyah Customer Profiles & Addresses
        $authenticCustomers = [
            [
                'phone' => '+9647701234567',
                'name' => 'ئاکۆ محەمەد ئەحمەد (Ako Muhamad)',
                'email' => 'ako.muhamad@bazmart.krd',
                'preferred_language' => 'ckb',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 25000,
                'referral_code' => 'AKO_SULY',
                'status' => 'ACTIVE',
                'addresses' => [
                    [
                        'id' => 'addr-ako-suly-home',
                        'title' => 'ماڵەوە (Home)',
                        'city' => 'سلێمانی (Sulaymaniyah)',
                        'neighborhood' => 'گەڕەکی بەختیاری',
                        'street' => 'شەقامی ٢٤',
                        'building' => 'خانووی ژمارە ١٢',
                        'landmark' => 'نزیک پارکی بەختیاری',
                        'latitude' => 35.5669,
                        'longitude' => 45.4144,
                        'is_default' => true,
                    ],
                    [
                        'id' => 'addr-ako-erbil-office',
                        'title' => 'ئۆفیس (Office)',
                        'city' => 'هەولێر (Erbil)',
                        'neighborhood' => 'ئیمپایەر وۆرڵد',
                        'street' => 'شەقامی سەرەکی گولان',
                        'building' => 'تاوەری B4، نهۆمی ٣',
                        'landmark' => 'بەرامبەر فڕۆکەخانەی نێودەوڵەتی هەولێر',
                        'latitude' => 36.1972,
                        'longitude' => 43.9632,
                        'is_default' => false,
                    ],
                ],
            ],
            [
                'phone' => '+9647702345678',
                'name' => 'سارا عومەر ڕەشید (Sara Omer)',
                'email' => 'sara.omer@gmail.com',
                'preferred_language' => 'ckb',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 12500,
                'referral_code' => 'SARA_SULY',
                'status' => 'ACTIVE',
                'addresses' => [
                    [
                        'id' => 'addr-sara-saholaka',
                        'title' => 'شوقەی ماڵەوە',
                        'city' => 'سلێمانی (Sulaymaniyah)',
                        'neighborhood' => 'شەقامی سالم (سەهۆڵەکە)',
                        'street' => 'شەقامی سالم',
                        'building' => 'شوقەی ٤٠٢',
                        'landmark' => 'تەنیشت مۆڵی سیتی ستار',
                        'latitude' => 35.5580,
                        'longitude' => 45.4280,
                        'is_default' => true,
                    ],
                ],
            ],
            [
                'phone' => '+9647703456789',
                'name' => 'کاروان جەلال مەحموود (Karwan Jalal)',
                'email' => 'karwan.jalal@outlook.com',
                'preferred_language' => 'ckb',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 18000,
                'referral_code' => 'KARWAN_SULY',
                'status' => 'ACTIVE',
                'addresses' => [
                    [
                        'id' => 'addr-karwan-tuwimalik',
                        'title' => 'ماڵەوە',
                        'city' => 'سلێمانی (Sulaymaniyah)',
                        'neighborhood' => 'تووی مەلیک',
                        'street' => 'شەقامی بازنەیی مەلیک مەحموود',
                        'building' => 'خانووی ٧٥',
                        'landmark' => 'نزیک نەخۆشخانەی فاروق',
                        'latitude' => 35.5710,
                        'longitude' => 45.4230,
                        'is_default' => true,
                    ],
                ],
            ],
            [
                'phone' => '+9647501234567',
                'name' => 'ئەحمەد کەریم حەسەن (Ahmad Karim)',
                'email' => 'ahmad.karim@erbil.krd',
                'preferred_language' => 'ckb',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 30000,
                'referral_code' => 'AHMAD_KRD',
                'status' => 'ACTIVE',
                'addresses' => [
                    [
                        'id' => 'addr-ahmad-whitecity',
                        'title' => 'ڤێلای سەرەکی',
                        'city' => 'سلێمانی (Sulaymaniyah)',
                        'neighborhood' => 'شاری سپی (وایت ستی)',
                        'street' => 'شەقامی مرواری',
                        'building' => 'ڤێلای ژمارە ٢٨',
                        'landmark' => 'نزیک یاریگای شاری سپی',
                        'latitude' => 35.5490,
                        'longitude' => 45.4410,
                        'is_default' => true,
                    ],
                ],
            ],
            [
                'phone' => '+9647704567891',
                'name' => 'لانە فەرهاد سەعید (Lana Farhad)',
                'email' => 'lana.farhad@krd-law.com',
                'preferred_language' => 'ckb',
                'is_onboarded' => 1,
                'wallet_balance_iqd' => 20000,
                'referral_code' => 'LANA_SULY',
                'status' => 'ACTIVE',
                'addresses' => [
                    [
                        'id' => 'addr-lana-sarchinar',
                        'title' => 'ماڵەوە',
                        'city' => 'سلێمانی (Sulaymaniyah)',
                        'neighborhood' => 'گردی سەرچنار',
                        'street' => 'شەقامی سەرەکی سەرچنار',
                        'building' => 'کۆمەڵگەی بەهار',
                        'landmark' => 'نزیک هۆتێل گراند ملینیۆم',
                        'latitude' => 35.5840,
                        'longitude' => 45.3780,
                        'is_default' => true,
                    ],
                ],
            ],
        ];

        foreach ($authenticCustomers as $custData) {
            $addresses = $custData['addresses'];
            unset($custData['addresses']);

            $existing = Customer::where('phone', $custData['phone'])->first();
            if ($existing) {
                $existing->update($custData);
                $customerId = $existing->id;
            } else {
                $custData['id'] = 'c-' . substr(md5($custData['phone']), 0, 10);
                $custData['created_at'] = $now;
                $custData['updated_at'] = $now;
                $newCust = Customer::create($custData);
                $customerId = $newCust->id;
            }

            foreach ($addresses as $addr) {
                $addr['customer_id'] = $customerId;
                $addr['created_at'] = $now;
                $addr['updated_at'] = $now;
                CustomerAddress::updateOrCreate(['id' => $addr['id']], $addr);
            }
        }

        // 3. Supermarket Settlement Vouchers: ensure Sulaymaniyah Flagship Hub default
        DB::table('supermarket_settlements')->update([
            'warehouse_id' => 'suly-main-darkstore',
        ]);

        // 4. Update warehouse details for Sulaymaniyah Flagship
        DB::table('warehouses')->where('id', 'suly-main-darkstore')->update([
            'name' => 'Sulaymaniyah Flagship Dark Store & POS Hub',
            'city' => 'Sulaymaniyah',
        ]);
    }
}
