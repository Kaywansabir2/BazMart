<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Validation\ValidationException;

class CouponEngineService
{
    public function getAvailableCoupons(?string $customerPhone = null): array
    {
        $now = now();
        $cleanPhone = $customerPhone ? PhoneAuthService::normalizeIraqiPhone($customerPhone) : null;

        $coupons = Coupon::where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', $now);
            })
            ->orderBy('min_order_subtotal_iqd', 'asc')
            ->get();

        $available = [];
        foreach ($coupons as $c) {
            if ($c->usage_limit_global && $c->current_usage_count >= $c->usage_limit_global) {
                continue;
            }

            if ($cleanPhone) {
                $userRedemptions = CouponRedemption::where('coupon_id', $c->id)
                    ->where('customer_phone', $cleanPhone)
                    ->count();

                if ($userRedemptions >= $c->usage_limit_per_customer) {
                    continue;
                }

                if ($c->first_order_only) {
                    $pastOrders = Order::where('customer_phone', $cleanPhone)
                        ->whereNotIn('order_status', ['CANCELLED'])
                        ->count();
                    if ($pastOrders > 0) {
                        continue;
                    }
                }
            }

            $available[] = [
                'id' => $c->id,
                'code' => $c->code,
                'titleEn' => $c->title_en,
                'titleCkb' => $c->title_ckb,
                'titleAr' => $c->title_ar,
                'descriptionEn' => $c->description_en,
                'descriptionCkb' => $c->description_ckb,
                'descriptionAr' => $c->description_ar,
                'discountType' => $c->discount_type,
                'discountValue' => $c->discount_value,
                'maxDiscountIqd' => $c->max_discount_iqd,
                'minOrderSubtotalIqd' => $c->min_order_subtotal_iqd,
                'firstOrderOnly' => (bool)$c->first_order_only,
                'expiresAt' => $c->expires_at,
            ];
        }

        return $available;
    }

    public function validateCoupon(string $code, array $cartItems, ?string $customerPhone = null, ?string $warehouseId = null): array
    {
        $cleanCode = strtoupper(trim(LinguisticNormalizerService::normalizeEasternNumerals($code)));
        $cleanPhone = $customerPhone ? PhoneAuthService::normalizeIraqiPhone($customerPhone) : null;

        $coupon = Coupon::where('code', $cleanCode)->first();
        if (!$coupon) {
            throw ValidationException::withMessages([
                'coupon' => "Promo code \"{$cleanCode}\" does not exist.",
            ]);
        }

        if (!$coupon->is_active) {
            throw ValidationException::withMessages([
                'coupon' => "Promo code \"{$cleanCode}\" is no longer active.",
            ]);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'coupon' => "Promo code \"{$cleanCode}\" has expired.",
            ]);
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw ValidationException::withMessages([
                'coupon' => "Promo code \"{$cleanCode}\" is not valid yet.",
            ]);
        }

        if ($coupon->usage_limit_global && $coupon->current_usage_count >= $coupon->usage_limit_global) {
            throw ValidationException::withMessages([
                'coupon' => "Promo code \"{$cleanCode}\" has reached its maximum total redemptions.",
            ]);
        }

        if ($cleanPhone) {
            $userRedemptions = CouponRedemption::where('coupon_id', $coupon->id)
                ->where('customer_phone', $cleanPhone)
                ->count();
            if ($userRedemptions >= $coupon->usage_limit_per_customer) {
                throw ValidationException::withMessages([
                    'coupon' => "You have already used promo code \"{$cleanCode}\" the maximum number of times.",
                ]);
            }

            if ($coupon->first_order_only) {
                $pastOrders = Order::where('customer_phone', $cleanPhone)
                    ->whereNotIn('order_status', ['CANCELLED'])
                    ->count();
                if ($pastOrders > 0) {
                    throw ValidationException::withMessages([
                        'coupon' => "Promo code \"{$cleanCode}\" is valid for new customers on their first order only.",
                    ]);
                }
            }
        }

        $productIds = array_column($cartItems, 'productId');
        $products = Product::whereIn('id', $productIds)->with(['category', 'brand'])->get()->keyBy('id');

        $parseList = function ($val) {
            if (!$val) return [];
            if (is_array($val)) return array_map('strtolower', $val);
            $trimmed = trim($val);
            if (str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']')) {
                $decoded = json_decode($trimmed, true);
                if (is_array($decoded)) return array_map('strtolower', $decoded);
            }
            return array_map('trim', array_map('strtolower', explode(',', $trimmed)));
        };

        $allowedCats = $parseList($coupon->applicable_category_ids);
        $allowedBrands = $parseList($coupon->applicable_brand_ids);

        $subtotalIqd = 0;
        $eligibleSubtotalIqd = 0;

        foreach ($cartItems as $item) {
            $pid = $item['productId'] ?? null;
            $qty = (int)($item['quantity'] ?? 1);
            if (!$pid || !isset($products[$pid])) continue;

            $prod = $products[$pid];
            $unitPrice = $prod->discounted_price_iqd ?? $prod->original_price_iqd;
            $itemTotal = $unitPrice * $qty;
            $subtotalIqd += $itemTotal;

            $isCategoryAllowed = true;
            if (!empty($allowedCats)) {
                $catId = strtolower($prod->category_id ?? '');
                $catSlug = strtolower($prod->category->slug ?? '');
                $isCategoryAllowed = in_array($catId, $allowedCats) || in_array($catSlug, $allowedCats);
            }

            $isBrandAllowed = true;
            if (!empty($allowedBrands)) {
                $bId = strtolower($prod->brand_id ?? '');
                $bName = strtolower($prod->brand->name ?? '');
                $isBrandAllowed = in_array($bId, $allowedBrands) || in_array($bName, $allowedBrands);
            }

            $isDiscountExcluded = false;
            if ($coupon->exclude_discounted_items && $prod->discounted_price_iqd !== null && $prod->discounted_price_iqd < $prod->original_price_iqd) {
                $isDiscountExcluded = true;
            }

            if ($isCategoryAllowed && $isBrandAllowed && !$isDiscountExcluded) {
                $eligibleSubtotalIqd += $itemTotal;
            }
        }

        if ($subtotalIqd < $coupon->min_order_subtotal_iqd) {
            throw ValidationException::withMessages([
                'coupon' => "Minimum order subtotal of IQD " . number_format($coupon->min_order_subtotal_iqd) . " required to apply {$coupon->code}.",
            ]);
        }

        if ($eligibleSubtotalIqd === 0 && (!empty($allowedCats) || !empty($allowedBrands) || $coupon->exclude_discounted_items)) {
            throw ValidationException::withMessages([
                'coupon' => "No items in your cart are eligible for coupon \"{$coupon->code}\" (already discounted items or non-applicable categories).",
            ]);
        }

        $discountIqd = 0;
        if ($coupon->discount_type === 'PERCENTAGE') {
            $rawDiscount = round(($eligibleSubtotalIqd * $coupon->discount_value) / 100);
            $discountIqd = $coupon->max_discount_iqd ? min($rawDiscount, $coupon->max_discount_iqd) : $rawDiscount;
        } elseif ($coupon->discount_type === 'FIXED_IQD') {
            $discountIqd = min($coupon->discount_value, $eligibleSubtotalIqd > 0 ? $eligibleSubtotalIqd : $subtotalIqd);
        } elseif ($coupon->discount_type === 'FREE_DELIVERY') {
            $discountIqd = 500;
        }

        $discountIqd = (int)round($discountIqd);
        $newTotalIqd = (int)max(0, $subtotalIqd - $discountIqd);

        return [
            'isValid' => true,
            'couponId' => $coupon->id,
            'code' => $coupon->code,
            'titleEn' => $coupon->title_en,
            'titleCkb' => $coupon->title_ckb,
            'titleAr' => $coupon->title_ar,
            'discountType' => $coupon->discount_type,
            'discountValue' => (int)$coupon->discount_value,
            'maxDiscountIqd' => $coupon->max_discount_iqd ? (int)$coupon->max_discount_iqd : null,
            'couponDiscountIqd' => $discountIqd,
            'subtotalIqd' => $subtotalIqd,
            'newTotalIqd' => $newTotalIqd,
            'messageEn' => "Code {$coupon->code} applied! You saved IQD " . number_format($discountIqd),
            'messageCkb' => "کۆدی {$coupon->code} جێبەجێکرا! " . number_format($discountIqd) . " د.ع داشکاندن کرا",
            'messageAr' => "تم تطبيق الكوبون {$coupon->code}! تم خصم " . number_format($discountIqd) . " د.ع",
        ];
    }
}
