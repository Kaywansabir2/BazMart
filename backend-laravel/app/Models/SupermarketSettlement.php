<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;

class SupermarketSettlement extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'settlement_number',
        'warehouse_id',
        'period_date',
        'orders_count',
        'total_shelf_sales_iqd',
        'bazmart_commission_3pct_iqd',
        'supermarket_net_payable_97pct_iqd',
        'status',
        'settled_at',
    ];

    protected $casts = [
        'orders_count' => 'integer',
        'total_shelf_sales_iqd' => 'integer',
        'bazmart_commission_3pct_iqd' => 'integer',
        'supermarket_net_payable_97pct_iqd' => 'integer',
        'settled_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}

