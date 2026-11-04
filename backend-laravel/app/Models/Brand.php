<?php

namespace App\Models;

use App\Models\BaseModel;

class Brand extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'logo_url', 'bg_color_hex', 'is_featured_grid', 'sort_order',
    ];

    protected $casts = [
        'is_featured_grid' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}