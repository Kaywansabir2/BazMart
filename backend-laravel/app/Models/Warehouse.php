<?php

namespace App\Models;

use App\Models\BaseModel;

class Warehouse extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'city', 'latitude', 'longitude',
        'delivery_radius_km', 'min_order_iqd', 'delivery_fee_iqd', 'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'delivery_radius_km' => 'integer',
        'min_order_iqd' => 'integer',
        'delivery_fee_iqd' => 'integer',
        'is_active' => 'boolean',
    ];

    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}