<?php

namespace App\Models;

use App\Models\BaseModel;

class ErpSyncLog extends BaseModel
{
    protected $fillable = [
        'source', 'synced_skus_count', 'status', 'details',
    ];

    protected $casts = [
        'synced_skus_count' => 'integer',
        'details' => 'array',
    ];
}