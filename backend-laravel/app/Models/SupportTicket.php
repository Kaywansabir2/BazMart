<?php

namespace App\Models;

use App\Models\BaseModel;

class SupportTicket extends BaseModel
{
    protected $fillable = [
        'ticket_number',
        'order_id',
        'customer_id',
        'issue_category',
        'affected_order_item_ids',
        'customer_note',
        'requested_refund_iqd',
        'status',
        'admin_resolution_note',
        'resolved_at',
    ];

    protected $casts = [
        'affected_order_item_ids' => 'array',
        'requested_refund_iqd' => 'integer',
        'resolved_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}

