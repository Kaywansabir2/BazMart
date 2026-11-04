<?php

namespace App\Models;

use App\Models\BaseModel;

class CustomerAddress extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_id', 'title', 'city', 'neighborhood',
        'street', 'building', 'landmark', 'latitude', 'longitude', 'is_default',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_default' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}