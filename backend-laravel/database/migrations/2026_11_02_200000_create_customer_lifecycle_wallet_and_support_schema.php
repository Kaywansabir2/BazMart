<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance customers table
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'email')) {
                $table->string('email')->nullable()->after('name');
            }
            if (!Schema::hasColumn('customers', 'is_onboarded')) {
                $table->boolean('is_onboarded')->default(false)->after('preferred_language');
            }
            if (!Schema::hasColumn('customers', 'wallet_balance_iqd')) {
                $table->unsignedInteger('wallet_balance_iqd')->default(0)->after('is_onboarded');
            }
            if (!Schema::hasColumn('customers', 'referral_code')) {
                $table->string('referral_code')->nullable()->unique()->after('wallet_balance_iqd');
            }
            if (!Schema::hasColumn('customers', 'status')) {
                $table->string('status')->default('ACTIVE')->after('referral_code'); // ACTIVE, DEACTIVATED
            }
            if (!Schema::hasColumn('customers', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('status');
            }
        });

        // 2. Enhance orders table
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'unavailable_item_preference')) {
                $table->string('unavailable_item_preference')->default('REPLACE_WITH_BEST_MATCH')->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'rider_tip_iqd')) {
                $table->unsignedInteger('rider_tip_iqd')->default(0)->after('unavailable_item_preference');
            }
            if (!Schema::hasColumn('orders', 'delivery_dropoff_options')) {
                $table->json('delivery_dropoff_options')->nullable()->after('rider_tip_iqd');
            }
            if (!Schema::hasColumn('orders', 'wallet_amount_used_iqd')) {
                $table->unsignedInteger('wallet_amount_used_iqd')->default(0)->after('delivery_dropoff_options');
            }
            if (!Schema::hasColumn('orders', 'net_cod_payable_iqd')) {
                $table->unsignedInteger('net_cod_payable_iqd')->nullable()->after('wallet_amount_used_iqd');
            }
        });

        // 3. Wallet Transactions table
        if (!Schema::hasTable('wallet_transactions')) {
            Schema::create('wallet_transactions', function (Blueprint $table) {
                $table->id();
                $table->string('transaction_number')->unique()->index(); // e.g. #WLT-100001
                $table->string('customer_id')->index();
                $table->string('order_id')->nullable()->index();
                $table->string('type'); // TOPUP_BONUS, ORDER_REFUND_CREDIT, COMPENSATION_VOUCHER, CHECKOUT_PAYMENT_DEDUCTION
                $table->string('direction'); // CREDIT, DEBIT
                $table->unsignedInteger('amount_iqd');
                $table->unsignedInteger('balance_after_iqd');
                $table->string('description_en');
                $table->string('description_ckb')->nullable();
                $table->string('description_ar')->nullable();
                $table->timestamps();

                $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
                $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
            });
        }

        // 4. Customer Favorites table
        if (!Schema::hasTable('customer_favorites')) {
            Schema::create('customer_favorites', function (Blueprint $table) {
                $table->id();
                $table->string('customer_id')->index();
                $table->string('product_id')->index();
                $table->timestamps();

                $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                $table->unique(['customer_id', 'product_id']);
            });
        }

        // 5. Stock Alert Subscriptions table
        if (!Schema::hasTable('stock_alert_subscriptions')) {
            Schema::create('stock_alert_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->string('customer_id')->nullable()->index();
                $table->string('customer_phone')->index();
                $table->string('product_id')->index();
                $table->string('warehouse_id')->index();
                $table->string('status')->default('WAITING')->index(); // WAITING, NOTIFIED
                $table->timestamps();

                $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            });
        }

        // 6. Support Tickets table
        if (!Schema::hasTable('support_tickets')) {
            Schema::create('support_tickets', function (Blueprint $table) {
                $table->id();
                $table->string('ticket_number')->unique()->index(); // e.g. #TKT-10001
                $table->string('order_id')->index();
                $table->string('customer_id')->index();
                $table->string('issue_category'); // MISSING_ITEM, DAMAGED_OR_SPOILED_ITEM, WRONG_ITEM_RECEIVED, LATE_DELIVERY
                $table->json('affected_order_item_ids')->nullable();
                $table->text('customer_note')->nullable();
                $table->unsignedInteger('requested_refund_iqd')->default(0);
                $table->string('status')->default('OPEN')->index(); // OPEN, APPROVED_REFUNDED_TO_WALLET, REJECTED
                $table->text('admin_resolution_note')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
                $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('stock_alert_subscriptions');
        Schema::dropIfExists('customer_favorites');
        Schema::dropIfExists('wallet_transactions');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'unavailable_item_preference',
                'rider_tip_iqd',
                'delivery_dropoff_options',
                'wallet_amount_used_iqd',
                'net_cod_payable_iqd',
            ]);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'is_onboarded',
                'wallet_balance_iqd',
                'referral_code',
                'status',
                'last_login_at',
            ]);
        });
    }
};

