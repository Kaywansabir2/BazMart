<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Operational delivery slots on orders
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'delivery_slot_type')) {
                $table->string('delivery_slot_type')->default('INSTANT')->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'scheduled_slot_label')) {
                $table->string('scheduled_slot_label')->nullable()->after('delivery_slot_type');
            }
        });

        // 2. Item substitution flags on order_items
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'is_substituted')) {
                $table->boolean('is_substituted')->default(false)->after('total_price_iqd');
            }
            if (!Schema::hasColumn('order_items', 'substituted_product_id')) {
                $table->string('substituted_product_id')->nullable()->after('is_substituted');
            }
            if (!Schema::hasColumn('order_items', 'substitution_reason')) {
                $table->string('substitution_reason')->nullable()->after('substituted_product_id');
            }
            if (!Schema::hasColumn('order_items', 'original_quantity')) {
                $table->unsignedInteger('original_quantity')->nullable()->after('substitution_reason');
            }
        });

        // 3. Immutable Admin & Dark Store Audit Logs
        if (!Schema::hasTable('admin_audit_logs')) {
            Schema::create('admin_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('actor_name');
                $table->string('actor_role');
                $table->string('action_type');
                $table->string('target_reference');
                $table->text('details');
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['is_substituted', 'substituted_product_id', 'substitution_reason', 'original_quantity']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_slot_type', 'scheduled_slot_label']);
        });
    }
};

