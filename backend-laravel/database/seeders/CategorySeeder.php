<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $file = __DIR__ . '/data/categories.json';
        if (!file_exists($file)) return;
        $items = json_decode(file_get_contents($file), true);
        foreach ($items as $item) {
            Category::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

