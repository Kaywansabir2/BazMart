<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CampaignBanner;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        $file = __DIR__ . '/data/banners.json';
        if (!file_exists($file)) return;
        $items = json_decode(file_get_contents($file), true);
        foreach ($items as $item) {
            CampaignBanner::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

