<?php

namespace App\Models;

use App\Models\BaseModel;

class Supplier extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'contact_person', 'phone', 'email',
        'city', 'country_code', 'lead_time_days', 'payment_terms',
        'total_purchased_iqd', 'is_active',
    ];

    protected $casts = [
        'lead_time_days' => 'integer',
        'total_purchased_iqd' => 'integer',
        'is_active' => 'boolean',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}

