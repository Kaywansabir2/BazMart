<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\FinancialLedgerEntry;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\InventoryBatch;
use App\Services\FinancialAccountingService;
use App\Services\SupplyChainAndBatchService;
use App\Services\OrderFulfillmentService;
use Carbon\Carbon;

class Step13SupplyChainAndAccountingFixTest extends TestCase
{
    /**
     * Test Accounting Fix A: Non-zero COGS across all orders and realistic 20-35% Gross Margin.
     */
    public function test_accounting_fix_a_non_zero_cogs_and_realistic_gross_margin(): void
    {
        $orders = Order::with('items')->get();
        $this->assertGreaterThan(0, $orders->count(), 'Seeded orders must exist.');

        foreach ($orders as $order) {
            $this->assertGreaterThan(0, $order->total_cogs_iqd, "Order {$order->order_number} must have non-zero COGS.");
            $computedCogs = $order->items->sum('total_cost_iqd');
            $this->assertEquals($computedCogs, $order->total_cogs_iqd, "Order {$order->order_number} total_cogs_iqd must equal sum of items total_cost_iqd.");
        }

        $financeService = app(FinancialAccountingService::class);
        $summary = $financeService->getFinancialSummary(null, '7days');

        $this->assertGreaterThan(0, $summary['netBasketRevenueIqd']);
        $this->assertGreaterThan(0, $summary['totalCogsIqd']);

        // Check realistic gross margin between 20% and 35%
        $this->assertGreaterThanOrEqual(20.0, $summary['grossMarginPercent'], 'Gross margin must be >= 20%');
        $this->assertLessThanOrEqual(35.0, $summary['grossMarginPercent'], 'Gross margin must be <= 35%');

        // Check exact waterfall identities: Card 1 - Card 2 = Card 3
        $this->assertEquals(
            $summary['netBasketRevenueIqd'] - $summary['totalCogsIqd'],
            $summary['grossProfitIqd'],
            'Card 1 (Net Basket) - Card 2 (Total COGS) must equal Card 3 (Gross Profit)'
        );

        // Check Card 3 - Card 4 = Card 5
        $this->assertEquals(
            $summary['grossProfitIqd'] - $summary['totalDeductionsIqd'],
            $summary['netOperatingProfitIqd'],
            'Card 3 (Gross Profit) - Card 4 (Total Deductions) must equal Card 5 (Net Operating Profit)'
        );
    }

    /**
     * Test Accounting Fix B: Active margins calculated against active selling price.
     */
    public function test_accounting_fix_b_canonical_sku_active_margins(): void
    {
        $financeService = app(FinancialAccountingService::class);
        $skuMargins = collect($financeService->getSkuMargins())->keyBy('externalErpId');

        // Cucumber: Effective Price 1445, Cost 1050 -> Margin 27.34%
        $cucumber = $skuMargins->get('ERP-SKU-1005');
        $this->assertNotNull($cucumber);
        $this->assertEquals(1445, $cucumber['activePriceIqd']);
        $this->assertEquals(1050, $cucumber['costPriceIqd']);
        $this->assertEquals(395, $cucumber['unitProfitIqd']);
        $this->assertEquals(27.34, $cucumber['marginPercent']);

        // Piano Pen: Effective Price 400, Cost 250 -> Margin 37.50%
        $pen = $skuMargins->get('ERP-SKU-1006');
        $this->assertNotNull($pen);
        $this->assertEquals(400, $pen['activePriceIqd']);
        $this->assertEquals(250, $pen['costPriceIqd']);
        $this->assertEquals(150, $pen['unitProfitIqd']);
        $this->assertEquals(37.50, $pen['marginPercent']);

        // Mountain Dew: Effective Price 287, Cost 220 -> Margin 23.34%
        $dew = $skuMargins->get('ERP-SKU-1007');
        $this->assertNotNull($dew);
        $this->assertEquals(287, $dew['activePriceIqd']);
        $this->assertEquals(220, $dew['costPriceIqd']);
        $this->assertEquals(67, $dew['unitProfitIqd']);
        $this->assertEquals(23.34, $dew['marginPercent']);

        // Schauma: Effective Price 7013, Cost 5400 -> Margin 23.00%
        $schauma = $skuMargins->get('ERP-SKU-1008');
        $this->assertNotNull($schauma);
        $this->assertEquals(7013, $schauma['activePriceIqd']);
        $this->assertEquals(5400, $schauma['costPriceIqd']);
        $this->assertEquals(1613, $schauma['unitProfitIqd']);
        $this->assertEquals(23.00, $schauma['marginPercent']);

        // Tabasco Ramen: Effective Price 1215, Cost 900 -> Margin 25.93%
        foreach (['ERP-SKU-1012', 'ERP-SKU-1013', 'ERP-SKU-1014'] as $ramenSku) {
            $ramen = $skuMargins->get($ramenSku);
            $this->assertNotNull($ramen);
            $this->assertEquals(1215, $ramen['activePriceIqd']);
            $this->assertEquals(900, $ramen['costPriceIqd']);
            $this->assertEquals(315, $ramen['unitProfitIqd']);
            $this->assertEquals(25.93, $ramen['marginPercent']);
        }

        // Nescafe Cappuccino: Wholesale cost standardized to 750, Margin 25.00%
        $cappuccino = $skuMargins->get('ERP-SKU-1016');
        $this->assertNotNull($cappuccino);
        $this->assertEquals(750, $cappuccino['costPriceIqd']);
        $this->assertEquals(25.00, $cappuccino['marginPercent']);
    }

