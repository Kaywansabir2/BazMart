<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ErpSyncService;
use App\Models\ErpSyncLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ErpSyncController extends Controller
{
    protected ErpSyncService $erpSyncService;

    public function __construct(ErpSyncService $erpSyncService)
    {
        $this->erpSyncService = $erpSyncService;
    }

    public function handleStockUpdate(Request $request): JsonResponse
    {
        $updates = $request->input('updates');
        if (!is_array($updates)) {
            if ($request->has('externalErpId')) {
                $stockUpdates = $request->input('stockUpdates', []);
                $singleItems = [];
                $price = $request->input('newOriginalPriceIqd', $request->input('shelfPriceIqd', $request->input('originalPriceIqd')));
                
                if (is_array($stockUpdates) && count($stockUpdates) > 0) {
                    foreach ($stockUpdates as $su) {
                        $singleItems[] = [
                            'externalErpId' => $request->input('externalErpId'),
                            'warehouseId' => $su['warehouseId'] ?? 'suly-main-darkstore',
                            'stockQuantity' => $su['stockQuantity'] ?? 0,
                            'originalPriceIqd' => $price,
                        ];
                    }
                } else {
                    $singleItems[] = [
                        'externalErpId' => $request->input('externalErpId'),
                        'warehouseId' => $request->input('warehouseId', 'suly-main-darkstore'),
                        'stockQuantity' => $request->input('stockQuantity', 100),
                        'originalPriceIqd' => $price,
                    ];
                }
                $updates = $singleItems;
            } else {
                $updates = is_array($request->all()) ? $request->all() : [];
            }
        }

        $result = $this->erpSyncService->processBatchStockUpdate($updates);

        return response()->json(array_merge([
            'success' => true,
            'timestamp' => now()->toISOString(),
        ], $result));
    }

    public function triggerSync(): JsonResponse
    {
        $report = $this->erpSyncService->triggerManualSync();
        return response()->json(['success' => true, 'data' => $report]);
    }

    public function getLogs(): JsonResponse
    {
        $logs = ErpSyncLog::orderBy('created_at', 'desc')->limit(20)->get();
        return response()->json(['success' => true, 'data' => $logs]);
    }

    public function getPosParityAudit(): JsonResponse
    {
        $bridge = app(\App\Services\PosBridge\PartnerPosBridgeService::class);
        $audit = $bridge->auditParity();
        return response()->json(array_merge(['success' => true], $audit));
    }
}

