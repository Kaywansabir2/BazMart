<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Product;
use App\Models\StockAlertSubscription;

class RestockNotificationService
{
    public static function triggerForProduct(string $productId, string $warehouseId): int
    {
        $product = Product::find($productId);
        if (!$product) return 0;

        $subs = StockAlertSubscription::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->where('status', 'WAITING')
            ->get();

        if ($subs->isEmpty()) return 0;

        $count = 0;
        foreach ($subs as $sub) {
            $sub->status = 'NOTIFIED';
            $sub->save();

            Notification::create([
                'title_en' => '🎉 Back in Stock!',
                'title_ckb' => '🎉 کاڵاکە گەڕایەوە کۆگا!',
                'title_ar' => '🎉 متوفر مجدداً!',
                'body_en' => "{$product->title_en} is back in stock at BazMart. Order now before it runs out!",
                'body_ckb' => "«{$product->title_ckb}» ئێستا لە بازمارت بەردەستە. دەستبەجێ داوای بکە!",
                'body_ar' => "منتج «{$product->title_ar}» متوفر الآن في بازمارت. اطلبه الآن قبل نفاد الكمية!",
                'type' => 'BACK_IN_STOCK',
                'target_role' => 'CUSTOMER',
                'customer_phone' => $sub->customer_phone,
                'data' => json_encode(['productId' => $product->id]),
            ]);
            $count++;
        }

        return $count;
    }
}

