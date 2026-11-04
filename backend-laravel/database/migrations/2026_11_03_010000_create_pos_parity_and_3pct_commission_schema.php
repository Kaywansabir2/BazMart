<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Partner Supermarket POS Fields on Products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'pos_item_code')) {
                $table->string('pos_item_code')->nullable()->after('external_erp_id');
            }
            if (!Schema::hasColumn('products', 'pos_shelf_price_iqd')) {
                $table->unsignedInteger('pos_shelf_price_iqd')->default(0)->after('original_price_iqd');
            }
            if (!Schema::hasColumn('products', 'pos_promo_price_iqd')) {
                $table->unsignedInteger('pos_promo_price_iqd')->nullable()->after('discounted_price_iqd');
            }
            if (!Schema::hasColumn('products', 'pos_parity_verified')) {
                $table->boolean('pos_parity_verified')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('products', 'commission_rate_percent')) {
                $table->decimal('commission_rate_percent', 5, 2)->default(3.00)->after('pos_parity_verified');
            }
        });

        // 2. 3% Sales Commission & 97% Supermarket Payable on Orders
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'pos_shelf_subtotal_iqd')) {
                $table->unsignedInteger('pos_shelf_subtotal_iqd')->default(0)->after('subtotal_iqd');
            }
            if (!Schema::hasColumn('orders', 'commission_rate_percent')) {
                $table->decimal('commission_rate_percent', 5, 2)->default(3.00)->after('pos_shelf_subtotal_iqd');
            }
            if (!Schema::hasColumn('orders', 'bazmart_commission_iqd')) {
                $table->unsignedInteger('bazmart_commission_iqd')->default(0)->after('commission_rate_percent');
            }
            if (!Schema::hasColumn('orders', 'supermarket_payable_iqd')) {
                $table->unsignedInteger('supermarket_payable_iqd')->default(0)->after('bazmart_commission_iqd');
            }
            if (!Schema::hasColumn('orders', 'bazmart_net_profit_iqd')) {
                $table->integer('bazmart_net_profit_iqd')->default(0)->after('supermarket_payable_iqd');
            }
        });

        // 3. Line-level Commission on Order Items
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'pos_shelf_unit_price_iqd')) {
                $table->unsignedInteger('pos_shelf_unit_price_iqd')->default(0)->after('unit_price_iqd');
            }
            if (!Schema::hasColumn('order_items', 'line_commission_iqd')) {
                $table->unsignedInteger('line_commission_iqd')->default(0)->after('total_iqd');
            }
            if (!Schema::hasColumn('order_items', 'line_supermarket_payable_iqd')) {
                $table->unsignedInteger('line_supermarket_payable_iqd')->default(0)->after('line_commission_iqd');
            }
        });

        // 4. Partner Supermarket Daily Settlement & Reconciliation Ledger
        if (!Schema::hasTable('supermarket_settlements')) {
            Schema::create('supermarket_settlements', function (Blueprint $table) {
                $table->id();
                $table->string('settlement_number')->unique();
                $table->string('warehouse_id')->nullable();
                $table->date('period_date');
                $table->unsignedInteger('orders_count')->default(0);
                $table->unsignedBigInteger('total_shelf_sales_iqd')->default(0);
                $table->unsignedBigInteger('bazmart_commission_3pct_iqd')->default(0);
                $table->unsignedBigInteger('supermarket_net_payable_97pct_iqd')->default(0);
                $table->string('status')->default('PENDING_SETTLEMENT'); // PENDING_SETTLEMENT | SETTLED_WITH_SUPERMARKET
                $table->timestamp('settled_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('supermarket_settlements');
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['pos_shelf_unit_price_iqd', 'line_commission_iqd', 'line_supermarket_payable_iqd']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pos_shelf_subtotal_iqd', 'commission_rate_percent', 'bazmart_commission_iqd', 'supermarket_payable_iqd', 'bazmart_net_profit_iqd']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['pos_item_code', 'pos_shelf_price_iqd', 'pos_promo_price_iqd', 'pos_parity_verified', 'commission_rate_percent']);
        });
    }
};

