<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$batches = App\Models\InventoryBatch::where('product_id', 'p-cucumber')->orderBy('expiry_date', 'asc')->get();
foreach ($batches as $b) {
    echo "{$b->batch_number} | rem: {$b->remaining_quantity} | exp: {$b->expiry_date} | status: {$b->status}\n";
}

