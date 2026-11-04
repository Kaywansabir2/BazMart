<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Warehouse;
use App\Models\Category;
use App\Models\Brand;
use App\Models\CountryOrigin;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Driver;
use App\Models\DriverCashLedger;
use App\Models\FinancialLedgerEntry;
use App\Models\OrderRating;
use App\Models\CampaignBanner;
use App\Models\Notification;

echo "=== TABLE COUNTS ===\n";
$tables = [
    'warehouses' => Warehouse::count(),
    'categories' => Category::count(),
    'brands' => Brand::count(),
    'countries_origin' => CountryOrigin::count(),
    'products' => Product::count(),
    'warehouse_stocks' => WarehouseStock::count(),
    'stock_movements' => StockMovement::count(),
    'customers' => Customer::count(),
    'customer_addresses' => CustomerAddress::count(),
    'orders' => Order::count(),
    'order_items' => OrderItem::count(),
    'coupons' => Coupon::count(),
    'coupon_redemptions' => CouponRedemption::count(),
    'drivers' => Driver::count(),
    'driver_cash_ledgers' => DriverCashLedger::count(),
    'financial_ledger_entries' => FinancialLedgerEntry::count(),
    'order_ratings' => OrderRating::count(),
    'campaign_banners' => CampaignBanner::count(),
    'notifications' => Notification::count(),
];

foreach ($tables as $t => $cnt) {
    echo "$t: $cnt\n";
}

echo "\n=== PRODUCT AUDIT ===\n";
$nullCost = Product::whereNull('cost_price_iqd')->orWhere('cost_price_iqd', 0)->count();
$nullMargin = Product::whereNull('min_margin_percent_threshold')->count();
$nullSupplier = Product::whereNull('supplier_name')->count();
echo "Null or zero cost_price_iqd: $nullCost\n";
echo "Null min_margin_percent_threshold: $nullMargin\n";
echo "Null supplier_name: $nullSupplier\n";

echo "\n=== BENCHMARK ITEMS ===\n";
$benchmarks = [
    'ERP-SKU-1001' => 'Al Rahma Low Fat Milk, 1L',
    'ERP-SKU-1002' => 'Ramak Full Fat Milk, 3%Fat',
    'ERP-SKU-1003' => 'White Eggs, 15 Pieces',
    'ERP-SKU-1004' => 'Almarai Full Fat Long Life Milk, 1L',
    'p-cucumber'   => 'Cucumber - Local, 1kg',
    'p-pen'        => 'Piano Soft Ink Red Pen',
    'ERP-SKU-1007' => 'Mountain Dew Soft Drink Can, 300ml',
    'p-dew'        => 'Mountain Dew Soft Drink Can, 300ml',
    'p-schauma'    => 'Schauma Anti-Dandruff Shampoo, 400ml',
    'p-shallot'    => 'Shallot - Iran, 500g',
    'p-grapefruit' => 'Grapefruit Yellow - Turkey, 750g',
    'p-pepper-color' => 'Pepper Long Color - Local',
    'p-tabasco-chicken' => 'Tabasco Ramen Spicy Chicken, 120g',
    'p-nescafe-latte'   => 'Nescafe Latte Iced Coffee, 220ml',
    'p-coconut-milk'    => 'Exotic Coconut Milk, 400ml',
    'p-lollipop'        => 'Rabbit Lollipop, 60g',
    'p-my-chewy'        => 'My Chewy Coconut Candy, 300g',
];

echo "| SKU | Product Title | Original Price (IQD) | Active Selling Price (IQD) | Discount % | Wholesale Cost (cost_price_iqd) | Unit Gross Profit (IQD) | Active Margin (%) |\n";
echo "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";

foreach ($benchmarks as $id => $title) {
    $p = Product::where('external_erp_id', $id)->orWhere('id', $id)->first();
    if ($p) {
        $p->makeVisible(['cost_price_iqd', 'min_margin_percent_threshold']);
        $orig = $p->original_price_iqd;
        $active = $p->discounted_price_iqd ?? $orig;
        $discPct = $p->discount_percentage ?? 0;
        $cost = $p->cost_price_iqd;
        $profit = $active - $cost;
        $margin = $active > 0 ? round(($profit / $active) * 100, 2) : 0;
        echo "| `{$p->external_erp_id}` | **{$p->title_en}** | `IQD " . number_format($orig) . "` | `IQD " . number_format($active) . "` | `{$discPct}%` | `IQD " . number_format($cost) . "` | `+IQD " . number_format($profit) . "` | `{$margin}%` |\n";
    } else {
        echo "| `$id` | NOT FOUND | | | | | | |\n";
    }
}

