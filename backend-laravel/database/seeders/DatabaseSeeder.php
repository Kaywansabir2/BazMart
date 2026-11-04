<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            WarehouseSeeder::class,
            CategorySeeder::class,
            BrandAndCountrySeeder::class,
            ProductCatalogSeeder::class,
            CampaignSeeder::class,
            CouponSeeder::class,
            DriverAndCustomerSeeder::class,
            SupplyChainSeeder::class,
            Step16OperationalDataSeeder::class,
            Step21AuthenticKurdistanSeeder::class,
        ]);
    }
}