    /**
     * Test Purchase Order Receiving Workflow.
     */
    public function test_purchase_order_receiving_workflow(): void
    {
        $supplyChainService = app(SupplyChainAndBatchService::class);

        // Find or create a pending PO
        $pendingPo = PurchaseOrder::where('status', 'SENT_TO_SUPPLIER')->first();
        if (!$pendingPo) {
            $created = $supplyChainService->createPurchaseOrder([
                'supplierId' => 'sup-henkel-levant',
                'warehouseId' => 'erbil-central-darkstore',
                'items' => [
                    ['productId' => 'p-schauma', 'orderedQuantity' => 15, 'unitCostIqd' => 5400],
                ],
            ]);
            $pendingPo = $created['purchaseOrder'];
        }

        $stockBefore = WarehouseStock::where('warehouse_id', $pendingPo->warehouse_id)
            ->where('product_id', $pendingPo->items->first()->product_id)
            ->value('stock_quantity') ?? 0;

        $res = $supplyChainService->receivePurchaseOrder($pendingPo->id);

        $this->assertTrue($res['success']);
        $this->assertEquals('RECEIVED_INTO_STOCK', $res['status']);

        // Verify stock incremented
        $stockAfter = WarehouseStock::where('warehouse_id', $pendingPo->warehouse_id)
            ->where('product_id', $pendingPo->items->first()->product_id)
            ->value('stock_quantity');
        $this->assertGreaterThan($stockBefore, $stockAfter);

        // Verify new batch created
        $batch = InventoryBatch::where('purchase_order_id', $pendingPo->id)->first();
        $this->assertNotNull($batch);
        $this->assertEquals('ACTIVE', $batch->status);
        $this->assertGreaterThan(0, $batch->remaining_quantity);

        // Verify stock movement logged
        $movement = StockMovement::where('warehouse_id', $pendingPo->warehouse_id)
            ->where('movement_type', 'ERP_PO_RECEIVED')
            ->latest('id')
            ->first();
        $this->assertNotNull($movement);

        // Verify financial ledger debit logged
        $ledger = FinancialLedgerEntry::where('entry_type', 'PO_INVENTORY_PURCHASE')
            ->latest('id')
            ->first();
        $this->assertNotNull($ledger);
        $this->assertEquals('DEBIT', $ledger->direction);
    }

