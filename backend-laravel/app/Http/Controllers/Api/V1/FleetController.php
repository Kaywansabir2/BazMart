<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Services\FleetAndCashLedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FleetController extends Controller
{
    protected FleetAndCashLedgerService $fleetService;

    public function __construct(FleetAndCashLedgerService $fleetService)
    {
        $this->fleetService = $fleetService;
    }

    public function getAllDrivers(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId');
        $drivers = $this->fleetService->getAllDrivers($warehouseId);
        return response()->json(['success' => true, 'data' => $drivers]);
    }

    public function getDriverById(string $id): JsonResponse
    {
        $driver = Driver::with(['warehouse', 'assignedOrders.items.product'])->find($id);
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $driver]);
    }

    public function createDriver(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => 'required|string',
            'phone' => 'required|string',
            'plateNumber' => 'required|string',
            'warehouseId' => 'required|string',
        ]);

        $driver = Driver::create([
            'id' => 'drv-' . bin2hex(random_bytes(5)),
            'full_name' => $data['fullName'],
            'phone' => $data['phone'],
            'plate_number' => $data['plateNumber'],
            'vehicle_type' => $request->input('vehicleType', 'Motorcycle'),
            'warehouse_id' => $data['warehouseId'],
            'status' => 'AVAILABLE',
            'cash_in_hand_iqd' => 0,
        ]);

        return response()->json(['success' => true, 'data' => $driver], 201);
    }

    public function updateDriver(Request $request, string $id): JsonResponse
    {
        $driver = Driver::find($id);
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $driver->update($request->only(['full_name', 'phone', 'vehicle_type', 'plate_number', 'warehouse_id', 'status']));
        return response()->json(['success' => true, 'data' => $driver]);
    }

    public function assignOrder(Request $request, string $orderId): JsonResponse
    {
        $driverId = $request->input('driverId');
        $order = $this->fleetService->assignOrderToDriver($orderId, $driverId);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateDeliveryStatus(Request $request, string $orderId): JsonResponse
    {
        $status = $request->input('status');
        $driverId = $request->input('driverId');
        $order = $this->fleetService->updateDeliveryStatus($orderId, $status, $driverId);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function settleDriverCash(string $driverId): JsonResponse
    {
        $result = $this->fleetService->settleDriverCash($driverId);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function getDriverOrders(string $driverId): JsonResponse
    {
        $orders = \App\Models\Order::where('driver_id', $driverId)
            ->with(['items.product', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }
}

