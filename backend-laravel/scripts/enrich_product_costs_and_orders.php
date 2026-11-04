<?php

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\FinancialLedgerEntry;
use Illuminate\Support\Facades\DB;

echo "--- Enriching Products with Cost Prices and Supplier Metadata ---\n";

$canonicalCosts = [
    'p-alrahma' => ['cost' => 1750, 'supplier' => 'Al Rahma Dairy Distribution'],
    'p-ramak' => ['cost' => 1750, 'supplier' => 'Ramak Dairy Co.'],
    'p-eggs' => ['cost' => 2950, 'supplier' => 'Kurdistan Poultry Co.'],
    'p-almarai' => ['cost' => 2150, 'supplier' => 'Almarai Iraq Distribution'],
    'p-cucumber' => ['cost' => 1050, 'supplier' => 'Erbil Central Produce Terminal'],
    'p-pen' => ['cost' => 250, 'supplier' => 'Piano Stationery Levant'],
    'p-mountain-dew' => ['cost' => 220, 'supplier' => 'PepsiCo Iraq / Baghdad Soft Drinks'],
    'p-schauma' => ['cost' => 5400, 'supplier' => 'Henkel Iraq Distribution'],
    'p-tabasco-chicken' => ['cost' => 900, 'supplier' => 'Asian Food Import Hub'],
    'p-tabasco-beef' => ['cost' => 900, 'supplier' => 'Asian Food Import Hub'],
    'p-tabasco-curry' => ['cost' => 900, 'supplier' => 'Asian Food Import Hub'],
    'p-nescafe-latte' => ['cost' => 750, 'supplier' => 'Nestlé Middle East'],
    'p-shallot' => ['cost' => 950, 'supplier' => 'Erbil Central Produce Terminal'],
    'p-grapefruit' => ['cost' => 3200, 'supplier' => 'Erbil Central Produce Terminal'],
    'p-pepper-color' => ['cost' => 1400, 'supplier' => 'Erbil Central Produce Terminal'],
    'p-coconut-milk' => ['cost' => 4000, 'supplier' => 'Exotic Foods Asia Distribution'],
    'p-lollipop' => ['cost' => 850, 'supplier' => 'Sweet Candy Co. Iraq'],
    'p-my-chewy' => ['cost' => 4500, 'supplier' => 'Sweet Candy Co. Iraq'],
];

$suppliersByCategory = [
    'cat-fruit-veg' => 'Erbil Central Produce Terminal',
    'cat-dairy-eggs' => 'Kurdistan Dairy & Cold Chain Logistics',
    'cat-bakery' => 'Golden Wheat Bakery Suppliers',
    'cat-meat-seafood' => 'Kurdistan Fresh Meat & Poultry Corp',
    'cat-beverages' => 'National Beverage Distribution Co.',
    'cat-snacks' => 'Nestlé & Master Food Levant',
    'cat-frozen' => 'Global Frozen Food Cold Chain',
    'cat-pantry' => 'Al-Mansour Food Importers',
    'cat-personal-care' => 'Unilever Levant Distribution',
    'cat-cleaning' => 'Parex & Sanita Household Distribution',
];

$products = Product::all();
foreach ($products as $p) {
    if (isset($canonicalCosts[$p->id])) {
        $cost = $canonicalCosts[$p->id]['cost'];
        $supp = $canonicalCosts[$p->id]['supplier'];
    } else {
        // Between 70% and 78% of original retail price
        $costRatio = 0.70 + ((abs(crc32($p->id)) % 8) / 100);
        $cost = (int)round($p->original_price_iqd * $costRatio);
        // Ensure rounding to nearest 25 or 50 IQD
        $cost = (int)(round($cost / 50) * 50);
        if ($cost >= $p->original_price_iqd) {
            $cost = (int)round($p->original_price_iqd * 0.75);
        }
        $supp = $suppliersByCategory[$p->category_id] ?? 'Erbil Master Commercial Trading';
    }

    $p->update([
        'cost_price_iqd' => $cost,
        'min_margin_percent_threshold' => 12,
        'supplier_name' => $supp,
        'tax_or_customs_iqd' => (int)round($cost * 0.02),
    ]);
}

echo "Successfully updated cost prices on " . count($products) . " products.\n";

