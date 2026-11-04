<?php

namespace App\Models;

use App\Models\BaseModel;

class DriverCashLedger extends BaseModel
{
    public $timestamps = false;

    protected $fillable = [
        'driver_id', 'order_id', 'transaction_type', 'amount_iqd',
        'balance_after_iqd', 'receipt_reference', 'created_at',
    ];

    protected $casts = [
        'amount_iqd' => 'integer',
        'balance_after_iqd' => 'integer',
        'created_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}