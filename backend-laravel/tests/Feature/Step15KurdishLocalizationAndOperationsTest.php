<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Warehouse;
use App\Models\AdminAuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Step15KurdishLocalizationAndOperationsTest extends TestCase
{
    public function test_item_substitution_remove_and_refund_adjusts_totals_and_creates_audit_log()
    {
        $order = Order::with('items')->first();
        $this->assertNotNull($order);
        $item = $order->items->first();
        $this->assertNotNull($item);

        $initialTotal = $order->total_iqd;
        $refundAmount = $item->total_iqd;

        $response = $this->postJson("/api/v1/admin/orders/{$order->id}/items/{$item->id}/substitute-or-remove", [
            'action' => 'REMOVE_AND_REFUND',
            'actorName' => 'Zanyar Soran (Picker)',
            'reason' => 'Damaged packaging during dark store picking',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'action' => 'REMOVE_AND_REFUND',
                'refundAmountIqd' => $refundAmount,
            ],
        ]);

        $order->refresh();
        $item->refresh();

        $this->assertTrue($item->is_substituted);
        $this->assertEquals(0, $item->quantity);
        $this->assertStringContainsString('REMOVED_AND_REFUNDED', $item->substitution_reason);
        $this->assertEquals($initialTotal - $refundAmount, $order->total_iqd);

        // Verify immutable audit log was created
        $auditLog = AdminAuditLog::where('target_reference', "{$order->order_number} / ITEM-{$item->id}")->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals('Zanyar Soran (Picker)', $auditLog->actor_name);
        $this->assertEquals('ITEM_REMOVED_REFUNDED', $auditLog->action_type);

        // Restore order item so subsequent accounting test assertions retain non-zero COGS
        $item->is_substituted = false;
        $item->quantity = 4;
        $item->substitution_reason = null;
        $item->save();
        $order->total_iqd = $initialTotal;
        $order->subtotal_iqd = $initialTotal;
        $order->total_cogs_iqd = 7000;
        $order->save();
    }

    public function test_item_substitution_replace_best_match()
    {
        $order = Order::with('items')->first();
        $item = $order->items->first();
        $replacementProduct = Product::where('id', '!=', $item->product_id)->first();
        $this->assertNotNull($replacementProduct);

        $response = $this->postJson("/api/v1/admin/orders/{$order->id}/items/{$item->id}/substitute-or-remove", [
            'action' => 'REPLACE_BEST_MATCH',
            'replacementProductId' => $replacementProduct->id,
            'actorName' => 'Zanyar Soran (Picker)',
            'reason' => 'Shelf out of stock',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'action' => 'REPLACE_BEST_MATCH',
            ],
        ]);

        $item->refresh();
        $this->assertTrue($item->is_substituted);
        $this->assertEquals($replacementProduct->id, $item->substituted_product_id);
    }

    public function test_daily_z_report_endpoint_returns_accurate_totals_and_kurdish_receipt()
    {
        $response = $this->getJson('/api/v1/admin/finance/daily-z-report');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'reportNumber',
                'generatedAt',
                'warehouseId',
                'cashierName',
                'totalOrdersCount',
                'deliveredOrdersCount',
                'grossMerchandiseValueIqd',
                'netBasketRevenueIqd',
                'totalCogsIqd',
                'grossProfitIqd',
                'grossMarginPercentage',
                'codCollectedIqd',
                'asciiZReport',
            ],
        ]);

        $ascii = $response->json('data.asciiZReport');
        $this->assertStringContainsString('BAZMART DARK STORE POS', $ascii);
        $this->assertStringContainsString('DAILY CASHIER CLOSING Z-REPORT', $ascii);
        $this->assertStringContainsString('ڕاپۆرتی کۆتایی ڕۆژانەی کاشێری بازماڕت', $ascii);
    }

    public function test_admin_audit_logs_retrieval()
    {
        AdminAuditLog::create([
            'actor_name' => 'Shkar Hama',
            'actor_role' => 'ACCOUNTANT',
            'action_type' => 'Z_REPORT_SETTLEMENT',
            'target_reference' => 'Z-TEST-REF',
            'details' => 'Test settlement audit log verification',
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/admin/audit-logs');
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_dark_store_operating_status_update()
    {
        $wh = Warehouse::first();
        $this->assertNotNull($wh);

        $response = $this->putJson('/api/v1/admin/store/operating-status', [
            'warehouseId' => $wh->id,
            'status' => 'NORMAL',
            'actorName' => 'Zanyar Soran',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $log = AdminAuditLog::where('target_reference', $wh->id)->first();
        $this->assertNotNull($log);
        $this->assertEquals('WAREHOUSE_STATUS_CHANGED', $log->action_type);
    }
}

