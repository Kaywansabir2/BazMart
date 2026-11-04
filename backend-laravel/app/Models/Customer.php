<?php

namespace App\Models;

use App\Models\BaseModel;

class Customer extends BaseModel
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'phone',
        'name',
        'email',
        'preferred_language',
        'is_onboarded',
        'wallet_balance_iqd',
        'referral_code',
        'status',
        'last_login_at',
        'api_token',
    ];

    protected $casts = [
        'is_onboarded' => 'boolean',
        'wallet_balance_iqd' => 'integer',
        'last_login_at' => 'datetime',
    ];

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class)->orderBy('created_at', 'desc');
    }

    public function favorites()
    {
        return $this->hasMany(CustomerFavorite::class);
    }

    public function favoriteProducts()
    {
        return $this->belongsToMany(Product::class, 'customer_favorites', 'customer_id', 'product_id')->withTimestamps();
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class)->orderBy('created_at', 'desc');
    }

    public function stockAlerts()
    {
        return $this->hasMany(StockAlertSubscription::class);
    }
}
