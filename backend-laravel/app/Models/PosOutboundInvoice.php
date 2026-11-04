<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosOutboundInvoice extends Model
{
    protected $table = 'pos_outbound_invoices';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'pos_invoice_number',
        'order_id',
        'warehouse_id',
        'items_payload',
        'gross_shelf_total_iqd',
        'bazmart_commission_3pct_iqd',
        'supermarket_net_97pct_iqd',
        'sync_status',
        'pos_terminal_ref',
        'synced_at',
    ];

    protected $casts = [
        'items_payload' => 'array',
        'gross_shelf_total_iqd' => 'integer',
        'bazmart_commission_3pct_iqd' => 'integer',
        'supermarket_net_97pct_iqd' => 'integer',
        'synced_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }
}

