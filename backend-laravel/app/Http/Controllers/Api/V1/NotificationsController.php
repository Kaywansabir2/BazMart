<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\PhoneAuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationsController extends Controller
{
    public function getNotifications(Request $request): JsonResponse
    {
        $phone = $request->query('phone') ?: $request->header('x-customer-phone');
        $query = Notification::orderBy('created_at', 'desc');

        if ($phone) {
            $norm = PhoneAuthService::normalizeIraqiPhone($phone);
            $query->where(function ($q) use ($norm) {
                $q->where('customer_phone', $norm)
                    ->orWhereNull('customer_phone');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        $notifications = $query->limit(50)->get();
        $unreadCount = (clone $query)->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markRead(string $id): JsonResponse
    {
        $notif = Notification::find($id);
        if ($notif) {
            $notif->update(['is_read' => true]);
        }
        return response()->json(['success' => true]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        $query = Notification::query();
        if ($phone) {
            $norm = PhoneAuthService::normalizeIraqiPhone($phone);
            $query->where('customer_phone', $norm);
        }
        $query->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    public function adminBroadcast(Request $request): JsonResponse
    {
        $data = $request->validate([
            'titleEn' => 'required|string',
            'bodyEn' => 'required|string',
        ]);

        $notif = Notification::create([
            'type' => $request->input('type', 'PROMO_OFFER'),
            'title_en' => $data['titleEn'],
            'title_ckb' => $request->input('titleCkb'),
            'title_ar' => $request->input('titleAr'),
            'body_en' => $data['bodyEn'],
            'body_ckb' => $request->input('bodyCkb'),
            'body_ar' => $request->input('bodyAr'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'data' => $notif], 201);
    }
}

