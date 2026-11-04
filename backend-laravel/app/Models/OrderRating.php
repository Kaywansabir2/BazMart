<?php

namespace App\Models;

use App\Models\BaseModel;

class OrderRating extends BaseModel
{
    protected $fillable = [
        'order_id', 'customer_id', 'customer_phone', 'driver_id',
        'overall_store_stars', 'driver_stars', 'feedback_tags', 'comment',
    ];

    protected $casts = [
        'overall_store_stars' => 'integer',
        'driver_stars' => 'integer',
        'feedback_tags' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}