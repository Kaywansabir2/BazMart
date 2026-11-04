<?php

namespace App\Models;

use App\Models\BaseModel;

class WalletTransaction extends BaseModel
{
    protected $fillable = [
        'transaction_number',
        'customer_id',
        'order_id',
        'type',
        'direction',
        'amount_iqd',
        'balance_after_iqd',
        'description_en',
        'description_ckb',
        'description_ar',
    ];

    protected $casts = [
        'amount_iqd' => 'integer',
        'balance_after_iqd' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

