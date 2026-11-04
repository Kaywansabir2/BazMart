<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\CustomerFavorite;
use App\Models\Order;
use App\Models\Product;
use App\Models\SupportTicket;
use App\Services\PhoneAuthService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    private function resolveCustomer(Request $request): ?Customer
    {
        $phone = $request->header('x-customer-phone') ?: $request->query('phone') ?: $request->input('phone');
        $id = $request->header('x-customer-id') ?: $request->input('customerId');
        $auth = $request->header('Authorization');

        if ($auth && str_starts_with($auth, 'Bearer demo-jwt-')) {
            $jsonStr = base64_decode(substr($auth, strlen('Bearer demo-jwt-')));
            $payload = json_decode($jsonStr, true);
            if ($payload && isset($payload['phone'])) {
                $phone = $payload['phone'];
            }
        }

        if ($phone) {
            $norm = PhoneAuthService::normalizeIraqiPhone($phone);
            return Customer::where('phone', $norm)->where('status', '!=', 'DEACTIVATED')->first();
        }

        if ($id) {
            return Customer::where('id', $id)->where('status', '!=', 'DEACTIVATED')->first();
        }

        return Customer::where('status', '!=', 'DEACTIVATED')->first();
    }

    public function getProfile(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        $customer->load('addresses');
        $orderCount = Order::where('customer_phone', $customer->phone)
            ->whereNotIn('order_status', ['CANCELLED'])
            ->count();

        return response()->json([
            'success' => true,
            'customer' => [
                'id' => $customer->id,
                'phone' => $customer->phone,
                'name' => $customer->name,
                'email' => $customer->email,
                'preferredLanguage' => $customer->preferred_language,
                'isOnboarded' => (bool)$customer->is_onboarded,
                'walletBalanceIqd' => (int)$customer->wallet_balance_iqd,
                'referralCode' => $customer->referral_code,
                'status' => $customer->status,
                'orderCount' => $orderCount,
                'addresses' => $customer->addresses,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        $customer->update($request->only(['name', 'email', 'preferred_language']));
        return response()->json(['success' => true, 'customer' => $customer]);
    }

    public function syncGuestState(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not authenticated.'], 401);
        }

        $favoriteIds = $request->input('favoriteProductIds', []);
        $syncedCount = 0;

        if (is_array($favoriteIds)) {
            foreach ($favoriteIds as $pId) {
                if (Product::where('id', $pId)->exists()) {
                    CustomerFavorite::firstOrCreate([
                        'customer_id' => $customer->id,
                        'product_id' => $pId,
                    ]);
                    $syncedCount++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Guest cart and favorites merged successfully.',
            'syncedFavoritesCount' => $syncedCount,
            'walletBalanceIqd' => (int)$customer->wallet_balance_iqd,
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        $customer->name = 'Deactivated User (' . substr(md5($customer->id), 0, 6) . ')';
        $customer->email = null;
        $customer->status = 'DEACTIVATED';
        $customer->api_token = null;
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Account deactivated and anonymized in compliance with App Store guidelines.',
        ]);
    }

    public function getFavorites(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $favoriteProductIds = CustomerFavorite::where('customer_id', $customer->id)
            ->pluck('product_id');

        $products = Product::whereIn('id', $favoriteProductIds)
            ->with(['brand', 'category', 'stocks'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function toggleFavorite(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Authentication required to save favorites.'], 401);
        }

        $productId = $request->input('productId');
        if (!$productId) {
            return response()->json(['success' => false, 'message' => 'productId is required.'], 422);
        }

        $existing = CustomerFavorite::where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'isFavorited' => false,
                'message' => 'Removed from favorites.',
            ]);
        }

        CustomerFavorite::create([
            'customer_id' => $customer->id,
            'product_id' => $productId,
        ]);

        return response()->json([
            'success' => true,
            'isFavorited' => true,
            'message' => 'Added to favorites.',
        ]);
    }

    public function getWallet(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        $walletService = app(WalletService::class);
        $transactions = $walletService->getTransactions($customer);

        return response()->json([
            'success' => true,
            'balanceIqd' => (int)$customer->wallet_balance_iqd,
            'referralCode' => $customer->referral_code,
            'transactions' => $transactions,
        ]);
    }

    public function reportOrderIssue(Request $request, string $orderId): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer authentication required.'], 401);
        }

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $request->validate([
            'issueCategory' => 'required|string|in:MISSING_ITEM,DAMAGED_OR_SPOILED_ITEM,WRONG_ITEM_RECEIVED,LATE_DELIVERY',
            'requestedRefundIqd' => 'nullable|integer|min:0',
            'customerNote' => 'nullable|string',
        ]);

        $ticketNumber = '#TKT-' . rand(10000, 99999);

        $ticket = SupportTicket::create([
            'ticket_number' => $ticketNumber,
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'issue_category' => $request->input('issueCategory'),
            'affected_order_item_ids' => $request->input('affectedOrderItemIds', []),
            'customer_note' => $request->input('customerNote'),
            'requested_refund_iqd' => (int)$request->input('requestedRefundIqd', 0),
            'status' => 'OPEN',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order issue reported. Our support team is reviewing your ticket.',
            'ticket' => $ticket,
        ], 201);
    }

    public function getSupportTickets(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $tickets = SupportTicket::where('customer_id', $customer->id)
            ->with(['order.items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    public function getAddresses(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $addresses = CustomerAddress::where('customer_id', $customer->id)->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function addAddress(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        $addr = CustomerAddress::create([
            'id' => 'addr-' . bin2hex(random_bytes(6)),
            'customer_id' => $customer->id,
            'title' => $request->input('title', 'Home'),
            'city' => $request->input('city', 'Erbil'),
            'neighborhood' => $request->input('neighborhood'),
            'street' => $request->input('street'),
            'building' => $request->input('building'),
            'landmark' => $request->input('landmark'),
            'latitude' => (float)$request->input('latitude', 36.1911),
            'longitude' => (float)$request->input('longitude', 44.0092),
            'is_default' => (bool)$request->input('isDefault', false),
        ]);

        return response()->json(['success' => true, 'data' => $addr], 201);
    }

    public function updateAddress(Request $request, string $id): JsonResponse
    {
        $addr = CustomerAddress::find($id);
        if (!$addr) {
            return response()->json(['success' => false, 'message' => 'Address not found'], 404);
        }

        $addr->update($request->only([
            'title', 'city', 'neighborhood', 'street', 'building', 'landmark', 'latitude', 'longitude', 'is_default'
        ]));

        return response()->json(['success' => true, 'data' => $addr]);
    }

    public function deleteAddress(string $id): JsonResponse
    {
        CustomerAddress::destroy($id);
        return response()->json(['success' => true]);
    }

    public function getOrders(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);
        $phone = $customer ? $customer->phone : ($request->query('phone') ?: '+9647701234567');

        $orders = Order::where('customer_phone', $phone)
            ->with(['items.product', 'driver', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $orders, 'orders' => $orders]);
    }

    public function getPersonalizedProducts(Request $request): JsonResponse
    {
        $limit = (int)$request->query('limit', 8);
        $products = Product::where('is_best_seller', true)
            ->orWhere('is_fresh_pick', true)
            ->limit($limit)
            ->get();

        return response()->json(['success' => true, 'data' => $products]);
    }
}
