<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'admin_audit_logs';

    protected $fillable = [
        'actor_name',
        'actor_role',
        'action_type',
        'target_reference',
        'details',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}

