<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\FinancialLedgerEntry;
use App\Models\Driver;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class FinancialAccountingService
{
    private function getPeriodDateRange(string $period): ?Carbon
    {
        return match ($period) {
            'today' => Carbon::today(),
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            default => null,
        };
    }

    public function getFinancialSummary(?string $warehouseId = null, string $period = '7days'): array
    {
        $startDate = $this->getPeriodDateRange($period);
        $query = Order::query();

        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        $orders = $query->get();
        $deliveredOrders = $orders->where('order_status', 'DELIVERED');

        $gmv = (int)$orders->sum('gross_merchandise_value_iqd');
        $netBasket = (int)$orders->sum('subtotal_iqd');
        $totalCogs = (int)$orders->sum('total_cogs_iqd');
        $itemPromoBurn = (int)$orders->sum('item_promo_discount_total_iqd');
        $couponBurn = (int)$orders->sum('coupon_discount_iqd');
        $deliveryFee = (int)$orders->sum('delivery_fee_iqd');
        $driverPayout = (int)$orders->sum('driver_delivery_payout_iqd');

        $grossProfit = $netBasket - $totalCogs;
        $grossMarginPct = $netBasket > 0 ? round(($grossProfit / $netBasket) * 100, 2) : 0;

        // Partner Supermarket 100% Shelf-Price & Fixed 3% Commission Accounting
        $totalShelfSales = $netBasket;
        $bazmartCommission3Pct = (int)round($totalShelfSales * 0.03);
        $supermarketPayable97Pct = $totalShelfSales - $bazmartCommission3Pct; // Exact 97% identity: sales - payable === commission
        $bazmartNetOperating = $bazmartCommission3Pct + $deliveryFee - $couponBurn - $driverPayout;

        $netFleetCost = max(0, $driverPayout - $deliveryFee);
        $totalDeductions = $couponBurn + $netFleetCost;
        $netOperatingProfit = $grossProfit - $totalDeductions;
        $netMarginPct = $netBasket > 0 ? round(($netOperatingProfit / $netBasket) * 100, 2) : 0;

        // Cash flow reconciliation
        $codCollected = (int)$deliveredOrders->where('payment_method', 'COD')->sum('total_iqd');
        $activeDriversCash = (int)Driver::sum('cash_in_hand_iqd');

        return [
            'totalShelfSalesIqd' => $totalShelfSales,
            'supermarketPayable97PctIqd' => $supermarketPayable97Pct,
            'bazmartCommission3PctIqd' => $bazmartCommission3Pct,
            'commissionRatePercent' => 3.00,
            'bazmartNetOperatingProfitIqd' => $bazmartNetOperating,
            'grossMerchandiseValueIqd' => $gmv,
            'netBasketRevenueIqd' => $netBasket,
            'totalCogsIqd' => $totalCogs,
            'itemPromoBurnIqd' => $itemPromoBurn,
            'couponSubsidyBurnIqd' => $couponBurn,
            'deliveryFeeRevenueIqd' => $deliveryFee,
            'driverPayoutCostIqd' => $driverPayout,
            'netFleetCostIqd' => $netFleetCost,
            'totalDeductionsIqd' => $totalDeductions,
            'grossProfitIqd' => $grossProfit,
            'grossMarginPercent' => $grossMarginPct,
            'netOperatingProfitIqd' => $netOperatingProfit,
            'netMarginPercent' => $netMarginPct,
            'codCashCollectedIqd' => $codCollected,
            'codCashPendingInFieldIqd' => $activeDriversCash,
            'completedOrdersCount' => $deliveredOrders->count(),
            'totalOrdersCount' => $orders->count(),
        ];
    }

    public function getDailyReport(?string $warehouseId = null, string $period = '7days'): array
    {
        $startDate = $this->getPeriodDateRange($period) ?: Carbon::now()->subDays(7);
        $query = Order::where('created_at', '>=', $startDate);

        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        $grouped = $orders->groupBy(function ($o) {
            return Carbon::parse($o->created_at)->format('Y-m-d');
        });

        $report = [];
        foreach ($grouped as $date => $dayOrders) {
            $gmv = (int)$dayOrders->sum('gross_merchandise_value_iqd');
            $rev = (int)$dayOrders->sum('subtotal_iqd');
            $cogs = (int)$dayOrders->sum('total_cogs_iqd');
            $itemPromo = (int)$dayOrders->sum('item_promo_discount_total_iqd');
            $coupon = (int)$dayOrders->sum('coupon_discount_iqd');
            $driverCost = (int)$dayOrders->sum('driver_delivery_payout_iqd');
            $deliveryFee = (int)$dayOrders->sum('delivery_fee_iqd');

            $grossProfit = $rev - $cogs;
            $netProfit = $grossProfit - $coupon + $deliveryFee - $driverCost;
            $marginPct = $rev > 0 ? round(($netProfit / $rev) * 100, 2) : 0;

            $dayCommission = (int)round($rev * 0.03);
            $daySupermarketShare = $rev - $dayCommission;

            $report[] = [
                'date' => $date,
                'dayLabel' => Carbon::parse($date)->format('D, M j'),
                'ordersCount' => $dayOrders->count(),
                'grossMerchandiseValueIqd' => $gmv,
                'revenueIqd' => $rev,
                'totalShelfSalesIqd' => $rev,
                'supermarketPayable97PctIqd' => $daySupermarketShare,
                'bazmartCommission3PctIqd' => $dayCommission,
                'cogsIqd' => $cogs,
                'grossProfitIqd' => $grossProfit,
                'promoBurnIqd' => $itemPromo + $coupon,
                'couponBurnIqd' => $coupon,
                'driverCostIqd' => $driverCost,
                'netProfitIqd' => $netProfit,
                'netMarginPercent' => $marginPct,
            ];
        }

        return $report;
    }

    public function getCategoryProfitability(?string $warehouseId = null): array
    {
        $categories = Category::all()->keyBy('id');
        $query = OrderItem::with('product');

        if ($warehouseId && $warehouseId !== 'all') {
            $query->whereHas('order', function ($q) use ($warehouseId) {
                $q->where('warehouse_id', $warehouseId);
            });
        }

        $items = $query->get();

        $catStats = [];
        foreach ($categories as $cat) {
            $catStats[$cat->id] = [
                'categoryId' => $cat->id,
                'categoryName' => $cat->name_en,
                'unitsSold' => 0,
                'revenueIqd' => 0,
                'cogsIqd' => 0,
                'grossProfitIqd' => 0,
                'marginPercent' => 0,
            ];
        }

        foreach ($items as $it) {
            $catId = $it->product ? $it->product->category_id : null;
            if ($catId && isset($catStats[$catId])) {
                $catStats[$catId]['unitsSold'] += $it->quantity;
                $catStats[$catId]['revenueIqd'] += $it->total_iqd;
                $catStats[$catId]['cogsIqd'] += $it->total_cost_iqd;
            }
        }

        // Compute profit and margins
        $result = [];
        foreach ($catStats as $cs) {
            $cs['grossProfitIqd'] = $cs['revenueIqd'] - $cs['cogsIqd'];
            $cs['marginPercent'] = $cs['revenueIqd'] > 0 ? round(($cs['grossProfitIqd'] / $cs['revenueIqd']) * 100, 2) : 0;
            $result[] = $cs;
        }

        // Sort by revenue descending
        usort($result, fn($a, $b) => $b['revenueIqd'] <=> $a['revenueIqd']);

        return $result;
    }

    public function getSkuMargins(?string $search = null, bool $filterLowMargin = false): array
    {
        $query = Product::with('category');

        if ($search) {
            $s = trim($search);
            $query->where(function ($q) use ($s) {
                $q->where('title_en', 'like', "%{$s}%")
                    ->orWhere('external_erp_id', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%");
            });
        }

        $products = $query->get();

        $list = [];
        foreach ($products as $p) {
            $activePrice = $p->discounted_price_iqd ?? $p->original_price_iqd;
            $cost = $p->cost_price_iqd;
            $profit = $activePrice - $cost;
            $marginPct = $activePrice > 0 ? round(($profit / $activePrice) * 100, 2) : 0;
            $isLowMargin = $marginPct < $p->min_margin_percent_threshold;
            $isLossLeader = $profit < 0;

            if ($filterLowMargin && !$isLowMargin) {
                continue;
            }

            $list[] = [
                'id' => $p->id,
                'externalErpId' => $p->external_erp_id,
                'barcode' => $p->barcode,
                'titleEn' => $p->title_en,
                'categoryName' => $p->category ? $p->category->name_en : 'General',
                'costPriceIqd' => $cost,
                'originalPriceIqd' => $p->original_price_iqd,
                'discountedPriceIqd' => $p->discounted_price_iqd,
                'discountPercentage' => $p->discount_percentage,
                'activePriceIqd' => $activePrice,
                'unitProfitIqd' => $profit,
                'marginPercent' => $marginPct,
                'minMarginThreshold' => $p->min_margin_percent_threshold,
                'isLowMargin' => $isLowMargin,
                'isLossLeader' => $isLossLeader,
                'supplierName' => $p->supplier_name,
            ];
        }

        return $list;
    }

    public function recordWastageWriteOff(string $productId, string $warehouseId, int $quantity, string $reason): array
    {
        if ($quantity <= 0) {
            throw ValidationException::withMessages(['quantity' => 'Quantity must be greater than zero.']);
        }

        $product = Product::find($productId);
        if (!$product) {
            throw ValidationException::withMessages(['productId' => "Product \"{$productId}\" not found."]);
        }

        return DB::transaction(function () use ($product, $warehouseId, $quantity, $reason) {
            $stock = WarehouseStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $before = $stock ? $stock->stock_quantity : 0;
            if ($before < $quantity) {
                throw ValidationException::withMessages(['quantity' => "Cannot write off {$quantity} units. Available stock is only {$before}."]);
            }

            $after = $before - $quantity;
            $stock->stock_quantity = $after;
            $stock->save();

            // 1. Audit stock movement
            StockMovement::create([
                'warehouse_id' => $warehouseId,
                'product_id' => $product->id,
                'order_id' => null,
                'movement_type' => 'INVENTORY_WASTAGE_WRITE_OFF',
                'quantity_before' => $before,
                'quantity_change' => -$quantity,
                'quantity_after' => $after,
                'reference_note' => "Wastage Write-Off: {$reason}",
            ]);

            // 2. Financial Ledger debit
            $lossAmount = $product->cost_price_iqd * $quantity;
            $entry = FinancialLedgerEntry::create([
                'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                'warehouse_id' => $warehouseId,
                'order_id' => null,
                'product_id' => $product->id,
                'entry_type' => 'INVENTORY_WASTAGE_WRITE_OFF',
                'direction' => 'DEBIT',
                'amount_iqd' => $lossAmount,
                'description' => "Spoilage Write-off for {$quantity}x {$product->title_en}: {$reason}",
                'recorded_at' => now(),
            ]);

            return [
                'success' => true,
                'productId' => $product->id,
                'productTitle' => $product->title_en,
                'warehouseId' => $warehouseId,
                'quantityWrittenOff' => $quantity,
                'remainingStock' => $after,
                'unitCostPriceIqd' => $product->cost_price_iqd,
                'totalLossAmountIqd' => $lossAmount,
                'ledgerEntryNumber' => $entry->entry_number,
                'reason' => $reason,
            ];
        });
    }

    public function getLedgerEntries(?string $warehouseId = null, int $limit = 50): array
    {
        $query = FinancialLedgerEntry::with(['warehouse', 'product'])->orderBy('recorded_at', 'desc');

        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        return $query->limit($limit)->get()->map(function ($e) {
            $arr = $e->toArray();
            $arr['warehouseName'] = $e->warehouse ? $e->warehouse->name : null;
            $arr['productTitle'] = $e->product ? $e->product->title_en : null;
            return $arr;
        })->toArray();
    }
}

