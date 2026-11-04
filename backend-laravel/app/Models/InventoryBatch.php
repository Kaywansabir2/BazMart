<?php

namespace App\Models;

use App\Models\BaseModel;
use Carbon\Carbon;

class InventoryBatch extends BaseModel
{
    protected $fillable = [
        'batch_number', 'warehouse_id', 'product_id', 'purchase_order_id',
        'initial_quantity', 'remaining_quantity', 'unit_cost_iqd',
        'production_date', 'expiry_date', 'status',
    ];

    protected $casts = [
        'initial_quantity' => 'integer',
        'remaining_quantity' => 'integer',
        'unit_cost_iqd' => 'integer',
        'production_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function getDaysUntilExpiryAttribute(): int
    {
        return (int)Carbon::now()->startOfDay()->diffInDays(Carbon::parse($this->expiry_date)->startOfDay(), false);
    }
}

