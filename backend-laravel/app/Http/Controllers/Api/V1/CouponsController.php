<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CouponEngineService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CouponsController extends Controller
{
    protected CouponEngineService $couponService;

    public function __construct(CouponEngineService $couponService)
    {
        $this->couponService = $couponService;
    }

    public function getAvailable(Request $request): JsonResponse
    {
        $phone = $request->query('phone');
        $coupons = $this->couponService->getAvailableCoupons($phone);
        return response()->json(['success' => true, 'data' => $coupons]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $code = $request->input('code');
        $items = $request->input('cartItems') ?? $request->input('items');
        if (!$code || !is_array($items)) {
            return response()->json(['success' => false, 'message' => 'Coupon code and cart items are required.'], 422);
        }

        $phone = $request->input('customerPhone') ?? $request->input('phone');
        $warehouseId = $request->input('warehouseId');

        $result = $this->couponService->validateCoupon(
            $code,
            $items,
            $phone,
            $warehouseId
        );

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function getAllAdmin(): JsonResponse
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $coupons]);
    }

    public function createAdmin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'title_en' => 'required|string',
            'discount_type' => 'required|string',
            'discount_value' => 'required|integer',
        ]);

        $coupon = Coupon::create(array_merge($request->all(), [
            'id' => 'cpn-' . strtolower($data['code']),
            'code' => strtoupper($data['code']),
        ]));

        return response()->json(['success' => true, 'data' => $coupon], 201);
    }

    public function updateAdmin(Request $request, string $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Coupon not found'], 404);
        }

        $coupon->update($request->all());
        return response()->json(['success' => true, 'data' => $coupon]);
    }

    public function deleteAdmin(string $id): JsonResponse
    {
        Coupon::destroy($id);
        return response()->json(['success' => true]);
    }
}

