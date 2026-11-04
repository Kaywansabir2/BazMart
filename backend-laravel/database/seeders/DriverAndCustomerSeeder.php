<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Driver;
use App\Models\DriverCashLedger;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\PaymentConfig;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use App\Models\OrderRating;
use App\Models\Product;
use App\Models\FinancialLedgerEntry;

class DriverAndCustomerSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Drivers
        $driversFile = __DIR__ . '/data/drivers.json';
        if (file_exists($driversFile)) {
            $drivers = json_decode(file_get_contents($driversFile), true);
            foreach ($drivers as $d) {
                Driver::updateOrCreate(['id' => $d['id']], $d);
            }
        }

        // 2. Ledgers
        $ledgersFile = __DIR__ . '/data/ledgers.json';
        if (file_exists($ledgersFile)) {
            $ledgers = json_decode(file_get_contents($ledgersFile), true);
            foreach ($ledgers as $l) {
                DriverCashLedger::create($l);
            }
        }

        // 3. Customers
        $custFile = __DIR__ . '/data/customers.json';
        if (file_exists($custFile)) {
            $customers = json_decode(file_get_contents($custFile), true);
            foreach ($customers as $c) {
                Customer::updateOrCreate(['id' => $c['id']], $c);
            }
        }

        // 4. Addresses
        $addrFile = __DIR__ . '/data/addresses.json';
        if (file_exists($addrFile)) {
            $addresses = json_decode(file_get_contents($addrFile), true);
            foreach ($addresses as $a) {
                CustomerAddress::updateOrCreate(['id' => $a['id']], $a);
            }
        }

        // 5. Payment configs
        $payFile = __DIR__ . '/data/payments.json';
        if (file_exists($payFile)) {
            $payments = json_decode(file_get_contents($payFile), true);
            foreach ($payments as $p) {
                PaymentConfig::updateOrCreate(['id' => $p['id']], $p);
            }
        }

        // 6. Orders
        $orderFile = __DIR__ . '/data/orders.json';
        if (file_exists($orderFile)) {
            $orders = json_decode(file_get_contents($orderFile), true);
            foreach ($orders as $o) {
                Order::updateOrCreate(['id' => $o['id']], $o);
            }
        }

        // 7. Order Items
        $itemsFile = __DIR__ . '/data/order_items.json';
        if (file_exists($itemsFile)) {
            $items = json_decode(file_get_contents($itemsFile), true);
            foreach ($items as $item) {
                OrderItem::create($item);
            }
        }

        // 7b. Back-calculate accurate wholesale COGS, unit profit, and margin for ALL orders and items
        FinancialLedgerEntry::truncate();
        $productsMap = Product::all()->keyBy('id');

        $orderItems = OrderItem::all();
        $canonicalSkus = ['p-cucumber', 'p-pen', 'p-mountain-dew', 'p-schauma', 'p-tabasco-chicken', 'p-tabasco-beef', 'p-tabasco-curry', 'p-nescafe-latte', 'p-nescafe-cappuccino', 'p-nescafe-spanish', 'p-alrahma', 'p-ramak', 'p-eggs', 'p-almarai'];

        foreach ($orderItems as $item) {
            $prod = $productsMap->get($item->product_id);
            if ($prod && in_array($item->product_id, $canonicalSkus)) {
                $unitCost = (int)$prod->cost_price_iqd;
            } else {
                $unitCost = min($prod && $prod->cost_price_iqd > 0 ? (int)$prod->cost_price_iqd : PHP_INT_MAX, (int)round($item->unit_price_iqd * 0.73));
            }
            $unitOrig = ($prod && $prod->original_price_iqd > 0) ? (int)$prod->original_price_iqd : (int)$item->unit_price_iqd;
            $totalCost = (int)($unitCost * $item->quantity);
            $promoDiscount = (int)max(0, ($unitOrig - $item->unit_price_iqd) * $item->quantity);
            $lineGrossProfit = (int)($item->total_iqd - $totalCost);
            $marginPct = $item->total_iqd > 0 ? round(($lineGrossProfit / $item->total_iqd) * 100, 2) : 0;

            $item->update([
                'unit_original_price_iqd' => $unitOrig,
                'unit_cost_price_iqd' => $unitCost,
                'total_cost_iqd' => $totalCost,
                'line_promo_discount_iqd' => $promoDiscount,
                'line_gross_profit_iqd' => $lineGrossProfit,
                'line_margin_percentage' => $marginPct,
            ]);
        }

        $allOrders = Order::with('items')->get();
        foreach ($allOrders as $idx => $order) {
            $orderDate = $order->created_at ?: now()->subDays($idx % 6);
            $totalCogs = (int)$order->items->sum('total_cost_iqd');
            $gmvIqd = (int)$order->items->sum(function ($it) {
                return ($it->unit_original_price_iqd ?: $it->unit_price_iqd) * $it->quantity;
            });
            $promoTotal = (int)$order->items->sum('line_promo_discount_iqd');
            $grossProfitBeforeCoupon = (int)($order->subtotal_iqd - $totalCogs);
            $driverPayout = 1000;
            $coupon = (int)($order->coupon_discount_iqd ?? 0);
            $delFee = (int)($order->delivery_fee_iqd ?? 0);
            $netProfit = (int)($order->subtotal_iqd - $totalCogs - $coupon + $delFee - $driverPayout);
            $marginPct = $order->subtotal_iqd > 0 ? round(($netProfit / $order->subtotal_iqd) * 100, 2) : 0;

            $order->update([
                'gross_merchandise_value_iqd' => $gmvIqd,
                'item_promo_discount_total_iqd' => $promoTotal,
                'total_cogs_iqd' => $totalCogs,
                'gross_profit_before_coupon_iqd' => $grossProfitBeforeCoupon,
                'driver_delivery_payout_iqd' => $driverPayout,
                'net_profit_iqd' => $netProfit,
                'profit_margin_percentage' => $marginPct,
            ]);

            // Financial Ledger Entries for this Order
            // 1. Order Revenue (Credit)
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
                'amount_iqd' => $totalCogs,
                'description' => "Order #{$order->order_number} Cost of Goods Sold",
                'recorded_at' => $orderDate,
            ]);

            // 3. Item Promo Burn (Debit) if any
            if ($promoTotal > 0) {
                FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . str_pad($idx * 5 + 3, 6, '0', STR_PAD_LEFT),
                    'warehouse_id' => $order->warehouse_id,
                    'order_id' => $order->id,
                    'product_id' => null,
                    'entry_type' => 'PROMO_DISCOUNT_BURN',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $promoTotal,
                    'description' => "Order #{$order->order_number} Item Promo Burn",
                    'recorded_at' => $orderDate,
                ]);
            }

            // 4. Coupon Subsidy Burn (Debit) if any
            if ($coupon > 0) {
                FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . str_pad($idx * 5 + 4, 6, '0', STR_PAD_LEFT),
                    'warehouse_id' => $order->warehouse_id,
                    'order_id' => $order->id,
                    'product_id' => null,
                    'entry_type' => 'COUPON_SUBSIDY_BURN',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $coupon,
                    'description' => "Order #{$order->order_number} Coupon Subsidy Burn",
                    'recorded_at' => $orderDate,
                ]);
            }

            // 5. Driver Delivery Cost (Debit) for completed/delivered orders
            if ($order->order_status === 'DELIVERED') {
                FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . str_pad($idx * 5 + 5, 6, '0', STR_PAD_LEFT),
                    'warehouse_id' => $order->warehouse_id,
                    'order_id' => $order->id,
                    'product_id' => null,
                    'entry_type' => 'DRIVER_PAYOUT_COST',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $driverPayout,
                    'description' => "Order #{$order->order_number} Courier Dispatch Payout",
                    'recorded_at' => $orderDate,
                ]);
            }
        }

        // 8. Notifications
        $notifFile = __DIR__ . '/data/notifications.json';
        if (file_exists($notifFile)) {
            $notifs = json_decode(file_get_contents($notifFile), true);
            foreach ($notifs as $n) {
                Notification::create($n);
            }
        }

        // 9. Ratings
        $ratingFile = __DIR__ . '/data/ratings.json';
        if (file_exists($ratingFile)) {
            $ratings = json_decode(file_get_contents($ratingFile), true);
            foreach ($ratings as $r) {
                OrderRating::create($r);
            }
        }

        // 10. Step 14: Customer Lifecycle, Wallet & Support Seeding
        $ako = Customer::where('phone', '+9647701234567')->first();
        if ($ako) {
            $ako->update([
                'name' => 'Ako Muhamad',
                'email' => 'ako.muhamad@bazmart.iq',
                'is_onboarded' => true,
                'wallet_balance_iqd' => 5000,
                'referral_code' => 'AKO5000',
                'status' => 'ACTIVE',
                'last_login_at' => now(),
            ]);

            // Clear old transactions if any
            \App\Models\WalletTransaction::where('customer_id', $ako->id)->delete();

            \App\Models\WalletTransaction::create([
                'transaction_number' => '#WLT-100001',
                'customer_id' => $ako->id,
                'order_id' => null,
                'type' => 'TOPUP_BONUS',
                'direction' => 'CREDIT',
                'amount_iqd' => 3000,
                'balance_after_iqd' => 3000,
                'description_en' => 'Welcome To BazMart Wallet Bonus',
                'description_ckb' => 'باڵانسی دیاریی بەخێرهاتنی بازمارت',
                'description_ar' => 'مكافأة ترحيبية في محفظة بازمارت',
                'created_at' => now()->subDays(2),
            ]);

            \App\Models\WalletTransaction::create([
                'transaction_number' => '#WLT-100002',
                'customer_id' => $ako->id,
                'order_id' => null,
                'type' => 'COMPENSATION_VOUCHER',
                'direction' => 'CREDIT',
                'amount_iqd' => 2000,
                'balance_after_iqd' => 5000,
                'description_en' => 'Courtesy Delivery Delay Compensation',
                'description_ckb' => 'قەرەبووی دواکەوتنی گەیاندنی داواکاری',
                'description_ar' => 'رصيد تعويضي عن تأخير توصيل الطلب',
                'created_at' => now()->subDay(),
            ]);

            // Favorites
            \App\Models\CustomerFavorite::firstOrCreate([
                'customer_id' => $ako->id,
                'product_id' => 'p-alrahma',
            ]);
            \App\Models\CustomerFavorite::firstOrCreate([
                'customer_id' => $ako->id,
                'product_id' => 'p-cucumber',
            ]);

            // Seed Demo Support Ticket
            $deliveredOrder = Order::where('customer_phone', $ako->phone)->where('order_status', 'DELIVERED')->first()
                ?? Order::where('order_status', 'DELIVERED')->first()
                ?? Order::first();

            if ($deliveredOrder) {
                \App\Models\SupportTicket::updateOrCreate(
                    ['ticket_number' => '#TKT-10001'],
                    [
                        'order_id' => $deliveredOrder->id,
                        'customer_id' => $ako->id,
                        'issue_category' => 'DAMAGED_OR_SPOILED_ITEM',
                        'affected_order_item_ids' => ['p-alrahma'],
                        'customer_note' => 'One milk container was cracked during motorcycle dispatch.',
                        'requested_refund_iqd' => 2250,
                        'status' => 'OPEN',
                    ]
                );
            }
        }

        // Set one product out-of-stock in Erbil darkstore for testing "Notify Me"
        \App\Models\WarehouseStock::where('product_id', 'p-eggs')->update(['stock_quantity' => 0]);
        \App\Models\InventoryBatch::where('product_id', 'p-eggs')->update(['remaining_quantity' => 0, 'status' => 'DEPLETED']);
    }
}

