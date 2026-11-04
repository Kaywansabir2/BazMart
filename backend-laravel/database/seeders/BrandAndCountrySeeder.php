<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\CountryOrigin;

class BrandAndCountrySeeder extends Seeder
{
    public function run(): void
    {
        $brandsFile = __DIR__ . '/data/brands.json';
        if (file_exists($brandsFile)) {
            $brands = json_decode(file_get_contents($brandsFile), true);
            foreach ($brands as $b) {
                Brand::updateOrCreate(['id' => $b['id']], $b);
            }
        }

        $countriesFile = __DIR__ . '/data/countries.json';
        if (file_exists($countriesFile)) {
            $countries = json_decode(file_get_contents($countriesFile), true);
            foreach ($countries as $c) {
                CountryOrigin::updateOrCreate(['id' => $c['id']], $c);
            }
        }
    }
}

