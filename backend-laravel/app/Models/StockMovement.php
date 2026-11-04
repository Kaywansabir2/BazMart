<?php

namespace App\Models;

use App\Models\BaseModel;

class StockMovement extends BaseModel
{
    public $timestamps = false;

    protected $fillable = [
        'warehouse_id', 'product_id', 'order_id', 'movement_type',
        'quantity_before', 'quantity_change', 'quantity_after',
        'reference_note', 'created_at',
    ];

    protected $casts = [
        'quantity_before' => 'integer',
        'quantity_change' => 'integer',
        'quantity_after' => 'integer',
        'created_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}