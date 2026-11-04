<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrdersController extends Controller
{
    protected OrderFulfillmentService $fulfillmentService;

    public function __construct(OrderFulfillmentService $fulfillmentService)
    {
        $this->fulfillmentService = $fulfillmentService;
    }

    public function create(Request $request): JsonResponse
    {
        $idempotencyKey = $request->header('idempotency-key') ?: $request->header('Idempotency-Key');
        $result = $this->fulfillmentService->createOrder($request->all(), $idempotencyKey);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully and queued for dark store fulfillment.',
            'data' => $result,
        ], 201);
    }

    public function validateCart(Request $request): JsonResponse
    {
        $request->validate(['items' => 'required|array']);
        $warehouseId = $request->input('warehouseId', 'erbil-central-darkstore');
        $result = $this->fulfillmentService->validateCart($request->input('items'), $warehouseId);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function show(string $id): JsonResponse
    {
        $order = Order::with(['items.product', 'driver', 'warehouse', 'rating'])->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->update(['order_status' => $request->input('status')]);
        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }
}

