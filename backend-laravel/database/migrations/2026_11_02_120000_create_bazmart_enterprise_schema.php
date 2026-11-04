<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Warehouses (Dark Store Facilities)
        Schema::create('warehouses', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'erbil-central-darkstore', 'suly-main-darkstore'
            $table->string('name');
            $table->string('city');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('delivery_radius_km')->default(20);
            $table->unsignedInteger('min_order_iqd')->default(7000);
            $table->unsignedInteger('delivery_fee_iqd')->default(500);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'cat-fruit-veg'
            $table->string('slug')->index();
            $table->string('name_en');
            $table->string('name_ckb');
            $table->string('name_ar');
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->string('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Brands
        Schema::create('brands', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'brand_maggi', 'b-maggi'
            $table->string('name');
            $table->string('logo_url')->nullable();
            $table->string('bg_color_hex')->default('#FFFFFF');
            $table->boolean('is_featured_grid')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Country Origins
        Schema::create('country_origins', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'c-krd', 'c-eu'
            $table->string('code')->index(); // 'KRD', 'EU', etc.
            $table->string('name_en');
            $table->string('name_ckb');
            $table->string('name_ar');
            $table->string('flag_asset')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 5. Products (400 Master ERP-Synced SKUs)
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary(); // canonical ID e.g. 'p-alrahma'
            $table->string('external_erp_id')->unique()->index(); // 'ERP-SKU-1001'
            $table->string('barcode')->index();
            $table->string('title_en');
            $table->string('title_ckb');
            $table->string('title_ar');
            $table->text('normalized_search_index')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ckb')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('unit_text')->default('1 Pc');
            $table->string('storage_temp')->nullable(); // 'Stored at 5°', 'Ambient'
            $table->unsignedInteger('original_price_iqd');
            $table->unsignedInteger('discounted_price_iqd')->nullable();
            $table->unsignedInteger('discount_percentage')->nullable();
            $table->string('image_url');
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_fresh_pick')->default(false);
            $table->boolean('is_top_saver')->default(false);
            $table->string('brand_id');
            $table->string('category_id');
            $table->string('country_origin_id')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('country_origin_id')->references('id')->on('country_origins')->nullOnDelete();

            $table->index(['category_id', 'is_best_seller']);
            $table->index(['is_best_seller', 'is_top_saver']);
            $table->index(['is_fresh_pick']);
        });

        // 6. Warehouse Stocks (Branch-Level Inventory with Pessimistic Locking Support)
        Schema::create('warehouse_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('warehouse_id');
            $table->string('product_id');
            $table->integer('stock_quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->unique(['warehouse_id', 'product_id']);
        });

        // 7. Stock Movements (Inventory Audit Ledger)
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->string('warehouse_id');
            $table->string('product_id');
            $table->string('order_id')->nullable()->index();
            $table->string('movement_type'); // 'ERP_SYNC_DELTA', 'ORDER_DEDUCTION', 'ORDER_CANCELLATION_RESTORE', 'ADMIN_MANUAL_ADJUSTMENT'
            $table->integer('quantity_before');
            $table->integer('quantity_change');
            $table->integer('quantity_after');
            $table->string('reference_note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        // 8. Campaign Banners
        Schema::create('campaign_banners', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type'); // 'VERTICAL_PROMO_CARD', 'FULL_WIDTH_BANNER', 'SPLIT_FRESH_BANNER'
            $table->string('title_en');
            $table->string('title_ckb')->nullable();
            $table->string('title_ar')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('badge_text')->nullable();
            $table->string('bg_color_hex')->nullable();
            $table->string('image_url')->nullable();
            $table->string('linked_category_id')->nullable();
            $table->string('linked_brand_id')->nullable();
            $table->json('linked_product_ids')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 9. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('phone')->unique()->index();
            $table->string('name');
            $table->string('preferred_language')->default('en');
            $table->string('api_token', 80)->nullable()->unique()->index();
            $table->timestamps();
        });

        // 10. Customer Addresses
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_id');
            $table->string('title')->default('Home');
            $table->string('city');
            $table->string('neighborhood')->nullable();
            $table->string('street')->nullable();
            $table->string('building')->nullable();
            $table->string('landmark')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
        });

        // 11. Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code')->unique()->index();
            $table->string('title_en');
            $table->string('title_ckb')->nullable();
            $table->string('title_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ckb')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('discount_type'); // 'PERCENTAGE', 'FIXED_IQD', 'FREE_DELIVERY'
            $table->unsignedInteger('discount_value');
            $table->unsignedInteger('max_discount_iqd')->nullable();
            $table->unsignedInteger('min_order_subtotal_iqd')->default(7000);
            $table->boolean('first_order_only')->default(false);
            $table->json('applicable_category_ids')->nullable();
            $table->json('applicable_brand_ids')->nullable();
            $table->boolean('exclude_discounted_items')->default(false);
            $table->unsignedInteger('usage_limit_global')->nullable();
            $table->unsignedInteger('usage_limit_per_customer')->default(1);
            $table->unsignedInteger('current_usage_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 12. Drivers
        Schema::create('drivers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('full_name');
            $table->string('phone')->unique();
            $table->string('vehicle_type')->default('Motorcycle');
            $table->string('plate_number');
            $table->string('warehouse_id');
            $table->string('status')->default('AVAILABLE'); // 'AVAILABLE', 'BUSY_DELIVERING', 'OFFLINE'
            $table->unsignedInteger('cash_in_hand_iqd')->default(0);
            $table->decimal('average_rating', 3, 2)->default(5.00);
            $table->unsignedInteger('total_ratings_count')->default(0);
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
        });

        // 13. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('order_number')->unique()->index();
            $table->string('idempotency_key')->nullable()->unique()->index();
            $table->string('customer_id')->nullable();
            $table->string('customer_phone')->index();
            $table->string('warehouse_id');
            $table->json('address_snapshot');
            $table->unsignedInteger('subtotal_iqd');
            $table->unsignedInteger('discount_total_iqd')->default(0);
            $table->unsignedInteger('delivery_fee_iqd')->default(0);
            $table->string('coupon_code')->nullable();
            $table->unsignedInteger('coupon_discount_iqd')->default(0);
            $table->unsignedInteger('total_iqd');
            $table->string('payment_method')->default('COD');
            $table->string('payment_status')->default('PENDING');
            $table->string('order_status')->default('PLACED')->index(); // 'PLACED', 'PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
            $table->string('driver_id')->nullable();
            $table->string('assigned_driver_name')->nullable();
            $table->string('assigned_driver_phone')->nullable();
            $table->string('estimated_delivery_minutes')->nullable();
            $table->boolean('is_packed')->default(false);
            $table->json('packed_items')->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('packing_at')->nullable();
            $table->timestamp('out_for_delivery_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            $table->foreign('driver_id')->references('id')->on('drivers')->nullOnDelete();
        });

        // 14. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->string('product_id');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('unit_price_iqd');
            $table->unsignedInteger('total_iqd');
            $table->json('product_snapshot')->nullable();
            $table->boolean('is_packed')->default(false);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        // 15. Coupon Redemptions
        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            $table->string('coupon_id');
            $table->string('order_id');
            $table->string('customer_phone')->index();
            $table->unsignedInteger('discount_applied_iqd');
            $table->timestamp('redeemed_at')->useCurrent();

            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        // 16. Driver Cash Ledgers (Enterprise Financial Audit Trail)
        Schema::create('driver_cash_ledgers', function (Blueprint $table) {
            $table->id();
            $table->string('driver_id');
            $table->string('order_id')->nullable()->index();
            $table->string('transaction_type'); // 'COD_COLLECTED', 'CASHIER_SHIFT_SETTLEMENT'
            $table->integer('amount_iqd');
            $table->integer('balance_after_iqd');
            $table->string('receipt_reference')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('driver_id')->references('id')->on('drivers')->cascadeOnDelete();
        });

        // 17. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('customer_id')->nullable();
            $table->string('customer_phone')->nullable()->index();
            $table->string('order_id')->nullable()->index();
            $table->string('type')->default('ORDER_UPDATE'); // 'ORDER_UPDATE', 'PRICE_DROP', 'PROMO_OFFER'
            $table->string('title_en');
            $table->string('title_ckb')->nullable();
            $table->string('title_ar')->nullable();
            $table->text('body_en');
            $table->text('body_ckb')->nullable();
            $table->text('body_ar')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 18. Order Ratings
        Schema::create('order_ratings', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('customer_id')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('driver_id')->nullable();
            $table->unsignedTinyInteger('overall_store_stars');
            $table->unsignedTinyInteger('driver_stars');
            $table->json('feedback_tags')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        // 19. Payment Configs
        Schema::create('payment_configs', function (Blueprint $table) {
            $table->string('id')->primary(); // 'cod', 'fastpay', 'zaincash', 'fib'
            $table->string('name');
            $table->boolean('is_enabled')->default(false);
            $table->json('credentials')->nullable();
            $table->timestamps();
        });

        // 20. ERP Sync Logs
        Schema::create('erp_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('source')->default('WEBHOOK');
            $table->unsignedInteger('synced_skus_count')->default(0);
            $table->string('status')->default('SUCCESS');
            $table->json('details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_sync_logs');
        Schema::dropIfExists('payment_configs');
        Schema::dropIfExists('order_ratings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('driver_cash_ledgers');
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('drivers');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('campaign_banners');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('warehouse_stocks');
        Schema::dropIfExists('products');
        Schema::dropIfExists('country_origins');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('warehouses');
    }
};
