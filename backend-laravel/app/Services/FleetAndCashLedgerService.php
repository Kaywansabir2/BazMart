<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverCashLedger;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Notification;
use App\Services\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FleetAndCashLedgerService
{
    public function getAllDrivers(?string $warehouseId = null): array
    {
        $query = Driver::with(['warehouse', 'assignedOrders' => function ($q) {
            $q->whereIn('order_status', ['PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']);
        }]);

        if ($warehouseId && $warehouseId !== 'all') {
            $query->where('warehouse_id', $warehouseId);
        }

        $drivers = $query->orderBy('full_name')->get();

        return $drivers->map(function ($d) {
            $active = $d->assignedOrders->first();
            return [
                'id' => $d->id,
                'fullName' => $d->full_name,
                'phone' => $d->phone,
                'vehicleType' => $d->vehicle_type,
                'plateNumber' => $d->plate_number,
                'warehouseId' => $d->warehouse_id,
                'warehouseName' => $d->warehouse ? $d->warehouse->name : null,
                'warehouseCity' => $d->warehouse ? $d->warehouse->city : null,
                'status' => $d->status,
                'cashInHandIqd' => (int)$d->cash_in_hand_iqd,
                'averageRating' => (float)$d->average_rating,
                'totalRatingsCount' => (int)$d->total_ratings_count,
                'activeOrder' => $active ? [
                    'id' => $active->id,
                    'orderNumber' => $active->order_number,
                    'totalIqd' => (int)$active->total_iqd,
                    'paymentMethod' => $active->payment_method,
                    'orderStatus' => $active->order_status,
                    'estimatedDeliveryMinutes' => $active->estimated_delivery_minutes,
                ] : null,
                'createdAt' => $d->created_at,
            ];
        })->toArray();
    }

    public function assignOrderToDriver(string $orderId, string $driverId): Order
    {
        $driver = Driver::find($driverId);
        if (!$driver) {
            throw ValidationException::withMessages(['driverId' => "Driver \"{$driverId}\" not found."]);
        }

        $order = Order::find($orderId);
        if (!$order) {
            throw ValidationException::withMessages(['orderId' => "Order \"{$orderId}\" not found."]);
        }

        return DB::transaction(function () use ($order, $driver) {
            $order->update([
                'driver_id' => $driver->id,
                'assigned_driver_name' => $driver->full_name,
                'assigned_driver_phone' => $driver->phone,
                'order_status' => 'OUT_FOR_DELIVERY',
                'out_for_delivery_at' => now(),
                'estimated_delivery_minutes' => '12-15 mins',
            ]);

            $driver->update(['status' => 'BUSY_DELIVERING']);

            Notification::create([
                'customer_id' => $order->customer_id,
                'customer_phone' => $order->customer_phone,
                'order_id' => $order->id,
                'type' => 'ORDER_UPDATE',
                'title_en' => "Order #{$order->order_number} Out for Delivery",
                'title_ckb' => "داواکاری #{$order->order_number} لە ڕێگایە",
                'title_ar' => "طلبك #{$order->order_number} في الطريق إليك",
                'body_en' => "Driver {$driver->full_name} is on the way to your address.",
                'body_ckb' => "شۆفێر {$driver->full_name} لە ڕێگایە بۆ ناونیشانەکەت.",
                'body_ar' => "الكابتن {$driver->full_name} في الطريق إلى موقعك.",
                'is_read' => false,
            ]);

            return $order->fresh(['items.product', 'driver', 'warehouse']);
        });
    }

    public function updateDeliveryStatus(string $orderId, string $status, ?string $driverId = null): Order
    {
        $order = Order::with('driver')->find($orderId);
        if (!$order) {
            throw ValidationException::withMessages(['orderId' => "Order \"{$orderId}\" not found."]);
        }

        $effectiveDriverId = $driverId ?: $order->driver_id;

        if ($status === 'PICKED_UP') {
            $order->update([
                'order_status' => 'OUT_FOR_DELIVERY',
                'out_for_delivery_at' => now(),
                'estimated_delivery_minutes' => '10-12 mins',
            ]);
            return $order->fresh(['items.product', 'driver']);
        }

        if ($status === 'ARRIVED_AT_CUSTOMER') {
            $order->update([
                'estimated_delivery_minutes' => 'Arrived at your door',
            ]);
            return $order->fresh(['items.product', 'driver']);
        }

        if ($status === 'DELIVERED' || $status === 'DELIVERED_COD_COLLECTED') {
            return DB::transaction(function () use ($order, $effectiveDriverId) {
                $isCod = $order->payment_method === 'COD';
                $cashToCollect = $isCod ? ($order->physical_cash_collectible_iqd ?: ($order->net_cod_payable_iqd ?: $order->total_iqd)) : 0;

                $order->update([
                    'order_status' => 'DELIVERED',
                    'payment_status' => 'PAID',
                    'delivered_at' => now(),
                    'estimated_delivery_minutes' => 'Delivered',
                ]);

                if ($effectiveDriverId) {
                    $driver = Driver::find($effectiveDriverId);
                    if ($driver) {
                        $newCash = $driver->cash_in_hand_iqd + $cashToCollect;
                        $driver->update([
                            'status' => 'AVAILABLE',
                            'cash_in_hand_iqd' => $newCash,
                        ]);

                        if ($isCod && $cashToCollect > 0) {
                            DriverCashLedger::create([
                                'driver_id' => $driver->id,
                                'order_id' => $order->id,
                                'transaction_type' => 'COD_COLLECTED',
                                'amount_iqd' => $cashToCollect,
                                'balance_after_iqd' => $newCash,
                                'receipt_reference' => "#COD-{$order->order_number}",
                            ]);
                        }
                    }
                }

                // Instant Wallet Small Change Credit (250 IQD Engine)
                if ($isCod && $order->wallet_small_change_credit_iqd > 0 && $order->customer_id) {
                    $customer = Customer::find($order->customer_id);
                    if ($customer) {
                        app(WalletService::class)->creditWallet(
                            $customer,
                            $order->wallet_small_change_credit_iqd,
                            '250_IQD_CASH_ROUNDING_CHANGE',
                            $order->id,
                            "250 IQD Banknote change credit for Order #{$order->order_number}",
                            "باقی گەڕاوەی دراوی ٢٥٠ دیناری بۆ داواکاری #{$order->order_number}",
                            "فكة رصيد تقريب الـ 250 دينار للطلب #{$order->order_number}"
                        );
                    }
                }

                // Two-Way Partner POS Sales Write-Back
                try {
                    app(\App\Services\PosBridge\PartnerPosBridgeService::class)->pushCompletedOrderToSupermarketPos($order);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Two-way POS write back failed: " . $e->getMessage());
                }

                Notification::create([
                    'customer_id' => $order->customer_id,
                    'customer_phone' => $order->customer_phone,
                    'order_id' => $order->id,
                    'type' => 'ORDER_UPDATE',
                    'title_en' => "Order #{$order->order_number} Delivered! 🎉",
                    'title_ckb' => "داواکاری #{$order->order_number} گەیشت! 🎉",
                    'title_ar' => "تم تسليم الطلب #{$order->order_number}! 🎉",
                    'body_en' => 'Thank you for shopping with BazMart! How was your experience?',
                    'body_ckb' => 'سوپاس بۆ کڕین لە بازماڕت! ئەزموونەکەت چۆن بوو؟',
                    'body_ar' => 'شكراً لتسوقك مع بازمارت! كيف كانت تجربتك؟',
                    'is_read' => false,
                ]);

                return $order->fresh(['items.product', 'driver']);
            });
        }

        return $order;
    }

    public function settleDriverCash(string $driverId): array
    {
        $driver = Driver::find($driverId);
        if (!$driver) {
            throw ValidationException::withMessages(['driverId' => "Driver \"{$driverId}\" not found."]);
        }

        return DB::transaction(function () use ($driver) {
            $settledAmount = (int)$driver->cash_in_hand_iqd;
            $receiptNum = 'SETTLE-' . substr(time(), -6);

            $driver->update(['cash_in_hand_iqd' => 0]);

            DriverCashLedger::create([
                'driver_id' => $driver->id,
                'order_id' => null,
                'transaction_type' => 'CASHIER_SHIFT_SETTLEMENT',
                'amount_iqd' => -$settledAmount,
                'balance_after_iqd' => 0,
                'receipt_reference' => "#{$receiptNum}",
            ]);

            return [
                'success' => true,
                'driverId' => $driver->id,
                'driverName' => $driver->full_name,
                'settledAmountIqd' => $settledAmount,
                'remainingCashInHandIqd' => 0,
                'settledAt' => now()->toISOString(),
                'receiptNumber' => $receiptNum,
                'driver' => $driver->fresh(),
            ];
        });
    }
}

