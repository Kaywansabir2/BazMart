<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$items = App\Models\OrderItem::with('product')->get();
$canonical = ['p-cucumber', 'p-pen', 'p-mountain-dew', 'p-schauma', 'p-tabasco-chicken', 'p-tabasco-beef', 'p-tabasco-curry', 'p-nescafe-latte', 'p-nescafe-cappuccino', 'p-nescafe-spanish', 'p-alrahma', 'p-ramak', 'p-eggs', 'p-almarai'];

$rev = 0; $cogs = 0;
foreach ($items as $it) {
    $prod = $it->product;
    if ($prod && in_array($it->product_id, $canonical)) {
        $cost = (int)$prod->cost_price_iqd;
    } else {
        $cost = min($prod ? (int)$prod->cost_price_iqd : PHP_INT_MAX, (int)round($it->unit_price_iqd * 0.73));
    }
    $rev += $it->total_iqd;
    $cogs += ($cost * $it->quantity);
}
echo "Total Rev: {$rev} Total Cogs: {$cogs} Ratio: " . round(($cogs / $rev) * 100, 2) . "% Gross Margin: " . round((($rev - $cogs) / $rev) * 100, 2) . "%\n";
