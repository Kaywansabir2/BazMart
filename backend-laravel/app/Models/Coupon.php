<?php

namespace App\Models;

use App\Models\BaseModel;

class Coupon extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'title_en', 'title_ckb', 'title_ar',
        'description_en', 'description_ckb', 'description_ar',
        'discount_type', 'discount_value', 'max_discount_iqd',
        'min_order_subtotal_iqd', 'first_order_only',
        'applicable_category_ids', 'applicable_brand_ids',
        'exclude_discounted_items', 'usage_limit_global',
        'usage_limit_per_customer', 'current_usage_count',
        'starts_at', 'expires_at', 'is_active',
    ];

    protected $casts = [
        'discount_value' => 'integer',
        'max_discount_iqd' => 'integer',
        'min_order_subtotal_iqd' => 'integer',
        'first_order_only' => 'boolean',
        'applicable_category_ids' => 'array',
        'applicable_brand_ids' => 'array',
        'exclude_discounted_items' => 'boolean',
        'usage_limit_global' => 'integer',
        'usage_limit_per_customer' => 'integer',
        'current_usage_count' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }
}