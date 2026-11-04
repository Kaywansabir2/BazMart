<?php

namespace App\Models;

use App\Models\BaseModel;

class Driver extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'full_name', 'phone', 'vehicle_type', 'plate_number',
        'warehouse_id', 'status', 'cash_in_hand_iqd',
        'average_rating', 'total_ratings_count',
    ];

    protected $casts = [
        'cash_in_hand_iqd' => 'integer',
        'average_rating' => 'float',
        'total_ratings_count' => 'integer',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function assignedOrders()
    {
        return $this->hasMany(Order::class);
    }

    public function ledgers()
    {
        return $this->hasMany(DriverCashLedger::class);
    }
}