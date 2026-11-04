<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'returned_quantity')) {
                $table->unsignedInteger('returned_quantity')->default(0)->after('quantity');
            }
            if (!Schema::hasColumn('order_items', 'return_reason')) {
                $table->string('return_reason')->nullable()->after('returned_quantity');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'has_partial_returns')) {
                $table->boolean('has_partial_returns')->default(false)->after('is_packed');
            }
            if (!Schema::hasColumn('orders', 'returned_amount_iqd')) {
                $table->unsignedInteger('returned_amount_iqd')->default(0)->after('has_partial_returns');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['returned_quantity', 'return_reason']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['has_partial_returns', 'returned_amount_iqd']);
        });
    }
};

