<?php

namespace App\Models;

use App\Models\BaseModel;

class CouponRedemption extends BaseModel
{
    public $timestamps = false;

    protected $fillable = [
        'coupon_id', 'order_id', 'customer_phone', 'discount_applied_iqd', 'redeemed_at',
    ];

    protected $casts = [
        'discount_applied_iqd' => 'integer',
        'redeemed_at' => 'datetime',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}