<?php

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;

$queries = ['Piano', 'Nescafe', 'Pepper', 'Rabbit', 'Chewy', 'Tabasco'];
foreach ($queries as $q) {
    $matches = Product::where('title_en', 'like', "%$q%")->get(['id', 'title_en', 'cost_price_iqd', 'original_price_iqd', 'discounted_price_iqd']);
    foreach ($matches as $m) {
        echo "Found: ID={$m->id} | {$m->title_en} | Orig={$m->original_price_iqd} | Disc={$m->discounted_price_iqd} | Cost={$m->cost_price_iqd}\n";
    }
}

