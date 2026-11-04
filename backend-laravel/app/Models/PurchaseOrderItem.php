<?php

namespace App\Models;

use App\Models\BaseModel;

class PurchaseOrderItem extends BaseModel
{
    protected $fillable = [
        'purchase_order_id', 'product_id', 'ordered_quantity',
        'received_quantity', 'unit_cost_iqd', 'line_total_cost_iqd',
        'batch_number', 'production_date', 'expiry_date',
    ];

    protected $casts = [
        'ordered_quantity' => 'integer',
        'received_quantity' => 'integer',
        'unit_cost_iqd' => 'integer',
        'line_total_cost_iqd' => 'integer',
        'production_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