// Update JSON fixture as well
$jsonFile = __DIR__ . '/../database/seeders/data/products.json';
if (file_exists($jsonFile)) {
    $jsonProducts = json_decode(file_get_contents($jsonFile), true);
    foreach ($jsonProducts as &$jp) {
        $dbP = $products->firstWhere('id', $jp['id']);
        if ($dbP) {
            $jp['cost_price_iqd'] = $dbP->cost_price_iqd;
            $jp['min_margin_percent_threshold'] = 12;
            $jp['supplier_name'] = $dbP->supplier_name;
            $jp['tax_or_customs_iqd'] = $dbP->tax_or_customs_iqd;
        }
    }
    file_put_contents($jsonFile, json_encode($jsonProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "Updated data/products.json with cost fields.\n";
}

echo "--- Back-populating Orders & OrderItems with COGS & Historical P&L ---\n";

DB::table('financial_ledger_entries')->delete();

$orders = Order::with('items')->get();
$now = time();

foreach ($orders as $idx => $order) {
    // Spread orders over past 7 days
    $daysAgo = ($idx % 7);
    $orderDate = date('Y-m-d H:i:s', $now - ($daysAgo * 86400) - ($idx * 3600));

    $gmvIqd = 0;
    $itemPromoDiscountTotal = 0;
    $totalCogsIqd = 0;

    foreach ($order->items as $item) {
        $prod = Product::find($item->product_id);
        $unitCost = $prod ? $prod->cost_price_iqd : (int)round($item->unit_price_iqd * 0.75);
        $unitOriginal = $prod ? $prod->original_price_iqd : $item->unit_price_iqd;

        $totalCost = $unitCost * $item->quantity;
        $linePromoDiscount = max(0, ($unitOriginal - $item->unit_price_iqd) * $item->quantity);
        $lineGrossProfit = $item->total_iqd - $totalCost;
        $lineMarginPct = $item->total_iqd > 0 ? round(($lineGrossProfit / $item->total_iqd) * 100, 2) : 0;

        $item->update([
            'unit_original_price_iqd' => $unitOriginal,
            'unit_cost_price_iqd' => $unitCost,
            'total_cost_iqd' => $totalCost,
            'line_promo_discount_iqd' => $linePromoDiscount,
            'line_gross_profit_iqd' => $lineGrossProfit,
            'line_margin_percentage' => $lineMarginPct,
        ]);

        $gmvIqd += $unitOriginal * $item->quantity;
        $itemPromoDiscountTotal += $linePromoDiscount;
        $totalCogsIqd += $totalCost;
    }

    $grossProfitBeforeCoupon = $order->subtotal_iqd - $totalCogsIqd;
    $driverPayout = 1000;
    $couponDiscount = $order->coupon_discount_iqd ?? 0;
    $deliveryFee = $order->delivery_fee_iqd ?? 0;

    $netProfitIqd = $order->subtotal_iqd - $totalCogsIqd - $couponDiscount + $deliveryFee - $driverPayout;
    $marginPct = $order->subtotal_iqd > 0 ? round(($netProfitIqd / $order->subtotal_iqd) * 100, 2) : 0;

    $order->update([
        'gross_merchandise_value_iqd' => $gmvIqd,
        'item_promo_discount_total_iqd' => $itemPromoDiscountTotal,
        'total_cogs_iqd' => $totalCogsIqd,
        'gross_profit_before_coupon_iqd' => $grossProfitBeforeCoupon,
        'driver_delivery_payout_iqd' => $driverPayout,
        'net_profit_iqd' => $netProfitIqd,
        'profit_margin_percentage' => $marginPct,
        'created_at' => $orderDate,
        'updated_at' => $orderDate,
    ]);

    // Financial Ledger Entries for this order
    // 1. Order Net Basket Revenue (Credit)
    FinancialLedgerEntry::create([
        'entry_number' => '#FIN-' . str_pad($idx * 5 + 1, 6, '0', STR_PAD_LEFT),
        'warehouse_id' => $order->warehouse_id,
        'order_id' => $order->id,
        'product_id' => null,
        'entry_type' => 'ORDER_REVENUE',
        'direction' => 'CREDIT',
        'amount_iqd' => $order->subtotal_iqd,
        'description' => "Order #{$order->order_number} Net Basket Revenue",
        'recorded_at' => $orderDate,
    ]);

    // 2. Order COGS (Debit)
    FinancialLedgerEntry::create([
        'entry_number' => '#FIN-' . str_pad($idx * 5 + 2, 6, '0', STR_PAD_LEFT),
        'warehouse_id' => $order->warehouse_id,
        'order_id' => $order->id,
        'product_id' => null,
        'entry_type' => 'ORDER_COGS',
        'direction' => 'DEBIT',
        'amount_iqd' => $totalCogsIqd,
        'description' => "Order #{$order->order_number} Cost of Goods Sold",
        'recorded_at' => $orderDate,
    ]);

    // 3. Item Promo Discount Burn if any (Debit)
    if ($itemPromoDiscountTotal > 0) {
        FinancialLedgerEntry::create([
            'entry_number' => '#FIN-' . str_pad($idx * 5 + 3, 6, '0', STR_PAD_LEFT),
            'warehouse_id' => $order->warehouse_id,
            'order_id' => $order->id,
            'product_id' => null,
            'entry_type' => 'PROMO_DISCOUNT_BURN',
            'direction' => 'DEBIT',
            'amount_iqd' => $itemPromoDiscountTotal,
            'description' => "Order #{$order->order_number} Item Save % Discount Burn",
            'recorded_at' => $orderDate,
        ]);
    }

    // 4. Coupon Subsidy Burn if any (Debit)
    if ($couponDiscount > 0) {
        FinancialLedgerEntry::create([
            'entry_number' => '#FIN-' . str_pad($idx * 5 + 4, 6, '0', STR_PAD_LEFT),
            'warehouse_id' => $order->warehouse_id,
            'order_id' => $order->id,
            'product_id' => null,
            'entry_type' => 'COUPON_SUBSIDY_BURN',
            'direction' => 'DEBIT',
            'amount_iqd' => $couponDiscount,
            'description' => "Order #{$order->order_number} Promo Code Subsidy ({$order->coupon_code})",
            'recorded_at' => $orderDate,
        ]);
    }

    // 5. Driver Payout Cost (Debit)
    FinancialLedgerEntry::create([
        'entry_number' => '#FIN-' . str_pad($idx * 5 + 5, 6, '0', STR_PAD_LEFT),
        'warehouse_id' => $order->warehouse_id,
        'order_id' => $order->id,
        'product_id' => null,
        'entry_type' => 'DRIVER_PAYOUT_COST',
        'direction' => 'DEBIT',
        'amount_iqd' => $driverPayout,
        'description' => "Order #{$order->order_number} Dark Store Rider Delivery Payout",
        'recorded_at' => $orderDate,
    ]);
}

echo "Successfully back-populated " . count($orders) . " orders and generated financial ledger entries.\n";
echo "Total Ledger Entries: " . FinancialLedgerEntry::count() . "\n";
