<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PosOutboundInvoice;
use App\Models\WarehouseStock;
use App\Models\AdminAuditLog;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class Step22RetailHardeningController extends Controller
{
    /**
     * Backup SQLite database to storage/backups/
     */
    public function backupDatabase(Request $request): JsonResponse
    {
        $dbPath = database_path('database.sqlite');
        if (!File::exists($dbPath)) {
            // Check config
            $defaultConn = config('database.default');
            $dbPath = config("database.connections.{$defaultConn}.database");
        }

        if (!File::exists($dbPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Database file not found for snapshot backup.',
            ], 404);
        }

        $backupDir = storage_path('backups');
        if (!File::isDirectory($backupDir)) {
            File::makeDirectory($backupDir, 0755, true, true);
        }

        $timestamp = date('Y_m_d_His');
        $filename = "bazmart_backup_{$timestamp}.sqlite";
        $destination = $backupDir . DIRECTORY_SEPARATOR . $filename;

        File::copy($dbPath, $destination);
        $sizeBytes = File::size($destination);

        AdminAuditLog::create([
            'id' => 'log-' . bin2hex(random_bytes(6)),
            'user_id' => 'admin-sys',
            'user_name' => 'System Architect (Sulaymaniyah Hub)',
            'action' => 'DATABASE_BACKUP_SNAPSHOT',
            'model_type' => 'System',
            'model_id' => $filename,
            'ip_address' => $request->ip() ?: '127.0.0.1',
            'user_agent' => $request->userAgent() ?: 'BazMart Automated Ops',
            'old_values' => null,
            'new_values' => json_encode([
                'filename' => $filename,
                'size_bytes' => $sizeBytes,
                'backup_path' => $destination,
                'source' => $dbPath,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Database snapshot created successfully.',
            'backup' => [
                'filename' => $filename,
                'path' => $destination,
                'sizeBytes' => $sizeBytes,
                'sizeFormatted' => round($sizeBytes / 1024, 2) . ' KB',
                'createdAt' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get Two-Way Partner POS Outbound Invoices
     */
    public function getOutboundInvoices(Request $request): JsonResponse
    {
        $invoices = PosOutboundInvoice::with(['order', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // Seed initial benchmark write-back records if none exist
        if ($invoices->isEmpty()) {
            $orders = Order::orderBy('created_at', 'desc')->take(3)->get();
            foreach ($orders as $order) {
                app(\App\Services\PosBridge\PartnerPosBridgeService::class)->pushCompletedOrderToSupermarketPos($order);
            }
            $invoices = PosOutboundInvoice::with(['order', 'warehouse'])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();
        }

        return response()->json([
            'success' => true,
            'count' => $invoices->count(),
            'data' => $invoices,
        ]);
    }

    /**
     * Get & Update Safety Stock Buffer
     */
    public function getSafetyBuffer(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId', 'suly-main-darkstore');
        $avgBuffer = (int)WarehouseStock::where('warehouse_id', $warehouseId)->avg('safety_stock_buffer') ?: 2;

        return response()->json([
            'success' => true,
            'warehouseId' => $warehouseId,
            'safetyStockBuffer' => $avgBuffer,
            'description' => 'Walk-in shopper protection buffer subtracted from available stock.',
        ]);
    }

    public function updateSafetyBuffer(Request $request): JsonResponse
    {
        $buffer = (int)$request->input('safetyStockBuffer', 2);
        $warehouseId = $request->input('warehouseId');

        $query = WarehouseStock::query();
        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }
        $query->update(['safety_stock_buffer' => $buffer]);

        AdminAuditLog::create([
            'id' => 'log-' . bin2hex(random_bytes(6)),
            'user_id' => 'admin-pos',
            'user_name' => 'POS Integration Lead',
            'action' => 'SAFETY_STOCK_BUFFER_UPDATED',
            'model_type' => 'WarehouseStock',
            'model_id' => $warehouseId ?: 'global',
            'ip_address' => $request->ip() ?: '127.0.0.1',
            'user_agent' => $request->userAgent() ?: 'BazMart Ops',
            'old_values' => null,
            'new_values' => json_encode(['safety_stock_buffer' => $buffer]),
        ]);

        return response()->json([
            'success' => true,
            'safetyStockBuffer' => $buffer,
            'message' => "Safety stock buffer updated to {$buffer} units across dark store.",
        ]);
    }
}

