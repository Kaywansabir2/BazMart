<?php

namespace App\Models;

use App\Models\BaseModel;

class StockAlertSubscription extends BaseModel
{
    protected $fillable = [
        'customer_id',
        'customer_phone',
        'product_id',
        'warehouse_id',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}