echo "\n=== PROFITABLE ORDER AUDIT ===\n";
$profOrder = Order::where('net_profit_iqd', '>', 0)->with(['items', 'ledgerEntries'])->first();
if ($profOrder) {
    $profOrder->makeVisible([
        'gross_merchandise_value_iqd', 'item_promo_discount_total_iqd', 'subtotal_iqd', 'total_cogs_iqd',
        'gross_profit_before_coupon_iqd', 'coupon_discount_iqd', 'delivery_fee_iqd', 'driver_delivery_payout_iqd',
        'net_profit_iqd', 'profit_margin_percentage', 'coupon_code'
    ]);
    echo "Order Number: " . $profOrder->order_number . "\n";
    echo "Status: " . $profOrder->order_status . "\n";
    echo "GMV: " . $profOrder->gross_merchandise_value_iqd . " IQD\n";
    echo "Catalog Promo Discount: " . $profOrder->item_promo_discount_total_iqd . " IQD\n";
    echo "Subtotal: " . $profOrder->subtotal_iqd . " IQD\n";
    echo "Total COGS: " . $profOrder->total_cogs_iqd . " IQD\n";
    echo "Gross Profit: " . $profOrder->gross_profit_before_coupon_iqd . " IQD\n";
    echo "Coupon: " . ($profOrder->coupon_code ? "{$profOrder->coupon_code} (-{$profOrder->coupon_discount_iqd} IQD)" : "None") . "\n";
    echo "Delivery Fee: " . $profOrder->delivery_fee_iqd . " IQD\n";
    echo "Driver Payout: " . $profOrder->driver_delivery_payout_iqd . " IQD\n";
    echo "Total Paid: " . $profOrder->total_iqd . " IQD\n";
    echo "Net Operating Profit: " . $profOrder->net_profit_iqd . " IQD\n";
    echo "Profit Margin %: " . $profOrder->profit_margin_percentage . "%\n";
}
$order = Order::whereNotNull('coupon_code')->where('coupon_discount_iqd', '>', 0)->with(['items', 'ledgerEntries'])->first();
if ($order) {
    $order->makeVisible([
        'gross_merchandise_value_iqd', 'item_promo_discount_total_iqd', 'total_cogs_iqd',
        'gross_profit_before_coupon_iqd', 'driver_delivery_payout_iqd', 'net_profit_iqd', 'profit_margin_percentage'
    ]);
    echo "Order Number: " . $order->order_number . "\n";
    echo "Status: " . $order->order_status . "\n";
    echo "GMV: " . $order->gross_merchandise_value_iqd . " IQD\n";
    echo "Catalog Promo Discount: " . $order->item_promo_discount_total_iqd . " IQD\n";
    echo "Subtotal: " . $order->subtotal_iqd . " IQD\n";
    echo "Total COGS: " . $order->total_cogs_iqd . " IQD\n";
    echo "Gross Profit (Before Coupon): " . $order->gross_profit_before_coupon_iqd . " IQD\n";
    echo "Coupon Code: " . $order->coupon_code . " (-" . $order->coupon_discount_iqd . " IQD)\n";
    echo "Delivery Fee: " . $order->delivery_fee_iqd . " IQD\n";
    echo "Driver Payout: " . $order->driver_delivery_payout_iqd . " IQD\n";
    echo "Total Paid by Customer: " . $order->total_iqd . " IQD\n";
    echo "Net Operating Profit: " . $order->net_profit_iqd . " IQD\n";
    echo "Profit Margin %: " . $order->profit_margin_percentage . "%\n";

    echo "\nItems Breakdown (" . $order->items->count() . " items):\n";
    foreach ($order->items as $it) {
        $it->makeVisible(['unit_cost_price_iqd', 'total_cost_iqd', 'line_gross_profit_iqd', 'line_margin_percentage']);
        echo "- {$it->title_en} (Qty: {$it->quantity}) | Price: IQD {$it->unit_price_iqd} | Cost: IQD {$it->unit_cost_price_iqd} | Line Profit: IQD {$it->line_gross_profit_iqd} ({$it->line_margin_percentage}%)\n";
    }

    echo "\nLedger Entries (" . $order->ledgerEntries->count() . " entries):\n";
    foreach ($order->ledgerEntries as $le) {
        echo "- [{$le->entry_type}] {$le->account_code} | IQD {$le->amount_iqd} | {$le->description}\n";
    }
}
