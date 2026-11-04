<?php

namespace App\Models;

use App\Models\BaseModel;

class CampaignBanner extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'type', 'title_en', 'title_ckb', 'title_ar',
        'subtitle', 'badge_text', 'bg_color_hex', 'image_url',
        'linked_category_id', 'linked_brand_id', 'linked_product_ids',
        'sort_order', 'is_active',
    ];

    protected $casts = [
        'linked_product_ids' => 'array',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}