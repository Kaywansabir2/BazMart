<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderFulfillmentService
{
    protected CouponEngineService $couponService;

    public function __construct(CouponEngineService $couponService)
    {
        $this->couponService = $couponService;
    }

    public static function calculateDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $r = 6371; // Earth's mean radius in km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $r * $c;
    }

    public static function validateGeofence(?float $lat, ?float $lng): array
    {
        if ($lat === null || $lng === null) {
            return ['inZone' => true, 'warehouseId' => 'erbil-central-darkstore'];
        }

        $zones = [
            ['id' => 'zone-erbil', 'name' => 'Erbil Central', 'warehouseId' => 'erbil-central-darkstore', 'lat' => 36.1911, 'lng' => 44.0092, 'radius' => 35.0],
            ['id' => 'zone-suly', 'name' => 'Sulaymaniyah Main', 'warehouseId' => 'suly-main-darkstore', 'lat' => 35.5669, 'lng' => 45.4167, 'radius' => 35.0],
            ['id' => 'zone-duhok', 'name' => 'Duhok Central', 'warehouseId' => 'erbil-central-darkstore', 'lat' => 36.8679, 'lng' => 42.9886, 'radius' => 30.0],
            ['id' => 'zone-baghdad', 'name' => 'Baghdad Hub', 'warehouseId' => 'erbil-central-darkstore', 'lat' => 33.3152, 'lng' => 44.3661, 'radius' => 40.0],
        ];

        $closestZone = null;
        $minDist = INF;

        foreach ($zones as $z) {
            $dist = self::calculateDistanceKm($lat, $lng, $z['lat'], $z['lng']);
            if ($dist < $minDist) {
                $minDist = $dist;
                $closestZone = $z;
            }
            if ($dist <= $z['radius']) {
                return ['inZone' => true, 'warehouseId' => $z['warehouseId'], 'distanceKm' => round($dist, 1)];
            }
        }

        return [
            'inZone' => false,
            'distanceKm' => round($minDist, 1),
            'closestZoneName' => $closestZone ? $closestZone['name'] : 'Active Zones',
        ];
    }

    public function validateCart(array $items, string $warehouseId = 'erbil-central-darkstore'): array
    {
        $productIds = array_column($items, 'productId');
        $products = Product::whereIn('id', $productIds)->with(['stocks' => function ($q) use ($warehouseId) {
            $q->where('warehouse_id', $warehouseId);
        }])->get()->keyBy('id');

        $outOfStockItems = [];
        $priceChangedItems = [];

        foreach ($items as $item) {
            $pid = $item['productId'] ?? null;
            $qty = (int)($item['quantity'] ?? 1);
            if (!$pid || !isset($products[$pid])) {
                $outOfStockItems[] = [
                    'productId' => $pid,
                    'reason' => 'ITEM_NOT_FOUND',
                ];
                continue;
            }

            $prod = $products[$pid];
            $currentPrice = (int)round($prod->discounted_price_iqd ?? $prod->original_price_iqd);
            $stock = $prod->stocks->first();
            $safetyBuffer = $stock ? ($stock->safety_stock_buffer ?? 2) : 2;
            $available = $stock ? max(0, $stock->stock_quantity - $stock->reserved_quantity - $safetyBuffer) : 0;

            if ($available < $qty) {
                $outOfStockItems[] = [
                    'productId' => $prod->id,
                    'titleEn' => $prod->title_en,
                    'availableStock' => $available,
                    'requestedQuantity' => $qty,
                    'reason' => 'OUT_OF_STOCK',
                ];
            }

            if (isset($item['expectedPriceIqd']) && (int)round($item['expectedPriceIqd']) !== $currentPrice) {
                $priceChangedItems[] = [
                    'productId' => $prod->id,
                    'titleEn' => $prod->title_en,
                    'currentPriceIqd' => $currentPrice,
                    'previousPriceIqd' => $item['expectedPriceIqd'],
                    'reason' => 'PRICE_CHANGED',
                ];
            }
        }

        $hasChanges = count($outOfStockItems) > 0 || count($priceChangedItems) > 0;
        return [
            'isValid' => !$hasChanges,
            'hasChanges' => $hasChanges,
            'outOfStockItems' => $outOfStockItems,
            'priceChangedItems' => $priceChangedItems,
            'updatedItems' => array_merge($outOfStockItems, $priceChangedItems),
        ];
    }

    public function createOrder(array $data, ?string $idempotencyKey = null): array
    {
        // 1. Idempotency Check
        if ($idempotencyKey) {
            $cleanKey = trim($idempotencyKey);
            $existing = Order::where('idempotency_key', $cleanKey)->with(['items.product', 'driver'])->first();
            if ($existing) {
                return [
                    'order' => $existing,
                    'payment' => [
                        'paymentMethod' => $existing->payment_method,
                        'paymentStatus' => $existing->payment_status,
                        'gatewayUrl' => null,
                    ],
                    'isIdempotentReplay' => true,
                ];
            }
        }

        $items = $data['items'] ?? [];
        if (empty($items)) {
            throw ValidationException::withMessages(['items' => 'Order must contain at least one item.']);
        }

        $phone = isset($data['customerPhone']) ? PhoneAuthService::normalizeIraqiPhone($data['customerPhone']) : '+9647701234567';
        $address = $data['address'] ?? [];
        $lat = isset($address['latitude']) ? (float)$address['latitude'] : null;
        $lng = isset($address['longitude']) ? (float)$address['longitude'] : null;

        $geofence = self::validateGeofence($lat, $lng);
        if (!$geofence['inZone']) {
            throw ValidationException::withMessages([
                'address' => "Outside rapid delivery zone ({$geofence['distanceKm']} km from nearest dark store).",
            ]);
        }

        $warehouseId = $data['warehouseId'] ?? $geofence['warehouseId'] ?? 'erbil-central-darkstore';

        // 2. Fetch products and calculate server-side totals
        $productIds = array_column($items, 'productId');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        if (count($products) !== count(array_unique($productIds))) {
            throw ValidationException::withMessages(['items' => 'One or more items in cart do not exist in catalog.']);
        }

        $subtotalIqd = 0;
        $discountTotalIqd = 0;
        $gmvIqd = 0;
        $itemPromoDiscountTotal = 0;
        $totalCogsIqd = 0;
        $orderItemsData = [];

        foreach ($items as $item) {
            $prod = $products[$item['productId']];
            $qty = (int)$item['quantity'];
            $orig = (int)$prod->original_price_iqd;
            $disc = $prod->discounted_price_iqd !== null ? (int)$prod->discounted_price_iqd : null;
            $unit = $disc ?? $orig;
            $unitCost = (int)$prod->cost_price_iqd;
            if ($unitCost <= 0) {
                $unitCost = (int)round($orig * 0.72); // Default realistic 28% gross margin (72% COGS)
            }
            $lineTotal = $unit * $qty;
            $totalCost = $unitCost * $qty;
            $linePromo = max(0, ($orig - $unit) * $qty);
            $lineProfit = $lineTotal - $totalCost;
            $lineMargin = $lineTotal > 0 ? round(($lineProfit / $lineTotal) * 100, 2) : 0;

            $subtotalIqd += $lineTotal;
            $gmvIqd += $orig * $qty;
            $itemPromoDiscountTotal += $linePromo;
            $totalCogsIqd += $totalCost;

            if ($disc && $orig > $disc) {
                $discountTotalIqd += ($orig - $disc) * $qty;
            }

            $orderItemsData[] = [
                'productId' => $prod->id,
                'quantity' => $qty,
                'unitOriginalPriceIqd' => $orig,
                'unitPriceIqd' => $unit,
                'unitCostPriceIqd' => $unitCost,
                'totalIqd' => $lineTotal,
                'totalCostIqd' => $totalCost,
                'linePromoDiscountIqd' => $linePromo,
                'lineGrossProfitIqd' => $lineProfit,
                'lineMarginPercentage' => $lineMargin,
                'productSnapshot' => json_encode([
                    'titleEn' => $prod->title_en,
                    'titleCkb' => $prod->title_ckb,
                    'titleAr' => $prod->title_ar,
                    'unitText' => $prod->unit_text,
                    'imageUrl' => $prod->image_url,
                ]),
            ];
        }

        // Strict Minimum Basket Enforcement (IQD 7000)
        $minBasket = 7000;
        if ($subtotalIqd < $minBasket) {
            throw ValidationException::withMessages([
                'subtotal' => "Order subtotal (IQD {$subtotalIqd}) does not meet the minimum requirement of IQD {$minBasket}."
            ]);
        }

        // Coupon Handling
        $couponCode = isset($data['couponCode']) ? trim($data['couponCode']) : null;
        $couponDiscountIqd = 0;
        $appliedCoupon = null;
        if ($couponCode) {
            $appliedCoupon = $this->couponService->validateCoupon($couponCode, $items, $phone, $warehouseId);
            $couponDiscountIqd = $appliedCoupon['couponDiscountIqd'];
        }

        $deliveryFeeIqd = 0; // Free promotional delivery
        $riderTipIqd = (int)($data['riderTipIqd'] ?? $data['rider_tip_iqd'] ?? 0);
        $totalIqd = max(0, $subtotalIqd - $couponDiscountIqd + $deliveryFeeIqd + $riderTipIqd);
        $orderNumber = 'BM-' . rand(10000, 99999);
        $orderId = 'ord-' . bin2hex(random_bytes(10));

        $grossProfitBeforeCoupon = $subtotalIqd - $totalCogsIqd;
        $driverPayout = 1000 + $riderTipIqd;
        $netProfitIqd = $subtotalIqd - $totalCogsIqd - $couponDiscountIqd + $deliveryFeeIqd - 1000;
        $marginPct = $subtotalIqd > 0 ? round(($netProfitIqd / $subtotalIqd) * 100, 2) : 0;

        // 3. Database Transaction with Pessimistic Locking
        $order = DB::transaction(function () use (
            $orderId, $orderNumber, $idempotencyKey, $phone, $data, $address, $warehouseId,
            $gmvIqd, $itemPromoDiscountTotal, $subtotalIqd, $totalCogsIqd, $grossProfitBeforeCoupon,
            $discountTotalIqd, $couponCode, $couponDiscountIqd, $deliveryFeeIqd, $driverPayout,
            $totalIqd, $riderTipIqd, $netProfitIqd, $marginPct, $orderItemsData, $appliedCoupon
        ) {
            // Step A: Stock Deduction with Row-Level Locking
            foreach ($orderItemsData as $item) {
                $stock = WarehouseStock::where('warehouse_id', $warehouseId)
                    ->where('product_id', $item['productId'])
                    ->lockForUpdate()
                    ->first();

                if (!$stock || $stock->stock_quantity < $item['quantity']) {
                    $avail = $stock ? $stock->stock_quantity : 0;
                    throw ValidationException::withMessages([
                        'stock' => "Product {$item['productId']} has insufficient stock (available: {$avail}, requested: {$item['quantity']})."
                    ]);
                }

                $before = $stock->stock_quantity;
                $after = $before - $item['quantity'];

                $stock->stock_quantity = $after;
                $stock->save();

                StockMovement::create([
                    'warehouse_id' => $warehouseId,
                    'product_id' => $item['productId'],
                    'order_id' => $orderId,
                    'movement_type' => 'ORDER_DEDUCTION',
                    'quantity_before' => $before,
                    'quantity_change' => -$item['quantity'],
                    'quantity_after' => $after,
                    'reference_note' => "Order #{$orderNumber} stock deduction",
                ]);

                // Step A.2: FEFO Batch Allocation (First-Expired, First-Out)
                $batches = \App\Models\InventoryBatch::where('warehouse_id', $warehouseId)
                    ->where('product_id', $item['productId'])
                    ->whereIn('status', ['ACTIVE', 'NEAR_EXPIRY_PROMO'])
                    ->where('remaining_quantity', '>', 0)
                    ->where('expiry_date', '>=', now()->toDateString())
                    ->orderBy('expiry_date', 'asc')
                    ->lockForUpdate()
                    ->get();

                $neededQty = $item['quantity'];
                foreach ($batches as $batch) {
                    if ($neededQty <= 0) break;
                    $deduct = min($batch->remaining_quantity, $neededQty);
                    $batch->remaining_quantity -= $deduct;
                    if ($batch->remaining_quantity === 0) {
                        $batch->status = 'DEPLETED';
                    }
                    $batch->save();
                    $neededQty -= $deduct;
                }
            }

            // Step B: Upsert Customer
            $customer = Customer::firstOrCreate(
                ['phone' => $phone],
                [
                    'id' => 'cust-' . substr(md5($phone), 0, 12),
                    'name' => $data['customerName'] ?? 'Ako Muhamad',
                    'preferred_language' => 'en',
                ]
            );

            // Step B.2: Wallet Deduction & Payment Method Calculation
            $useWallet = (bool)($data['useWallet'] ?? $data['use_wallet'] ?? false);
            $walletAmountUsed = 0;
            $netCodPayable = $totalIqd;
            $paymentMethod = $data['paymentMethod'] ?? 'COD';
            $paymentStatus = 'PENDING';

            if ($useWallet && $customer->wallet_balance_iqd > 0) {
                $walletAmountUsed = min((int)$customer->wallet_balance_iqd, $totalIqd);
                $netCodPayable = $totalIqd - $walletAmountUsed;
                if ($walletAmountUsed >= $totalIqd) {
                    $paymentMethod = 'WALLET';
                    $paymentStatus = 'PAID';
                }
            }

            $unavailablePref = $data['unavailableItemPreference'] ?? $data['unavailable_item_preference'] ?? 'REPLACE_WITH_BEST_MATCH';
            $dropoffOptions = $data['deliveryDropoffOptions'] ?? $data['delivery_dropoff_options'] ?? null;

            // Step C.1: Calculate 3% Sales Commission & 97% Supermarket Share
            $posShelfSubtotal = $subtotalIqd;
            $commissionRate = 3.00;
            $bazmartCommission = (int)round($posShelfSubtotal * 0.03);
            $supermarketPayable = $posShelfSubtotal - $bazmartCommission;
            $bazmartNetProfit = $bazmartCommission + $deliveryFeeIqd - $couponDiscountIqd - $driverPayout;

            // Step C.1.1: 250 IQD Cash on Delivery Banknote Rounding & Instant Wallet Change
            $physicalCashCollectible = $netCodPayable;
            $walletChangeCredit = 0;
            $walletChangeRef = null;

            if ($paymentMethod === 'COD' && $netCodPayable > 0) {
                if ($netCodPayable % 250 !== 0) {
                    $physicalCashCollectible = (int)(ceil($netCodPayable / 250.0) * 250);
                    $walletChangeCredit = $physicalCashCollectible - $netCodPayable;
                    $walletChangeRef = '#WLT-CHANGE-' . rand(10000, 99999);
                }
            }

            // Step C.1.2: Order Weight Calculation & Heavy-Load Vehicle Routing (> 18.0 kg)
            $totalWeightKg = round(array_sum(array_map(function ($it) use ($products) {
                $p = $products[$it['productId']] ?? null;
                $g = $p ? ($p->unit_weight_grams ?: 500) : 500;
                return ($g * $it['quantity']) / 1000.0;
            }, $orderItemsData)), 2);

            $requiredVehicleType = $totalWeightKg >= 18.0 ? 'REFRIGERATED_VAN' : 'MOTORCYCLE';
            $assignedDriverName = $requiredVehicleType === 'REFRIGERATED_VAN' ? 'Rawand Bakr (Refrigerated Van)' : 'Karwan Ahmed';

            // Step C.1.3: Cold-Chain 3-Zone Bag Segregation (Frozen, Chilled, Ambient)
            $frozenCount = 0;
            $chilledCount = 0;
            $ambientCount = 0;

            foreach ($orderItemsData as $it) {
                $p = $products[$it['productId']] ?? null;
                $zone = $p ? $p->cold_chain_zone : 'AMBIENT';
                if ($zone === 'FROZEN') {
                    $frozenCount += $it['quantity'];
                } elseif ($zone === 'CHILLED') {
                    $chilledCount += $it['quantity'];
                } else {
                    $ambientCount += $it['quantity'];
                }
            }

            $frozenBags = $frozenCount > 0 ? (int)ceil($frozenCount / 5.0) : 0;
            $chilledBags = $chilledCount > 0 ? (int)ceil($chilledCount / 5.0) : 0;
            $ambientBags = $ambientCount > 0 ? (int)ceil($ambientCount / 6.0) : 0;

            // Step C: Create Order
            $order = Order::create([
                'id' => $orderId,
                'order_number' => $orderNumber,
                'idempotency_key' => $idempotencyKey ? trim($idempotencyKey) : null,
                'customer_id' => $customer->id,
                'customer_phone' => $phone,
                'warehouse_id' => $warehouseId,
                'address_snapshot' => json_encode($address),
                'gross_merchandise_value_iqd' => $gmvIqd,
                'item_promo_discount_total_iqd' => $itemPromoDiscountTotal,
                'subtotal_iqd' => $subtotalIqd,
                'pos_shelf_subtotal_iqd' => $posShelfSubtotal,
                'commission_rate_percent' => $commissionRate,
                'bazmart_commission_iqd' => $bazmartCommission,
                'supermarket_payable_iqd' => $supermarketPayable,
                'bazmart_net_profit_iqd' => $bazmartNetProfit,
                'total_cogs_iqd' => $totalCogsIqd,
                'gross_profit_before_coupon_iqd' => $grossProfitBeforeCoupon,
                'discount_total_iqd' => $discountTotalIqd,
                'delivery_fee_iqd' => $deliveryFeeIqd,
                'driver_delivery_payout_iqd' => $driverPayout,
                'coupon_code' => $couponCode,
                'coupon_discount_iqd' => $couponDiscountIqd,
                'total_iqd' => $totalIqd,
                'rider_tip_iqd' => $riderTipIqd,
                'unavailable_item_preference' => $unavailablePref,
                'delivery_dropoff_options' => $dropoffOptions,
                'wallet_amount_used_iqd' => $walletAmountUsed,
                'net_cod_payable_iqd' => $netCodPayable,
                'physical_cash_collectible_iqd' => $physicalCashCollectible,
                'wallet_small_change_credit_iqd' => $walletChangeCredit,
                'wallet_change_credit_ref' => $walletChangeRef,
                'total_weight_kg' => $totalWeightKg,
                'required_vehicle_type' => $requiredVehicleType,
                'frozen_bags_count' => $frozenBags,
                'chilled_bags_count' => $chilledBags,
                'ambient_bags_count' => $ambientBags,
                'net_profit_iqd' => $netProfitIqd,
                'profit_margin_percentage' => $marginPct,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'order_status' => 'PLACED',
                'assigned_driver_name' => $assignedDriverName,
                'assigned_driver_phone' => '+964 750 491 8822',
                'estimated_delivery_minutes' => '15 - 20 mins',
                'placed_at' => now(),
            ]);

            // Step C.2: Deduct from customer wallet if used (Order is now persisted)
            if ($walletAmountUsed > 0) {
                app(\App\Services\WalletService::class)->debitWallet(
                    $customer,
                    $walletAmountUsed,
                    'CHECKOUT_PAYMENT_DEDUCTION',
                    $order->id,
                    "Payment deduction for Order #{$orderNumber}",
                    "پارەدانی وۆڵێت بۆ داواکاری ژمارە #{$orderNumber}",
                    "خصم المحفظة للطلب #{$orderNumber}"
                );
            }

            // Step D: Insert Order Items
            foreach ($orderItemsData as $item) {
                $lineCommission = (int)round($item['totalIqd'] * 0.03);
                $lineSupermarketPayable = $item['totalIqd'] - $lineCommission;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'unit_original_price_iqd' => $item['unitOriginalPriceIqd'],
                    'unit_price_iqd' => $item['unitPriceIqd'],
                    'pos_shelf_unit_price_iqd' => $item['unitPriceIqd'],
                    'unit_cost_price_iqd' => $item['unitCostPriceIqd'],
                    'total_iqd' => $item['totalIqd'],
                    'line_commission_iqd' => $lineCommission,
                    'line_supermarket_payable_iqd' => $lineSupermarketPayable,
                    'total_cost_iqd' => $item['totalCostIqd'],
                    'line_promo_discount_iqd' => $item['linePromoDiscountIqd'],
                    'line_gross_profit_iqd' => $item['lineGrossProfitIqd'],
                    'line_margin_percentage' => $item['lineMarginPercentage'],
                    'product_snapshot' => $item['productSnapshot'],
                ]);
            }

            // Step E: Create Financial Ledger Entries for this Order
            // 1. Revenue
            \App\Models\FinancialLedgerEntry::create([
                'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                'warehouse_id' => $warehouseId,
                'order_id' => $order->id,
                'product_id' => null,
                'entry_type' => 'ORDER_REVENUE',
                'direction' => 'CREDIT',
                'amount_iqd' => $subtotalIqd,
                'description' => "Order #{$orderNumber} Net Basket Revenue",
                'recorded_at' => now(),
            ]);

            // 2. COGS
            \App\Models\FinancialLedgerEntry::create([
                'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                'warehouse_id' => $warehouseId,
                'order_id' => $order->id,
                'product_id' => null,
                'entry_type' => 'ORDER_COGS',
                'direction' => 'DEBIT',
                'amount_iqd' => $totalCogsIqd,
                'description' => "Order #{$orderNumber} Cost of Goods Sold",
                'recorded_at' => now(),
            ]);

            // 3. Item Promo Burn if any
            if ($itemPromoDiscountTotal > 0) {
                \App\Models\FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                    'warehouse_id' => $warehouseId,
                    'order_id' => $order->id,
                    'product_id' => null,
                    'entry_type' => 'PROMO_DISCOUNT_BURN',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $itemPromoDiscountTotal,
                    'description' => "Order #{$orderNumber} Item Save % Discount Burn",
                    'recorded_at' => now(),
                ]);
            }

            // 4. Coupon Subsidy Burn if any
            if ($couponDiscountIqd > 0) {
                \App\Models\FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                    'warehouse_id' => $warehouseId,
                    'order_id' => $order->id,
                    'product_id' => null,
                    'entry_type' => 'COUPON_SUBSIDY_BURN',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $couponDiscountIqd,
                    'description' => "Order #{$orderNumber} Promo Code Subsidy ({$couponCode})",
                    'recorded_at' => now(),
                ]);
            }

            // 5. Driver Payout Cost
            \App\Models\FinancialLedgerEntry::create([
                'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                'warehouse_id' => $warehouseId,
                'order_id' => $order->id,
                'product_id' => null,
                'entry_type' => 'DRIVER_PAYOUT_COST',
                'direction' => 'DEBIT',
                'amount_iqd' => $driverPayout,
                'description' => "Order #{$orderNumber} Dark Store Rider Delivery Payout",
                'recorded_at' => now(),
            ]);

            // Step E: Coupon Redemption
            if ($appliedCoupon) {
                Coupon::where('id', $appliedCoupon['couponId'])->increment('current_usage_count');
                CouponRedemption::create([
                    'coupon_id' => $appliedCoupon['couponId'],
                    'order_id' => $order->id,
                    'customer_phone' => $phone,
                    'discount_applied_iqd' => $couponDiscountIqd,
                    'redeemed_at' => now(),
                ]);
            }

            // Step F: Create initial notification
            Notification::create([
                'customer_id' => $customer->id,
                'customer_phone' => $phone,
                'order_id' => $order->id,
                'type' => 'ORDER_UPDATE',
                'title_en' => "Order #{$orderNumber} Placed",
                'title_ckb' => "داواکاری #{$orderNumber} تۆمارکرا",
                'title_ar' => "تم استلام الطلب #{$orderNumber}",
                'body_en' => 'Your BazMart order is being packed at the dark store.',
                'body_ckb' => 'داواکارییەکەت لە کۆگای ناوەندی ئامادە دەکرێت.',
                'body_ar' => 'يتم تجهيز طلبك في المتجر المظلم حالياً.',
                'is_read' => false,
            ]);

            return $order;
        });

        $order->load(['items.product', 'driver', 'warehouse']);

        return [
            'order' => $order,
            'payment' => [
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'gatewayUrl' => null,
            ],
            'isIdempotentReplay' => false,
        ];
    }
}
