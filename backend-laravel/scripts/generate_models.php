<?php

$models = [
    'Warehouse' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'city', 'latitude', 'longitude',
        'delivery_radius_km', 'min_order_iqd', 'delivery_fee_iqd', 'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'delivery_radius_km' => 'integer',
        'min_order_iqd' => 'integer',
        'delivery_fee_iqd' => 'integer',
        'is_active' => 'boolean',
    ];

    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}
PHP,

    'Category' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
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
PHP,

    'Brand' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'logo_url', 'bg_color_hex', 'is_featured_grid', 'sort_order',
    ];

    protected $casts = [
        'is_featured_grid' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
PHP,

    'CountryOrigin' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryOrigin extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'name_en', 'name_ckb', 'name_ar', 'flag_asset', 'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
PHP,

    'Product' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'external_erp_id', 'barcode',
        'title_en', 'title_ckb', 'title_ar', 'normalized_search_index',
        'description_en', 'description_ckb', 'description_ar',
        'unit_text', 'storage_temp',
        'original_price_iqd', 'discounted_price_iqd', 'discount_percentage',
        'image_url', 'is_best_seller', 'is_fresh_pick', 'is_top_saver',
        'brand_id', 'category_id', 'country_origin_id', 'last_synced_at',
    ];

    protected $casts = [
        'original_price_iqd' => 'integer',
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
}
PHP,

    'WarehouseStock' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarehouseStock extends Model
{
    protected $fillable = [
        'warehouse_id', 'product_id', 'stock_quantity', 'reserved_quantity', 'low_stock_threshold',
    ];

    protected $casts = [
        'stock_quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
PHP,

    'StockMovement' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'warehouse_id', 'product_id', 'order_id', 'movement_type',
        'quantity_before', 'quantity_change', 'quantity_after',
        'reference_note', 'created_at',
    ];

    protected $casts = [
        'quantity_before' => 'integer',
        'quantity_change' => 'integer',
        'quantity_after' => 'integer',
        'created_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
PHP,

    'CampaignBanner' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignBanner extends Model
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
PHP,

    'Customer' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'phone', 'name', 'preferred_language', 'api_token',
    ];

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
PHP,

    'CustomerAddress' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_id', 'title', 'city', 'neighborhood',
        'street', 'building', 'landmark', 'latitude', 'longitude', 'is_default',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_default' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
PHP,

    'Coupon' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'title_en', 'title_ckb', 'title_ar',
        'description_en', 'description_ckb', 'description_ar',
        'discount_type', 'discount_value', 'max_discount_iqd',
        'min_order_subtotal_iqd', 'first_order_only',
        'applicable_category_ids', 'applicable_brand_ids',
        'exclude_discounted_items', 'usage_limit_global',
        'usage_limit_per_customer', 'current_usage_count',
        'starts_at', 'expires_at', 'is_active',
    ];

    protected $casts = [
        'discount_value' => 'integer',
        'max_discount_iqd' => 'integer',
        'min_order_subtotal_iqd' => 'integer',
        'first_order_only' => 'boolean',
        'applicable_category_ids' => 'array',
        'applicable_brand_ids' => 'array',
        'exclude_discounted_items' => 'boolean',
        'usage_limit_global' => 'integer',
        'usage_limit_per_customer' => 'integer',
        'current_usage_count' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }
}
PHP,

    'CouponRedemption' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'coupon_id', 'order_id', 'customer_phone', 'discount_applied_iqd', 'redeemed_at',
    ];

    protected $casts = [
        'discount_applied_iqd' => 'integer',
        'redeemed_at' => 'datetime',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
PHP,

    'Driver' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'full_name', 'phone', 'vehicle_type', 'plate_number',
        'warehouse_id', 'status', 'cash_in_hand_iqd',
        'average_rating', 'total_ratings_count',
    ];

    protected $casts = [
        'cash_in_hand_iqd' => 'integer',
        'average_rating' => 'float',
        'total_ratings_count' => 'integer',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function ledgers()
    {
        return $this->hasMany(DriverCashLedger::class);
    }
}
PHP,

    'DriverCashLedger' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverCashLedger extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'driver_id', 'order_id', 'transaction_type', 'amount_iqd',
        'balance_after_iqd', 'receipt_reference', 'created_at',
    ];

    protected $casts = [
        'amount_iqd' => 'integer',
        'balance_after_iqd' => 'integer',
        'created_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
PHP,

    'Order' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'order_number', 'idempotency_key',
        'customer_id', 'customer_phone', 'warehouse_id',
        'address_snapshot', 'subtotal_iqd', 'discount_total_iqd',
        'delivery_fee_iqd', 'coupon_code', 'coupon_discount_iqd',
        'total_iqd', 'payment_method', 'payment_status', 'order_status',
        'driver_id', 'assigned_driver_name', 'assigned_driver_phone',
        'estimated_delivery_minutes', 'is_packed', 'packed_items',
        'placed_at', 'packing_at', 'out_for_delivery_at', 'delivered_at',
    ];

    protected $casts = [
        'address_snapshot' => 'array',
        'subtotal_iqd' => 'integer',
        'discount_total_iqd' => 'integer',
        'delivery_fee_iqd' => 'integer',
        'coupon_discount_iqd' => 'integer',
        'total_iqd' => 'integer',
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
}
PHP,

    'OrderItem' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'unit_price_iqd',
        'total_iqd', 'product_snapshot', 'is_packed',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price_iqd' => 'integer',
        'total_iqd' => 'integer',
        'product_snapshot' => 'array',
        'is_packed' => 'boolean',
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
PHP,

    'Notification' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'customer_id', 'customer_phone', 'order_id', 'type',
        'title_en', 'title_ckb', 'title_ar',
        'body_en', 'body_ckb', 'body_ar', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
PHP,

    'OrderRating' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRating extends Model
{
    protected $fillable = [
        'order_id', 'customer_id', 'customer_phone', 'driver_id',
        'overall_store_stars', 'driver_stars', 'feedback_tags', 'comment',
    ];

    protected $casts = [
        'overall_store_stars' => 'integer',
        'driver_stars' => 'integer',
        'feedback_tags' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
PHP,

    'PaymentConfig' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentConfig extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'is_enabled', 'credentials',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'credentials' => 'array',
    ];
}
PHP,

    'ErpSyncLog' => <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErpSyncLog extends Model
{
    protected $fillable = [
        'source', 'synced_skus_count', 'status', 'details',
    ];

    protected $casts = [
        'synced_skus_count' => 'integer',
        'details' => 'array',
    ];
}
PHP,
];

foreach ($models as $name => $code) {
    $path = "c:/Users/zakar/BazMart/backend-laravel/app/Models/{$name}.php";
    file_put_contents($path, $code);
    echo "Wrote Model {$name}.php\n";
}

