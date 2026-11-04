<?php

namespace App\Models;

use App\Models\BaseModel;

class Notification extends BaseModel
{
    protected $fillable = [
        'customer_id', 'customer_phone', 'order_id', 'type',
        'title_en', 'title_ckb', 'title_ar',
        'body_en', 'body_ckb', 'body_ar', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}