<?php

namespace App\Services;

use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\FinancialLedgerEntry;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class SupplyChainAndBatchService
{
    public function getOverview(?string $warehouseId = null): array
    {
        $batchQuery = InventoryBatch::with(['product', 'warehouse']);
        $poQuery = PurchaseOrder::query();

        if ($warehouseId && $warehouseId !== 'all') {
            $batchQuery->where('warehouse_id', $warehouseId);
            $poQuery->where('warehouse_id', $warehouseId);
        }

        $allBatches = $batchQuery->get();
        $now = Carbon::now()->startOfDay();
        $sevenDays = Carbon::now()->addDays(7)->endOfDay();

        $activeSuppliersCount = Supplier::where('is_active', true)->count();
        $openPurchaseOrdersCount = (clone $poQuery)->whereIn('status', ['DRAFT', 'SENT_TO_SUPPLIER'])->count();

        $totalInventoryValueCostIqd = 0;
        $nearExpiryBatchesCount = 0;
        $quarantinedValueIqd = 0;

        foreach ($allBatches as $b) {
            $value = $b->remaining_quantity * $b->unit_cost_iqd;
            if ($b->status === 'EXPIRED_QUARANTINED') {
                $quarantinedValueIqd += $value;
            } elseif ($b->status !== 'DEPLETED') {
                $totalInventoryValueCostIqd += $value;

                $exp = Carbon::parse($b->expiry_date)->startOfDay();
                if ($exp->gte($now) && $exp->lte($sevenDays)) {
                    $nearExpiryBatchesCount++;
                }
            }
        }

        return [
            'activeSuppliersCount' => $activeSuppliersCount,
            'openPurchaseOrdersCount' => $openPurchaseOrdersCount,
            'totalInventoryValueCostIqd' => $totalInventoryValueCostIqd,
            'nearExpiryBatchesCount' => $nearExpiryBatchesCount,
            'quarantinedValueIqd' => $quarantinedValueIqd,
        ];
    }

    public function getBatches(array $filters = []): array
    {
        $query = InventoryBatch::with(['product.category', 'warehouse', 'purchaseOrder']);

        if (!empty($filters['warehouseId']) && $filters['warehouseId'] !== 'all') {
            $query->where('warehouse_id', $filters['warehouseId']);
        }

        $urgency = $filters['urgency'] ?? 'all';
        $now = Carbon::now()->startOfDay();
        $sevenDays = Carbon::now()->addDays(7)->endOfDay();

        if ($urgency === 'near_expiry') {
            $query->whereIn('status', ['ACTIVE', 'NEAR_EXPIRY_PROMO'])
                  ->where('remaining_quantity', '>', 0)
                  ->where('expiry_date', '>=', $now->toDateString())
                  ->where('expiry_date', '<=', $sevenDays->toDateString());
        } elseif ($urgency === 'expired') {
            $query->where(function ($q) use ($now) {
                $q->where('status', 'EXPIRED_QUARANTINED')
                  ->orWhere(function ($q2) use ($now) {
                      $q2->where('remaining_quantity', '>', 0)
                         ->where('expiry_date', '<', $now->toDateString());
                  });
            });
        } elseif ($urgency === 'healthy') {
            $query->whereIn('status', ['ACTIVE', 'NEAR_EXPIRY_PROMO'])
                  ->where('remaining_quantity', '>', 0)
                  ->where('expiry_date', '>', $sevenDays->toDateString());
        }

        if (!empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('batch_number', 'like', "%{$s}%")
                  ->orWhereHas('product', function ($qp) use ($s) {
                      $qp->where('title_en', 'like', "%{$s}%")
                         ->orWhere('external_erp_id', 'like', "%{$s}%")
                         ->orWhere('barcode', 'like', "%{$s}%");
                  });
            });
        }

        $batches = $query->orderBy('expiry_date', 'asc')->get();

        return $batches->map(function ($b) use ($now) {
            $exp = Carbon::parse($b->expiry_date)->startOfDay();
            $daysLeft = (int)$now->diffInDays($exp, false);

            $urgencyStatus = 'HEALTHY';
            if ($b->status === 'EXPIRED_QUARANTINED' || $daysLeft < 0) {
                $urgencyStatus = 'EXPIRED';
            } elseif ($daysLeft <= 7) {
                $urgencyStatus = 'NEAR_EXPIRY';
            }

            return [
                'id' => $b->id,
                'batchNumber' => $b->batch_number,
                'warehouseId' => $b->warehouse_id,
                'warehouseName' => $b->warehouse ? $b->warehouse->name : 'Central',
                'productId' => $b->product_id,
                'productSku' => $b->product ? $b->product->external_erp_id : 'SKU',
                'productTitle' => $b->product ? $b->product->title_en : 'Product',
                'productBarcode' => $b->product ? $b->product->barcode : '',
                'categoryName' => $b->product && $b->product->category ? $b->product->category->name_en : 'General',
                'initialQuantity' => $b->initial_quantity,
                'remainingQuantity' => $b->remaining_quantity,
                'unitCostIqd' => $b->unit_cost_iqd,
                'totalBatchCostIqd' => $b->remaining_quantity * $b->unit_cost_iqd,
                'productionDate' => $b->production_date ? Carbon::parse($b->production_date)->format('Y-m-d') : null,
                'expiryDate' => Carbon::parse($b->expiry_date)->format('Y-m-d'),
                'daysRemaining' => $daysLeft,
                'status' => $b->status,
                'urgency' => $urgencyStatus,
                'productDiscountPercentage' => $b->product ? $b->product->discount_percentage : null,
            ];
        })->toArray();
    }

    public function getPurchaseOrders(?string $warehouseId = null): array
    {
        $query = PurchaseOrder::with(['supplier', 'warehouse', 'items.product'])->orderBy('created_at', 'desc');

        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        return $query->get()->map(function ($po) {
            return [
                'id' => $po->id,
                'poNumber' => $po->po_number,
                'supplierId' => $po->supplier_id,
                'supplierName' => $po->supplier ? $po->supplier->name : 'Supplier',
                'supplierCity' => $po->supplier ? $po->supplier->city : '',
                'warehouseId' => $po->warehouse_id,
                'warehouseName' => $po->warehouse ? $po->warehouse->name : 'Warehouse',
                'status' => $po->status,
                'totalCostIqd' => (int)$po->total_cost_iqd,
                'expectedDeliveryDate' => Carbon::parse($po->expected_delivery_date)->format('Y-m-d'),
                'receivedAt' => $po->received_at ? Carbon::parse($po->received_at)->toIso8601String() : null,
                'notes' => $po->notes,
                'itemsCount' => $po->items->count(),
                'items' => $po->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'productId' => $it->product_id,
                        'productTitle' => $it->product ? $it->product->title_en : 'Product',
                        'productSku' => $it->product ? $it->product->external_erp_id : '',
                        'orderedQuantity' => $it->ordered_quantity,
                        'receivedQuantity' => $it->received_quantity,
                        'unitCostIqd' => $it->unit_cost_iqd,
                        'lineTotalCostIqd' => $it->line_total_cost_iqd,
                        'batchNumber' => $it->batch_number,
                        'expiryDate' => $it->expiry_date ? Carbon::parse($it->expiry_date)->format('Y-m-d') : null,
                    ];
                }),
            ];
        })->toArray();
    }

    public function getSuppliers(): array
    {
        return Supplier::withCount('purchaseOrders')
            ->orderBy('total_purchased_iqd', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'contactPerson' => $s->contact_person,
                    'phone' => $s->phone,
                    'email' => $s->email,
                    'city' => $s->city,
                    'countryCode' => $s->country_code,
                    'leadTimeDays' => $s->lead_time_days,
                    'paymentTerms' => $s->payment_terms,
                    'totalPurchasedIqd' => (int)$s->total_purchased_iqd,
                    'isActive' => (bool)$s->is_active,
                    'purchaseOrdersCount' => $s->purchase_orders_count,
                ];
            })
            ->toArray();
    }

    public function createPurchaseOrder(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $supplier = Supplier::findOrFail($data['supplierId']);
            $warehouse = Warehouse::findOrFail($data['warehouseId']);

            $poNumber = '#PO-' . rand(20000, 99999);
            $poId = 'po-' . substr(md5(uniqid()), 0, 10);

            $totalCost = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['productId']);
                $qty = (int)$item['orderedQuantity'];
                $unitCost = (int)($item['unitCostIqd'] ?? $product->cost_price_iqd);
                $lineTotal = $qty * $unitCost;
                $totalCost += $lineTotal;

                $batchNum = $item['batchNumber'] ?? 'LOT-' . strtoupper(substr($supplier->id, 4, 4)) . '-' . date('md');
                $prodDate = $item['productionDate'] ?? Carbon::now()->subDays(5)->toDateString();
                $expDate = $item['expiryDate'] ?? Carbon::now()->addDays(120)->toDateString();

                $itemsData[] = [
                    'product_id' => $product->id,
                    'ordered_quantity' => $qty,
                    'received_quantity' => 0,
                    'unit_cost_iqd' => $unitCost,
                    'line_total_cost_iqd' => $lineTotal,
                    'batch_number' => $batchNum,
                    'production_date' => $prodDate,
                    'expiry_date' => $expDate,
                ];
            }

            $po = PurchaseOrder::create([
                'id' => $poId,
                'po_number' => $poNumber,
                'supplier_id' => $supplier->id,
                'warehouse_id' => $warehouse->id,
                'status' => 'SENT_TO_SUPPLIER',
                'total_cost_iqd' => $totalCost,
                'expected_delivery_date' => $data['expectedDeliveryDate'] ?? Carbon::now()->addDays($supplier->lead_time_days)->toDateString(),
                'notes' => $data['notes'] ?? 'Replenishment Order via Dark Store Procurement Engine',
            ]);

            foreach ($itemsData as $it) {
                $it['purchase_order_id'] = $po->id;
                PurchaseOrderItem::create($it);
            }

            return [
                'success' => true,
                'purchaseOrder' => $po->fresh('items'),
            ];
        });
    }

    public function receivePurchaseOrder(string $poId): array
    {
        return DB::transaction(function () use ($poId) {
            $po = PurchaseOrder::with(['items.product', 'supplier', 'warehouse'])->findOrFail($poId);

            if ($po->status === 'RECEIVED_INTO_STOCK') {
                throw ValidationException::withMessages(['status' => 'This purchase order has already been received into stock.']);
            }

            $now = Carbon::now();

            foreach ($po->items as $item) {
                $receivedQty = $item->ordered_quantity;
                $item->update(['received_quantity' => $receivedQty]);

                // 1. Create active inventory batch
                $batch = InventoryBatch::create([
                    'batch_number' => $item->batch_number ?: ('LOT-' . strtoupper(substr(uniqid(), -6))),
                    'warehouse_id' => $po->warehouse_id,
                    'product_id' => $item->product_id,
                    'purchase_order_id' => $po->id,
                    'initial_quantity' => $receivedQty,
                    'remaining_quantity' => $receivedQty,
                    'unit_cost_iqd' => $item->unit_cost_iqd,
                    'production_date' => $item->production_date ?: $now->copy()->subDays(3)->toDateString(),
                    'expiry_date' => $item->expiry_date ?: $now->copy()->addDays(90)->toDateString(),
                    'status' => 'ACTIVE',
                ]);

                // 2. Increment dark store stock
                $stock = WarehouseStock::firstOrCreate(
                    ['warehouse_id' => $po->warehouse_id, 'product_id' => $item->product_id],
                    ['stock_quantity' => 0, 'reserved_quantity' => 0, 'low_stock_threshold' => 15]
                );

                $before = $stock->stock_quantity;
                $after = $before + $receivedQty;
                $stock->stock_quantity = $after;
                $stock->save();

                if ($before === 0 && $after > 0) {
                    \App\Services\RestockNotificationService::triggerForProduct($item->product_id, $po->warehouse_id);
                }

                // 3. Update product cost price if new landed cost differs
                if ($item->product && $item->unit_cost_iqd > 0) {
                    $item->product->update(['cost_price_iqd' => $item->unit_cost_iqd]);
                }

                // 4. Log stock movement
                StockMovement::create([
                    'warehouse_id' => $po->warehouse_id,
                    'product_id' => $item->product_id,
                    'order_id' => null,
                    'movement_type' => 'ERP_PO_RECEIVED',
                    'quantity_before' => $before,
                    'quantity_change' => $receivedQty,
                    'quantity_after' => $after,
                    'reference_note' => "Inbound Receiving for {$po->po_number} (Batch {$batch->batch_number})",
                ]);
            }

            // 5. Create financial ledger entry for inventory purchase
            FinancialLedgerEntry::create([
                'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                'warehouse_id' => $po->warehouse_id,
                'order_id' => null,
                'product_id' => null,
                'entry_type' => 'PO_INVENTORY_PURCHASE',
                'direction' => 'DEBIT',
                'amount_iqd' => $po->total_cost_iqd,
                'description' => "Inbound Inventory Purchase for {$po->po_number} from {$po->supplier->name}",
                'recorded_at' => $now,
            ]);

            // 6. Update supplier total volume
            if ($po->supplier) {
                $po->supplier->increment('total_purchased_iqd', $po->total_cost_iqd);
            }

            // 7. Update PO status
            $po->update([
                'status' => 'RECEIVED_INTO_STOCK',
                'received_at' => $now,
            ]);

            return [
                'success' => true,
                'poNumber' => $po->po_number,
                'status' => 'RECEIVED_INTO_STOCK',
                'receivedAt' => $now->toIso8601String(),
                'totalCostIqd' => $po->total_cost_iqd,
                'itemsCount' => $po->items->count(),
            ];
        });
    }

    public function applyClearanceDiscount(int $batchId): array
    {
        $batch = InventoryBatch::with('product')->findOrFail($batchId);
        $product = $batch->product;

        if (!$product) {
            throw ValidationException::withMessages(['batch' => 'Associated product not found.']);
        }

        // Apply 25% flash clearance discount
        $newDiscount = 25;
        $discountedPrice = (int)round($product->original_price_iqd * 0.75);

        $product->update([
            'discount_percentage' => $newDiscount,
            'discounted_price_iqd' => $discountedPrice,
            'is_top_saver' => true,
        ]);

        $batch->update(['status' => 'NEAR_EXPIRY_PROMO']);

        return [
            'success' => true,
            'batchId' => $batch->id,
            'batchNumber' => $batch->batch_number,
            'productId' => $product->id,
            'productTitle' => $product->title_en,
            'originalPriceIqd' => $product->original_price_iqd,
            'newDiscountedPriceIqd' => $discountedPrice,
            'discountPercentage' => $newDiscount,
            'batchStatus' => 'NEAR_EXPIRY_PROMO',
        ];
    }

    public function quarantineAndWriteOff(int $batchId, string $reason = 'Expired batch quarantine and spoilage write-off'): array
    {
        return DB::transaction(function () use ($batchId, $reason) {
            $batch = InventoryBatch::with(['product', 'warehouse'])->findOrFail($batchId);

            if ($batch->status === 'EXPIRED_QUARANTINED') {
                return [
                    'success' => true,
                    'message' => 'Batch was already quarantined.',
                    'batchId' => $batch->id,
                    'status' => 'EXPIRED_QUARANTINED',
                    'newStatus' => 'EXPIRED_QUARANTINED',
                ];
            }

            $qtyToWriteOff = $batch->remaining_quantity;
            $unitCost = $batch->unit_cost_iqd;
            $totalLoss = $qtyToWriteOff * $unitCost;

            // Deduct remaining quantity from warehouse stock
            $stock = WarehouseStock::where('warehouse_id', $batch->warehouse_id)
                ->where('product_id', $batch->product_id)
                ->lockForUpdate()
                ->first();

            $before = $stock ? $stock->stock_quantity : 0;
            $after = max(0, $before - $qtyToWriteOff);

            if ($stock) {
                $stock->stock_quantity = $after;
                $stock->save();
            }

            // Log stock movement
            if ($qtyToWriteOff > 0) {
                StockMovement::create([
                    'warehouse_id' => $batch->warehouse_id,
                    'product_id' => $batch->product_id,
                    'order_id' => null,
                    'movement_type' => 'INVENTORY_WASTAGE_WRITE_OFF',
                    'quantity_before' => $before,
                    'quantity_change' => -$qtyToWriteOff,
                    'quantity_after' => $after,
                    'reference_note' => "FEFO Expiry Quarantine: Batch {$batch->batch_number} ({$reason})",
                ]);

                // Create debit ledger entry
                FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                    'warehouse_id' => $batch->warehouse_id,
                    'order_id' => null,
                    'product_id' => $batch->product_id,
                    'entry_type' => 'INVENTORY_WASTAGE_WRITE_OFF',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $totalLoss,
                    'description' => "FEFO Spoilage Write-off for {$qtyToWriteOff} units of {$batch->product->title_en} (Batch {$batch->batch_number})",
                    'recorded_at' => Carbon::now(),
                ]);
            }

            // Update batch status
            $batch->update([
                'status' => 'EXPIRED_QUARANTINED',
                'remaining_quantity' => 0,
            ]);

            return [
                'success' => true,
                'batchId' => $batch->id,
                'batchNumber' => $batch->batch_number,
                'quarantinedQuantity' => $qtyToWriteOff,
                'totalLossAmountIqd' => $totalLoss,
                'newStatus' => 'EXPIRED_QUARANTINED',
            ];
        });
    }
}
