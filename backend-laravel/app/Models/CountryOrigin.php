<?php

namespace App\Models;

use App\Models\BaseModel;

class CountryOrigin extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'name_en', 'name_ckb', 'name_ar', 'flag_asset', 'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}