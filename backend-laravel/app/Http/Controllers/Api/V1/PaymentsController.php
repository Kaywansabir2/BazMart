<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PaymentConfig;
use Illuminate\Http\JsonResponse;

class PaymentsController extends Controller
{
    public function getMethods(): JsonResponse
    {
        $methods = PaymentConfig::where('is_enabled', true)->get();
        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }
}