    /**
     * Test FEFO Customer Checkout Deduction.
     */
    public function test_fefo_checkout_deducts_from_oldest_batch_first(): void
    {
        $warehouseId = 'erbil-central-darkstore';
        $productId = 'p-cucumber';

        // Ensure clean test batches
        InventoryBatch::where('batch_number', 'like', 'LOT-TEST-%')->delete();

        // Ensure at least two active batches with distinct expiry dates
        InventoryBatch::create([
            'batch_number' => 'LOT-TEST-EARLY',
            'warehouse_id' => $warehouseId,
            'product_id' => $productId,
            'initial_quantity' => 10,
            'remaining_quantity' => 10,
            'unit_cost_iqd' => 1050,
            'production_date' => now()->subDays(5)->toDateString(),
            'expiry_date' => now()->addDays(3)->toDateString(), // Expires in 3 days
            'status' => 'ACTIVE',
        ]);

        InventoryBatch::create([
            'batch_number' => 'LOT-TEST-LATER',
            'warehouse_id' => $warehouseId,
            'product_id' => $productId,
            'initial_quantity' => 10,
            'remaining_quantity' => 10,
            'unit_cost_iqd' => 1050,
            'production_date' => now()->subDays(1)->toDateString(),
            'expiry_date' => now()->addDays(20)->toDateString(), // Expires in 20 days
            'status' => 'ACTIVE',
        ]);

        // Place customer order for 6 units
        $fulfillmentService = app(OrderFulfillmentService::class);
        $orderRes = $fulfillmentService->createOrder([
            'warehouseId' => $warehouseId,
            'customerPhone' => '+9647701234999',
            'customerName' => 'FEFO Tester',
            'paymentMethod' => 'COD',
            'items' => [
                ['productId' => $productId, 'quantity' => 6],
            ],
            'address' => [
                'city' => 'Erbil',
                'neighborhood' => 'Gulan',
                'street' => 'Street 10',
                'building' => 'Building 5',
            ],
        ]);

        $this->assertNotNull($orderRes['order']);
        $this->assertEquals($orderRes['order']->id, Order::find($orderRes['order']->id)->id);

        // Oldest batch should have been deducted from 10 to 4
        $earlyBatch = InventoryBatch::where('batch_number', 'LOT-TEST-EARLY')->first();
        $this->assertEquals(4, $earlyBatch->remaining_quantity);

        // Later batch should still have all 10 units remaining
        $laterBatch = InventoryBatch::where('batch_number', 'LOT-TEST-LATER')->first();
        $this->assertEquals(10, $laterBatch->remaining_quantity);
    }

    /**
     * Test Near-Expiry Flash Clearance and Quarantine Write-Off.
     */
    public function test_near_expiry_clearance_and_quarantine_writeoff(): void
    {
        $supplyChainService = app(SupplyChainAndBatchService::class);

        // 1. Test Clearance Flash Sale
        $nearBatch = InventoryBatch::where('batch_number', 'LOT-ALRAHMA-1101')->first();
        $this->assertNotNull($nearBatch);

        $clearanceRes = $supplyChainService->applyClearanceDiscount($nearBatch->id);
        $this->assertTrue($clearanceRes['success']);
        $this->assertEquals(25, $clearanceRes['discountPercentage']);
        $this->assertEquals('NEAR_EXPIRY_PROMO', $clearanceRes['batchStatus']);

        // 2. Test Quarantine & Write-off
        $expBatch = InventoryBatch::updateOrCreate(
            ['batch_number' => 'LOT-TEST-EXPIRED-FOR-QUARANTINE'],
            [
                'warehouse_id' => 'erbil-central-darkstore',
                'product_id' => 'p-ramak',
                'initial_quantity' => 5,
                'remaining_quantity' => 5,
                'unit_cost_iqd' => 1750,
                'production_date' => now()->subDays(20)->toDateString(),
                'expiry_date' => now()->subDays(1)->toDateString(),
                'status' => 'ACTIVE',
            ]
        );
        $expBatch->update(['status' => 'ACTIVE', 'remaining_quantity' => 5]);

        $quarantineRes = $supplyChainService->quarantineAndWriteOff($expBatch->id, 'PHPUnit test spoilage isolation');
        $this->assertTrue($quarantineRes['success']);
        $this->assertEquals('EXPIRED_QUARANTINED', $quarantineRes['newStatus']);

        $expBatchRefreshed = $expBatch->fresh();
        $this->assertEquals(0, $expBatchRefreshed->remaining_quantity);
        $this->assertEquals('EXPIRED_QUARANTINED', $expBatchRefreshed->status);

        // Ledger entry logged
        $wastageLedger = FinancialLedgerEntry::where('entry_type', 'INVENTORY_WASTAGE_WRITE_OFF')
            ->where('product_id', $expBatch->product_id)
            ->latest('id')
            ->first();
        $this->assertNotNull($wastageLedger);
        $this->assertEquals('DEBIT', $wastageLedger->direction);
    }
}
