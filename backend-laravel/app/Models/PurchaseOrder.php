<?php

namespace App\Models;

use App\Models\BaseModel;

class PurchaseOrder extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'po_number', 'supplier_id', 'warehouse_id',
        'status', 'total_cost_iqd', 'expected_delivery_date',
        'received_at', 'notes',
    ];

    protected $casts = [
        'total_cost_iqd' => 'integer',
        'expected_delivery_date' => 'date',
        'received_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function batches()
    {
        return $this->hasMany(InventoryBatch::class);
    }
}

