<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderRating;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RatingsController extends Controller
{
    public function getLiveStatus(string $orderId): JsonResponse
    {
        $order = Order::with(['driver', 'rating'])->find($orderId);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $stages = [
            'PLACED' => 1,
            'PACKING_IN_DARKSTORE' => 2,
            'READY_FOR_PICKUP' => 3,
            'OUT_FOR_DELIVERY' => 4,
            'DELIVERED' => 5,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'orderId' => $order->id,
                'orderNumber' => $order->order_number,
                'orderStatus' => $order->order_status,
                'statusStep' => $stages[$order->order_status] ?? 1,
                'estimatedDeliveryMinutes' => $order->estimated_delivery_minutes,
                'driver' => $order->driver ? [
                    'id' => $order->driver->id,
                    'name' => $order->driver->full_name,
                    'phone' => $order->driver->phone,
                    'rating' => (float)$order->driver->average_rating,
                    'vehicleType' => $order->driver->vehicle_type,
                    'plateNumber' => $order->driver->plate_number,
                ] : null,
                'isDelivered' => $order->order_status === 'DELIVERED',
                'isRated' => $order->rating !== null,
            ],
        ]);
    }

    public function rateOrder(Request $request, string $orderId): JsonResponse
    {
        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $request->validate([
            'overallStoreStars' => 'required|integer|min:1|max:5',
            'driverStars' => 'required|integer|min:1|max:5',
        ]);

        $rating = OrderRating::updateOrCreate(
            ['order_id' => $orderId],
            [
                'customer_id' => $order->customer_id,
                'customer_phone' => $order->customer_phone,
                'driver_id' => $order->driver_id,
                'overall_store_stars' => (int)$request->input('overallStoreStars'),
                'driver_stars' => (int)$request->input('driverStars'),
                'feedback_tags' => json_encode($request->input('feedbackTags', [])),
                'comment' => $request->input('comment'),
            ]
        );

        if ($order->driver_id) {
            $driver = Driver::find($order->driver_id);
            if ($driver) {
                $totalRatings = OrderRating::where('driver_id', $driver->id)->count();
                $avg = OrderRating::where('driver_id', $driver->id)->avg('driver_stars');
                $driver->update([
                    'total_ratings_count' => $totalRatings,
                    'average_rating' => round($avg, 2),
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => $rating]);
    }

    public function getAdminRatings(): JsonResponse
    {
        $ratings = OrderRating::with('order.driver')->orderBy('created_at', 'desc')->limit(50)->get();
        return response()->json(['success' => true, 'data' => $ratings]);
    }
}

