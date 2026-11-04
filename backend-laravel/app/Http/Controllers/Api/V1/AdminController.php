<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\CampaignBanner;
use App\Models\PaymentConfig;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\AdminAuditLog;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function getAnalyticsOverview(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId');
        $query = Order::query();
        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        $totalOrders = (clone $query)->count();
        $deliveredOrders = (clone $query)->where('order_status', 'DELIVERED')->count();
        $totalRevenueIqd = (clone $query)->where('order_status', 'DELIVERED')->sum('total_iqd');
        $avgBasketIqd = $totalOrders > 0 ? (int)round((clone $query)->avg('total_iqd')) : 0;

        $activeRiders = Driver::where('status', '!=', 'OFFLINE')->count();
        $totalRiders = Driver::count();
        $pendingCodCashInFieldIqd = (int)Driver::sum('cash_in_hand_iqd');

        $statuses = ['PLACED', 'PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
        $ordersByStatus = [];
        foreach ($statuses as $st) {
            $ordersByStatus[$st] = (clone $query)->where('order_status', $st)->count();
        }

        $lowStockQuery = WarehouseStock::with(['product', 'warehouse'])
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        if ($warehouseId && $warehouseId !== 'all') {
            $lowStockQuery->where('warehouse_id', $warehouseId);
        }
        $lowStockRecords = $lowStockQuery->take(10)->get();
        $lowStockAlerts = $lowStockRecords->map(function ($s) {
            return [
                'id' => (string)$s->id,
                'productId' => (string)$s->product_id,
                'productTitle' => $s->product ? ($s->product->title_en ?? $s->product->name_en ?? 'Product') : 'Product',
                'barcode' => $s->product->barcode ?? 'N/A',
                'warehouseName' => $s->warehouse->name ?? 'Dark Store',
                'availableStock' => (int)$s->stock_quantity,
            ];
        })->values();

        $recentOrders = (clone $query)->with(['warehouse', 'driver'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($o) {
                return [
                    'id' => (string)$o->id,
                    'orderNumber' => $o->order_number,
                    'warehouseId' => (string)$o->warehouse_id,
                    'orderStatus' => $o->order_status,
                    'paymentMethod' => $o->payment_method,
                    'totalIqd' => (int)$o->total_iqd,
                    'assignedDriverName' => $o->driver->full_name ?? null,
                    'itemsCount' => $o->items()->count(),
                    'createdAt' => $o->created_at ? $o->created_at->toIso8601String() : now()->toIso8601String(),
                ];
            })->values();

        $topSellingProducts = [];

        return response()->json([
            'success' => true,
            'data' => [
                'gmvTodayIqd' => (int)$totalRevenueIqd,
                'totalOrders' => $totalOrders,
                'avgBasketIqd' => $avgBasketIqd,
                'activeRiders' => $activeRiders,
                'totalRiders' => $totalRiders,
                'ordersPackedUnder3MinsPercent' => 94,
                'avgDeliveryTimeMinutes' => 12,
                'pendingCodCashInFieldIqd' => $pendingCodCashInFieldIqd,
                'lowStockAlertsCount' => $lowStockRecords->count(),
                'lowStockAlerts' => $lowStockAlerts,
                'ordersByStatus' => $ordersByStatus,
                'erpSyncHealth' => [
                    'status' => 'ONLINE',
                    'lastSyncedAt' => now()->toIso8601String(),
                    'syncedSkusCount' => Product::count(),
                ],
                'topSellingProducts' => $topSellingProducts,
                'recentOrders' => $recentOrders,
            ],
        ]);
    }

    public function getOrders(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'driver', 'warehouse'])->orderBy('created_at', 'desc');

        if ($request->filled('status') && strtolower($request->query('status')) !== 'all') {
            $query->where('order_status', strtoupper($request->query('status')));
        }
        if ($request->filled('warehouseId') && strtolower($request->query('warehouseId')) !== 'all') {
            $query->where('warehouse_id', $request->query('warehouseId'));
        }
        if ($request->filled('paymentMethod') && strtolower($request->query('paymentMethod')) !== 'all') {
            $query->where('payment_method', strtoupper($request->query('paymentMethod')));
        }
        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%")
                    ->orWhere('assigned_driver_name', 'like', "%{$s}%");
            });
        }

        $orders = $query->get()->map(function ($o) {
            $o->makeVisible([
                'gross_merchandise_value_iqd', 'item_promo_discount_total_iqd', 'total_cogs_iqd',
                'gross_profit_before_coupon_iqd', 'driver_delivery_payout_iqd', 'net_profit_iqd', 'profit_margin_percentage'
            ]);
            foreach ($o->items as $it) {
                $it->makeVisible(['unit_cost_price_iqd', 'total_cost_iqd', 'line_gross_profit_iqd', 'line_margin_percentage']);
            }
            return $o;
        });

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function getOrderById(string $id): JsonResponse
    {
        $order = Order::with(['items.product', 'driver', 'warehouse', 'rating'])->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->makeVisible([
            'gross_merchandise_value_iqd', 'item_promo_discount_total_iqd', 'total_cogs_iqd',
            'gross_profit_before_coupon_iqd', 'driver_delivery_payout_iqd', 'net_profit_iqd', 'profit_margin_percentage'
        ]);
        foreach ($order->items as $it) {
            $it->makeVisible(['unit_cost_price_iqd', 'total_cost_iqd', 'line_gross_profit_iqd', 'line_margin_percentage']);
        }

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateOrderStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->update(['order_status' => $request->input('status')]);
        return response()->json(['success' => true, 'data' => $order->fresh(['items.product', 'driver'])]);
    }

    public function markOrderPacking(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $packedItemIds = $request->input('packedItemIds', []);
        $isComplete = (bool)$request->input('isComplete', false);

        $order->update([
            'is_packed' => $isComplete,
            'packed_items' => json_encode($packedItemIds),
            'order_status' => $isComplete ? 'READY_FOR_PICKUP' : 'PACKING_IN_DARKSTORE',
        ]);

        return response()->json(['success' => true, 'data' => $order->fresh(['items.product', 'driver'])]);
    }

    public function generateThermalReceipt(string $id): JsonResponse
    {
        $order = Order::with(['items.product', 'warehouse'])->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $receiptLines = [
            "================================",
            "           BAZMART              ",
            "    Dark Store Super Express    ",
            "================================",
            "Order #: " . $order->order_number,
            "Date:    " . $order->created_at->format('Y-m-d H:i:s'),
            "Phone:   " . $order->customer_phone,
            "Branch:  " . ($order->warehouse ? $order->warehouse->name : 'Central'),
            "--------------------------------",
        ];

        foreach ($order->items as $it) {
            $name = $it->product ? $it->product->title_en : 'Product';
            $receiptLines[] = sprintf("%-18s x%-2d %6d", substr($name, 0, 18), $it->quantity, $it->total_iqd);
        }

        $receiptLines[] = "--------------------------------";
        $receiptLines[] = "Subtotal:    IQD " . number_format($order->subtotal_iqd);
        if ($order->coupon_discount_iqd > 0) {
            $receiptLines[] = "Discount:   -IQD " . number_format($order->coupon_discount_iqd);
        }
        $receiptLines[] = "Delivery:    IQD " . number_format($order->delivery_fee_iqd);
        $receiptLines[] = "TOTAL:       IQD " . number_format($order->total_iqd);
        $receiptLines[] = "Payment:     " . $order->payment_method;
        $receiptLines[] = "================================";
        $receiptLines[] = "      Fastest Delivery In IQ    ";
        $receiptLines[] = "================================";

        return response()->json([
            'success' => true,
            'data' => [
                'orderNumber' => $order->order_number,
                'rawText' => implode("\n", $receiptLines),
            ],
        ]);
    }

    public function getCatalog(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'countryOrigin', 'stocks']);

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('title_en', 'like', "%{$s}%")
                    ->orWhere('external_erp_id', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%");
            });
        }
        if ($request->filled('categoryId') && $request->query('categoryId') !== 'all') {
            $query->where('category_id', $request->query('categoryId'));
        }
        if ($request->filled('brandId') && $request->query('brandId') !== 'all') {
            $query->where('brand_id', $request->query('brandId'));
        }

        $products = $query->get()->map(function ($p) {
            $p->makeVisible(['cost_price_iqd', 'min_margin_percent_threshold', 'supplier_name', 'tax_or_customs_iqd']);
            $activePrice = $p->discounted_price_iqd ?? $p->original_price_iqd;
            $profit = $activePrice - $p->cost_price_iqd;
            $margin = $activePrice > 0 ? round(($profit / $activePrice) * 100, 2) : 0;
            $arr = $p->toArray();
            $arr['unitProfitIqd'] = $profit;
            $arr['marginPercent'] = $margin;
            $arr['costPriceIqd'] = $p->cost_price_iqd;
            $arr['cost_price_iqd'] = $p->cost_price_iqd;
            return $arr;
        });

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function updateProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $fields = [
            'title_en' => $request->input('title_en', $request->input('titleEn')),
            'title_ckb' => $request->input('title_ckb', $request->input('titleCkb')),
            'title_ar' => $request->input('title_ar', $request->input('titleAr')),
            'description_en' => $request->input('description_en', $request->input('descriptionEn')),
            'storage_temp' => $request->input('storage_temp', $request->input('storageTemp')),
            'original_price_iqd' => $request->input('original_price_iqd', $request->input('originalPriceIqd')),
            'discounted_price_iqd' => $request->input('discounted_price_iqd', $request->input('discountedPriceIqd')),
            'discount_percentage' => $request->input('discount_percentage', $request->input('discountPercentage')),
            'is_best_seller' => $request->input('is_best_seller', $request->input('isBestSeller')),
            'is_fresh_pick' => $request->input('is_fresh_pick', $request->input('isFreshPick')),
            'is_top_saver' => $request->input('is_top_saver', $request->input('isTopSaver')),
            'cost_price_iqd' => $request->input('cost_price_iqd', $request->input('costPriceIqd')),
            'supplier_name' => $request->input('supplier_name', $request->input('supplierName')),
            'min_margin_percent_threshold' => $request->input('min_margin_percent_threshold', $request->input('minMarginPercentThreshold')),
        ];

        $product->update(array_filter($fields, fn($val) => $val !== null));

        if ($request->has('stockQuantity') || $request->has('stock_quantity')) {
            $newStock = (int)($request->input('stockQuantity') ?? $request->input('stock_quantity'));
            $warehouseId = $request->input('warehouseId', 'erbil-central-darkstore');
            $stock = WarehouseStock::firstOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $warehouseId],
                ['reserved_quantity' => 0]
            );
            $before = $stock->stock_quantity;
            $stock->stock_quantity = $newStock;
            $stock->save();

            if ($before === 0 && $newStock > 0) {
                \App\Services\RestockNotificationService::triggerForProduct($product->id, $warehouseId);
            }
        }

        $product->makeVisible(['cost_price_iqd', 'min_margin_percent_threshold', 'supplier_name', 'tax_or_customs_iqd']);
        return response()->json(['success' => true, 'data' => $product->fresh()]);
    }

    public function updateProductDiscount(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $orig = $product->original_price_iqd;
        $pct = $request->input('discountPercentage');
        $discPrice = $request->input('discountedPriceIqd');

        if ($pct !== null && $pct > 0) {
            $discPrice = (int)round($orig * (1 - $pct / 100));
        } elseif ($discPrice !== null && $discPrice > 0 && $orig > $discPrice) {
            $pct = (int)round((($orig - $discPrice) / $orig) * 100);
        } else {
            $pct = null;
            $discPrice = null;
        }

        $product->update([
            'discounted_price_iqd' => $discPrice,
            'discount_percentage' => $pct,
        ]);

        return response()->json(['success' => true, 'data' => $product->fresh()]);
    }

    public function getCampaigns(): JsonResponse
    {
        $campaigns = CampaignBanner::orderBy('sort_order', 'asc')->get();
        return response()->json(['success' => true, 'data' => $campaigns]);
    }

    public function createCampaign(Request $request): JsonResponse
    {
        $campaign = CampaignBanner::create(array_merge($request->all(), [
            'id' => 'camp-' . bin2hex(random_bytes(6)),
        ]));
        return response()->json(['success' => true, 'data' => $campaign], 201);
    }

    public function updateCampaign(Request $request, string $id): JsonResponse
    {
        $campaign = CampaignBanner::find($id);
        if (!$campaign) {
            return response()->json(['success' => false, 'message' => 'Campaign not found'], 404);
        }
        $campaign->update($request->all());
        return response()->json(['success' => true, 'data' => $campaign]);
    }

    public function deleteCampaign(string $id): JsonResponse
    {
        CampaignBanner::destroy($id);
        return response()->json(['success' => true]);
    }

    public function getWarehouses(): JsonResponse
    {
        $warehouses = Warehouse::with('stocks')->get();
        return response()->json(['success' => true, 'data' => $warehouses]);
    }

    public function updateWarehouse(Request $request, string $id): JsonResponse
    {
        $warehouse = Warehouse::find($id);
        if (!$warehouse) {
            return response()->json(['success' => false, 'message' => 'Warehouse not found'], 404);
        }
        $warehouse->update($request->all());
        return response()->json(['success' => true, 'data' => $warehouse]);
    }

    public function getPaymentSettings(): JsonResponse
    {
        $settings = PaymentConfig::all();
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function updatePaymentSetting(Request $request, string $id): JsonResponse
    {
        $setting = PaymentConfig::find($id);
        if (!$setting) {
            return response()->json(['success' => false, 'message' => 'Payment setting not found'], 404);
        }
        $setting->update($request->only(['is_enabled', 'credentials']));
        return response()->json(['success' => true, 'data' => $setting]);
    }

    public function getCustomers(): JsonResponse
    {
        $customers = Customer::with(['orders' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->get()->map(function ($c) {
            $orders = $c->orders;
            $delivered = $orders->where('order_status', 'DELIVERED');
            $last = $orders->first();
            return [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'preferredLanguage' => $c->preferred_language,
                'totalOrders' => $orders->count(),
                'totalSpentIqd' => (int)$delivered->sum('total_iqd'),
                'lastOrderNumber' => $last ? $last->order_number : null,
                'lastOrderDate' => $last ? $last->created_at : null,
                'createdAt' => $c->created_at,
            ];
        });

        return response()->json(['success' => true, 'data' => $customers]);
    }

    public function substituteOrRemoveOrderItem(Request $request, string $orderId, string $orderItemId): JsonResponse
    {
        $order = Order::with('items')->find($orderId);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $item = OrderItem::where('order_id', $orderId)->where('id', $orderItemId)->first();
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Order item not found'], 404);
        }

        $action = $request->input('action', 'REMOVE_AND_REFUND'); // REMOVE_AND_REFUND | REPLACE_BEST_MATCH
        $actorName = $request->input('actorName', 'Zanyar Soran (Picker)');
        $reason = $request->input('reason', 'Item damaged/out of stock during dark store picking');

        if ($action === 'REMOVE_AND_REFUND') {
            $refundAmount = $item->total_iqd;

            $item->update([
                'is_substituted' => true,
                'substitution_reason' => 'REMOVED_AND_REFUNDED: ' . $reason,
                'original_quantity' => $item->quantity,
                'quantity' => 0,
                'total_iqd' => 0,
            ]);

            // Adjust order subtotal, total, 3% commission and 97% supermarket payable
            $newSubtotal = max(0, $order->subtotal_iqd - $refundAmount);
            $newTotal = max(0, $order->total_iqd - $refundAmount);
            $newCogs = max(0, $order->total_cogs_iqd - ($item->unit_cost_price_iqd * $item->original_quantity));
            $newProfit = max(0, $newSubtotal - $newCogs);
            $newCommission = (int)round($newSubtotal * 0.03);
            $newSupermarketPayable = $newSubtotal - $newCommission;

            $orderUpdate = [
                'subtotal_iqd' => $newSubtotal,
                'total_iqd' => $newTotal,
                'pos_shelf_subtotal_iqd' => $newSubtotal,
                'bazmart_commission_iqd' => $newCommission,
                'supermarket_payable_iqd' => $newSupermarketPayable,
                'total_cogs_iqd' => $newCogs,
                'net_profit_iqd' => $newProfit,
            ];

            if ($order->payment_method === 'CASH_ON_DELIVERY') {
                $orderUpdate['net_cod_payable_iqd'] = max(0, ($order->net_cod_payable_iqd ?: $order->total_iqd) - $refundAmount);
            } else {
                // If paid via wallet or electronic card, credit wallet immediately
                if ($order->customer_id) {
                    $customer = Customer::find($order->customer_id);
                    if ($customer) {
                        app(WalletService::class)->creditWallet(
                            $customer,
                            $refundAmount,
                            'REFUND',
                            $order->id,
                            "Refund for out-of-stock item: {$item->product_snapshot['title_en']}",
                            "Ú¯Û•Ú•Ø§Ù†Ø¯Ù†Û•ÙˆÛ•ÛŒ Ù¾Ø§Ø±Û• Ø¨Û† Ú©Ø§ÚµØ§ÛŒ Ù†Û•Ù…Ø§Ùˆ: {$item->product_snapshot['title_ckb']}",
                            "Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ù…Ø¨Ù„Øº Ø§Ù„ØµÙ†Ù ØºÙŠØ± Ø§Ù„Ù…ØªÙˆÙØ±: {$item->product_snapshot['title_ar']}"
                        );
                    }
                }
            }

            $order->update($orderUpdate);

            AdminAuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'PICKER',
                'action_type' => 'ITEM_REMOVED_REFUNDED',
                'target_reference' => "{$order->order_number} / ITEM-{$item->id}",
                'details' => "Picker removed out-of-stock item. Refund amount IQD {$refundAmount} processed.",
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item removed and refunded successfully',
                'data' => [
                    'order' => $order->fresh(['items']),
                    'refundAmountIqd' => $refundAmount,
                    'action' => 'REMOVE_AND_REFUND',
                ],
            ]);
        }

        if ($action === 'REPLACE_BEST_MATCH') {
            $replacementProductId = $request->input('replacementProductId');
            $replacement = Product::find($replacementProductId);
            if (!$replacement) {
                return response()->json(['success' => false, 'message' => 'Replacement product not found'], 404);
            }

            $oldTitle = $item->product_snapshot['title_en'] ?? 'Original Product';
            $item->update([
                'is_substituted' => true,
                'substituted_product_id' => $replacement->id,
                'substitution_reason' => 'REPLACED_BEST_MATCH: ' . $reason,
                'product_snapshot' => [
                    'id' => $replacement->id,
                    'title_en' => $replacement->title_en,
                    'title_ckb' => $replacement->title_ckb,
                    'title_ar' => $replacement->title_ar,
                    'barcode' => $replacement->barcode,
                ],
            ]);

            AdminAuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'PICKER',
                'action_type' => 'ITEM_SUBSTITUTED_BEST_MATCH',
                'target_reference' => "{$order->order_number} / ITEM-{$item->id}",
                'details' => "Substituted '{$oldTitle}' with '{$replacement->title_en}' ({$replacement->barcode}).",
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item substituted with best match successfully',
                'data' => [
                    'order' => $order->fresh(['items']),
                    'action' => 'REPLACE_BEST_MATCH',
                ],
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid action'], 400);
    }

    public function getAuditLogs(Request $request): JsonResponse
    {
        $limit = (int)$request->query('limit', 50);
        $logs = AdminAuditLog::orderBy('created_at', 'desc')->take($limit)->get();
        return response()->json(['success' => true, 'data' => $logs]);
    }

    public function updateStoreOperatingStatus(Request $request): JsonResponse
    {
        $warehouseId = $request->input('warehouseId');
        $status = $request->input('status', 'NORMAL'); // NORMAL, SURGE, CLOSED

        $wh = Warehouse::find($warehouseId);
        if ($wh) {
            $wh->update(['is_active' => $status !== 'CLOSED']);
        }

        AdminAuditLog::create([
            'actor_name' => $request->input('actorName', 'Zanyar Soran'),
            'actor_role' => 'SUPER_ADMIN',
            'action_type' => 'WAREHOUSE_STATUS_CHANGED',
            'target_reference' => $warehouseId,
            'details' => "Dark store operating status updated to {$status}.",
            'created_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => "Dark store status updated to {$status}"]);
    }
}
