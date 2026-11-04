<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $file = __DIR__ . '/data/warehouses.json';
        if (!file_exists($file)) return;
        $items = json_decode(file_get_contents($file), true);
        foreach ($items as $item) {
            Warehouse::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

