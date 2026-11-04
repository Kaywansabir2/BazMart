<?php

namespace App\Models;

use App\Models\BaseModel;

class FinancialLedgerEntry extends BaseModel
{
    protected $fillable = [
        'entry_number',
        'warehouse_id',
        'order_id',
        'product_id',
        'entry_type',
        'direction',
        'amount_iqd',
        'description',
        'recorded_at',
    ];

    protected $casts = [
        'amount_iqd' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

