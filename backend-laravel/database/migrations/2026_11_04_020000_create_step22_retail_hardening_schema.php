<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend products table with unit_weight_grams and cold_chain_zone
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'unit_weight_grams')) {
                $table->integer('unit_weight_grams')->default(500)->after('storage_temp');
            }
            if (!Schema::hasColumn('products', 'cold_chain_zone')) {
                $table->string('cold_chain_zone')->default('AMBIENT')->after('unit_weight_grams');
            }
        });

        // 2. Extend warehouse_stocks with safety_stock_buffer
        Schema::table('warehouse_stocks', function (Blueprint $table) {
            if (!Schema::hasColumn('warehouse_stocks', 'safety_stock_buffer')) {
                $table->integer('safety_stock_buffer')->default(2)->after('low_stock_threshold');
            }
        });

        // 3. Extend orders with 250 IQD rounding, heavy vehicle routing, and 3-zone bag counts
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'physical_cash_collectible_iqd')) {
                $table->integer('physical_cash_collectible_iqd')->nullable()->after('net_cod_payable_iqd');
            }
            if (!Schema::hasColumn('orders', 'wallet_small_change_credit_iqd')) {
                $table->integer('wallet_small_change_credit_iqd')->default(0)->after('physical_cash_collectible_iqd');
            }
            if (!Schema::hasColumn('orders', 'wallet_change_credit_ref')) {
                $table->string('wallet_change_credit_ref')->nullable()->after('wallet_small_change_credit_iqd');
            }
            if (!Schema::hasColumn('orders', 'total_weight_kg')) {
                $table->decimal('total_weight_kg', 6, 2)->default(0)->after('wallet_change_credit_ref');
            }
            if (!Schema::hasColumn('orders', 'required_vehicle_type')) {
                $table->string('required_vehicle_type')->default('MOTORCYCLE')->after('total_weight_kg');
            }
            if (!Schema::hasColumn('orders', 'frozen_bags_count')) {
                $table->integer('frozen_bags_count')->default(0)->after('required_vehicle_type');
            }
            if (!Schema::hasColumn('orders', 'chilled_bags_count')) {
                $table->integer('chilled_bags_count')->default(0)->after('frozen_bags_count');
            }
            if (!Schema::hasColumn('orders', 'ambient_bags_count')) {
                $table->integer('ambient_bags_count')->default(0)->after('chilled_bags_count');
            }
        });

        // 4. Create pos_outbound_invoices table for two-way POS sales write-back
        if (!Schema::hasTable('pos_outbound_invoices')) {
            Schema::create('pos_outbound_invoices', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('pos_invoice_number')->unique();
                $table->string('order_id')->index();
                $table->string('warehouse_id')->index();
                $table->json('items_payload');
                $table->integer('gross_shelf_total_iqd');
                $table->integer('bazmart_commission_3pct_iqd');
                $table->integer('supermarket_net_97pct_iqd');
                $table->string('sync_status')->default('SYNCED_TO_PARTNER_POS'); // SYNCED_TO_PARTNER_POS, PENDING_RETRY
                $table->string('pos_terminal_ref')->default('POS-TERM-SULY-01');
                $table->timestamp('synced_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_outbound_invoices');
    }
};

