<?php

namespace App\Models;

use App\Models\BaseModel;

class OrderItem extends BaseModel
{
    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'unit_original_price_iqd',
        'unit_price_iqd', 'unit_cost_price_iqd', 'total_iqd', 'total_cost_iqd',
        'line_promo_discount_iqd', 'line_gross_profit_iqd', 'line_margin_percentage',
        'product_snapshot', 'is_packed',
        'pos_shelf_unit_price_iqd', 'line_commission_iqd', 'line_supermarket_payable_iqd',
        'is_substituted', 'substituted_product_id', 'substitution_reason', 'original_quantity',
        'returned_quantity', 'return_reason',
    ];

    protected $hidden = [
        'unit_cost_price_iqd',
        'total_cost_iqd',
        'line_gross_profit_iqd',
        'line_margin_percentage',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_original_price_iqd' => 'integer',
        'unit_price_iqd' => 'integer',
        'unit_cost_price_iqd' => 'integer',
        'total_iqd' => 'integer',
        'total_cost_iqd' => 'integer',
        'line_promo_discount_iqd' => 'integer',
        'line_gross_profit_iqd' => 'integer',
        'line_margin_percentage' => 'float',
        'product_snapshot' => 'array',
        'is_packed' => 'boolean',
        'is_substituted' => 'boolean',
        'pos_shelf_unit_price_iqd' => 'integer',
        'line_commission_iqd' => 'integer',
        'line_supermarket_payable_iqd' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}