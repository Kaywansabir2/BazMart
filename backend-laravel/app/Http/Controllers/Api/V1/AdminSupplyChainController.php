<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SupplyChainAndBatchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminSupplyChainController extends Controller
{
    protected SupplyChainAndBatchService $supplyChainService;

    public function __construct(SupplyChainAndBatchService $supplyChainService)
    {
        $this->supplyChainService = $supplyChainService;
    }

    public function getOverview(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId');
        $data = $this->supplyChainService->getOverview($warehouseId);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function getBatches(Request $request): JsonResponse
    {
        $filters = [
            'warehouseId' => $request->query('warehouseId'),
            'urgency' => $request->query('urgency', 'all'),
            'search' => $request->query('search'),
        ];

        $data = $this->supplyChainService->getBatches($filters);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function getPurchaseOrders(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId');
        $data = $this->supplyChainService->getPurchaseOrders($warehouseId);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function createPurchaseOrder(Request $request): JsonResponse
    {
        $request->validate([
            'supplierId' => 'required|string',
            'warehouseId' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|string',
            'items.*.orderedQuantity' => 'required|integer|min:1',
            'items.*.unitCostIqd' => 'nullable|integer|min:1',
            'expectedDeliveryDate' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $result = $this->supplyChainService->createPurchaseOrder($request->all());
        return response()->json(['success' => true, 'data' => $result], 201);
    }

    public function receivePurchaseOrder(Request $request, string $id): JsonResponse
    {
        $result = $this->supplyChainService->receivePurchaseOrder($id);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function applyClearanceDiscount(Request $request, int $batchId): JsonResponse
    {
        $result = $this->supplyChainService->applyClearanceDiscount($batchId);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function quarantineAndWriteOff(Request $request, int $batchId): JsonResponse
    {
        $reason = $request->input('reason', 'FEFO manual expiry quarantine');
        $result = $this->supplyChainService->quarantineAndWriteOff($batchId, $reason);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function getSuppliers(Request $request): JsonResponse
    {
        $data = $this->supplyChainService->getSuppliers();
        return response()->json(['success' => true, 'data' => $data]);
    }
}

