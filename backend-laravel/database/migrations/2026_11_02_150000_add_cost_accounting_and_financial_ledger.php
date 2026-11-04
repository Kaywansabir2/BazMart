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
        // 1. Add Cost & Supplier metadata to products
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('cost_price_iqd')->default(0)->after('original_price_iqd');
            $table->unsignedInteger('min_margin_percent_threshold')->default(12)->after('cost_price_iqd');
            $table->string('supplier_name')->nullable()->after('min_margin_percent_threshold');
            $table->unsignedInteger('tax_or_customs_iqd')->default(0)->after('supplier_name');
        });

        // 2. Add Cost & Profit Snapshots to order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedInteger('unit_original_price_iqd')->default(0)->after('quantity');
            $table->unsignedInteger('unit_cost_price_iqd')->default(0)->after('unit_price_iqd');
            $table->unsignedInteger('total_cost_iqd')->default(0)->after('total_iqd');
            $table->unsignedInteger('line_promo_discount_iqd')->default(0)->after('total_cost_iqd');
            $table->integer('line_gross_profit_iqd')->default(0)->after('line_promo_discount_iqd');
            $table->decimal('line_margin_percentage', 5, 2)->default(0)->after('line_gross_profit_iqd');
        });

        // 3. Add Financial P&L Breakdown to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('gross_merchandise_value_iqd')->default(0)->after('address_snapshot');
            $table->unsignedInteger('item_promo_discount_total_iqd')->default(0)->after('gross_merchandise_value_iqd');
            $table->unsignedInteger('total_cogs_iqd')->default(0)->after('subtotal_iqd');
            $table->integer('gross_profit_before_coupon_iqd')->default(0)->after('total_cogs_iqd');
            $table->unsignedInteger('driver_delivery_payout_iqd')->default(1000)->after('delivery_fee_iqd');
            $table->integer('net_profit_iqd')->default(0)->after('total_iqd');
            $table->decimal('profit_margin_percentage', 5, 2)->default(0)->after('net_profit_iqd');
        });

        // 4. Create General Financial Ledger
        Schema::create('financial_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->string('entry_number')->unique()->index(); // e.g. '#FIN-100234'
            $table->string('warehouse_id')->index();
            $table->string('order_id')->nullable()->index();
            $table->string('product_id')->nullable()->index();
            $table->string('entry_type')->index(); // 'ORDER_REVENUE', 'ORDER_COGS', 'PROMO_DISCOUNT_BURN', 'COUPON_SUBSIDY_BURN', 'DRIVER_PAYOUT_COST', 'INVENTORY_WASTAGE_WRITE_OFF', 'COD_CASH_RECONCILED'
            $table->string('direction')->index(); // 'CREDIT', 'DEBIT'
            $table->unsignedInteger('amount_iqd');
            $table->string('description')->nullable();
            $table->timestamp('recorded_at')->useCurrent()->index();
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_ledger_entries');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'gross_merchandise_value_iqd',
                'item_promo_discount_total_iqd',
                'total_cogs_iqd',
                'gross_profit_before_coupon_iqd',
                'driver_delivery_payout_iqd',
                'net_profit_iqd',
                'profit_margin_percentage',
            ]);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'unit_original_price_iqd',
                'unit_cost_price_iqd',
                'total_cost_iqd',
                'line_promo_discount_iqd',
                'line_gross_profit_iqd',
                'line_margin_percentage',
            ]);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'cost_price_iqd',
                'min_margin_percent_threshold',
                'supplier_name',
                'tax_or_customs_iqd',
            ]);
        });
    }
};

