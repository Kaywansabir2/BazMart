<?php

namespace App\Models;

use App\Models\BaseModel;

class Order extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'order_number', 'idempotency_key',
        'customer_id', 'customer_phone', 'warehouse_id',
        'address_snapshot', 'gross_merchandise_value_iqd', 'item_promo_discount_total_iqd',
        'subtotal_iqd', 'total_cogs_iqd', 'gross_profit_before_coupon_iqd', 'discount_total_iqd',
        'delivery_fee_iqd', 'driver_delivery_payout_iqd', 'coupon_code', 'coupon_discount_iqd',
        'total_iqd', 'net_profit_iqd', 'profit_margin_percentage', 'payment_method', 'payment_status', 'order_status',
        'unavailable_item_preference', 'rider_tip_iqd', 'delivery_dropoff_options',
        'wallet_amount_used_iqd', 'net_cod_payable_iqd',
        'pos_shelf_subtotal_iqd', 'commission_rate_percent', 'bazmart_commission_iqd', 'supermarket_payable_iqd', 'bazmart_net_profit_iqd',
        'delivery_slot_type', 'scheduled_slot_label',
        'has_partial_returns', 'returned_amount_iqd',
        'physical_cash_collectible_iqd', 'wallet_small_change_credit_iqd', 'wallet_change_credit_ref',
        'total_weight_kg', 'required_vehicle_type',
        'frozen_bags_count', 'chilled_bags_count', 'ambient_bags_count',
        'driver_id', 'assigned_driver_name', 'assigned_driver_phone',
        'estimated_delivery_minutes', 'is_packed', 'packed_items',
        'placed_at', 'packing_at', 'out_for_delivery_at', 'delivered_at',
    ];

    protected $hidden = [
        'gross_merchandise_value_iqd',
        'item_promo_discount_total_iqd',
        'total_cogs_iqd',
        'gross_profit_before_coupon_iqd',
        'driver_delivery_payout_iqd',
        'net_profit_iqd',
        'profit_margin_percentage',
    ];

    protected $casts = [
        'address_snapshot' => 'array',
        'gross_merchandise_value_iqd' => 'integer',
        'item_promo_discount_total_iqd' => 'integer',
        'subtotal_iqd' => 'integer',
        'total_cogs_iqd' => 'integer',
        'gross_profit_before_coupon_iqd' => 'integer',
        'discount_total_iqd' => 'integer',
        'delivery_fee_iqd' => 'integer',
        'driver_delivery_payout_iqd' => 'integer',
        'coupon_discount_iqd' => 'integer',
        'total_iqd' => 'integer',
        'rider_tip_iqd' => 'integer',
        'wallet_amount_used_iqd' => 'integer',
        'net_cod_payable_iqd' => 'integer',
        'pos_shelf_subtotal_iqd' => 'integer',
        'commission_rate_percent' => 'float',
        'bazmart_commission_iqd' => 'integer',
        'supermarket_payable_iqd' => 'integer',
        'bazmart_net_profit_iqd' => 'integer',
        'delivery_dropoff_options' => 'array',
        'net_profit_iqd' => 'integer',
        'profit_margin_percentage' => 'float',
        'is_packed' => 'boolean',
        'packed_items' => 'array',
        'placed_at' => 'datetime',
        'packing_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function rating()
    {
        return $this->hasOne(OrderRating::class);
    }

    public function financialLedgerEntries()
    {
        return $this->hasMany(FinancialLedgerEntry::class);
    }

    public function ledgerEntries()
    {
        return $this->hasMany(FinancialLedgerEntry::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function outboundInvoice()
    {
        return $this->hasOne(PosOutboundInvoice::class, 'order_id');
    }
}