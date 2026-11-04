<?php

namespace App\Models;

use App\Models\BaseModel;

class Category extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'slug', 'name_en', 'name_ckb', 'name_ar',
        'image_url', 'sort_order', 'parent_id',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}