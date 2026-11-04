<?php

namespace App\Models;

use App\Models\BaseModel;

class WarehouseStock extends BaseModel
{
    protected $fillable = [
        'warehouse_id', 'product_id', 'stock_quantity', 'reserved_quantity', 'low_stock_threshold', 'safety_stock_buffer',
    ];

    protected $casts = [
        'stock_quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'safety_stock_buffer' => 'integer',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}