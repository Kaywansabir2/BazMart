<?php

namespace App\Models;

use App\Models\BaseModel;

class PaymentConfig extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'is_enabled', 'credentials',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'credentials' => 'array',
    ];
}