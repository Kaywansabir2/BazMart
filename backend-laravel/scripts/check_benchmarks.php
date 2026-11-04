<?php

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;

$benchmarks = [
    'p-alrahma' => 1750,
    'p-ramak' => 1750,
    'p-eggs' => 2950,
    'p-almarai' => 2150,
    'p-cucumber' => 1050,
    'p-pen' => 250,
    'p-mountain-dew' => 220,
    'p-schauma' => 5400,
    'p-tabasco-chicken' => 900,
    'p-nescafe-latte' => 750,
    'p-shallot' => 950,
    'p-grapefruit' => 3200,
    'p-pepper-color' => 1400,
    'p-coconut-milk' => 4000,
    'p-lollipop' => 850,
    'p-my-chewy' => 4500,
];

$allPassed = true;
foreach ($benchmarks as $id => $expectedCost) {
    $p = Product::find($id);
    if (!$p) {
        echo "FAIL: $id not found\n";
        $allPassed = false;
        continue;
    }
    $activePrice = $p->discounted_price_iqd ?? $p->original_price_iqd;
    $profit = $activePrice - $p->cost_price_iqd;
    $margin = round(($profit / $activePrice) * 100, 2);
    $ok = ($p->cost_price_iqd === $expectedCost) ? 'PASS' : 'FAIL';
    if ($ok === 'FAIL') $allPassed = false;
    echo "[$ok] {$p->title_en} | Active: IQD {$activePrice} | Cost: IQD {$p->cost_price_iqd} | Profit: IQD {$profit} ({$margin}%)\n";
}

echo "\nResult: " . ($allPassed ? "ALL 16 BENCHMARKS PASSED" : "SOME FAILED") . "\n";
