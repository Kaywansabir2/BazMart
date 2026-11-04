<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\PhoneAuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    protected PhoneAuthService $authService;

    public function __construct(PhoneAuthService $authService)
    {
        $this->authService = $authService;
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string']);
        $result = $this->authService->requestOtp($request->input('phone'));
        return response()->json($result);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $code = $request->input('otpCode') ?? $request->input('otp');
        if (!$code) {
            return response()->json(['success' => false, 'message' => 'OTP code is required.'], 422);
        }

        $result = $this->authService->verifyOtp(
            $request->input('phone'),
            $code
        );

        return response()->json($result);
    }

    public function completeRegistration(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'name' => 'required|string|min:2',
            'preferredLanguage' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|array',
        ]);

        $result = $this->authService->completeRegistration(
            $request->input('phone'),
            $request->input('name'),
            $request->input('email'),
            $request->input('preferredLanguage', 'en'),
            $request->input('address')
        );

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $phone = $request->header('x-customer-phone') ?: $request->input('phone');
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
            $customer = Customer::where('phone', $norm)->first();
            if ($customer) {
                $this->authService->logout($customer);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Signed out successfully. Client reset to Guest mode.',
        ]);
    }
}
