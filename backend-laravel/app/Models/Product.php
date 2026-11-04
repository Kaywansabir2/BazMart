<?php

namespace App\Models;

use App\Models\BaseModel;

class Product extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'external_erp_id', 'barcode',
        'pos_item_code', 'pos_shelf_price_iqd', 'pos_promo_price_iqd', 'pos_parity_verified', 'commission_rate_percent',
        'title_en', 'title_ckb', 'title_ar', 'normalized_search_index',
        'description_en', 'description_ckb', 'description_ar',
        'unit_text', 'storage_temp', 'aisle_location', 'unit_weight_grams', 'cold_chain_zone',
        'original_price_iqd', 'cost_price_iqd', 'min_margin_percent_threshold', 'supplier_name', 'tax_or_customs_iqd',
        'discounted_price_iqd', 'discount_percentage',
        'image_url', 'is_best_seller', 'is_fresh_pick', 'is_top_saver',
        'brand_id', 'category_id', 'country_origin_id', 'last_synced_at',
    ];

    protected $hidden = [
        'cost_price_iqd',
        'min_margin_percent_threshold',
        'supplier_name',
        'tax_or_customs_iqd',
    ];

    protected $casts = [
        'original_price_iqd' => 'integer',
        'pos_shelf_price_iqd' => 'integer',
        'pos_promo_price_iqd' => 'integer',
        'pos_parity_verified' => 'boolean',
        'commission_rate_percent' => 'float',
        'cost_price_iqd' => 'integer',
        'min_margin_percent_threshold' => 'integer',
        'tax_or_customs_iqd' => 'integer',
        'discounted_price_iqd' => 'integer',
        'discount_percentage' => 'integer',
        'is_best_seller' => 'boolean',
        'is_fresh_pick' => 'boolean',
        'is_top_saver' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function countryOrigin()
    {
        return $this->belongsTo(CountryOrigin::class);
    }

    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function batches()
    {
        return $this->hasMany(InventoryBatch::class);
    }

    public function getActiveSellingPriceIqdAttribute(): int
    {
        return (int)($this->discounted_price_iqd ?? $this->original_price_iqd);
    }

    public function getActiveUnitProfitIqdAttribute(): int
    {
        return $this->active_selling_price_iqd - (int)$this->cost_price_iqd;
    }

    public function getActiveMarginPercentAttribute(): float
    {
        $active = $this->active_selling_price_iqd;
        return $active > 0 ? round(($this->active_unit_profit_iqd / $active) * 100, 2) : 0.0;
    }
}