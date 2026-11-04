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
        // 1. Suppliers Table
        Schema::create('suppliers', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'sup-alrahma-dairy'
            $table->string('name');
            $table->string('contact_person');
            $table->string('phone');
            $table->string('email');
            $table->string('city'); // Sulaymaniyah, Erbil, Baghdad, Duhok
            $table->string('country_code', 10); // KRD, EU, USA, KOR
            $table->unsignedInteger('lead_time_days')->default(1);
            $table->string('payment_terms'); // Net 15, Net 30, Cash on Receipt
            $table->unsignedBigInteger('total_purchased_iqd')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Purchase Orders Table
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'po-10001'
            $table->string('po_number')->unique()->index(); // e.g. '#PO-10001'
            $table->string('supplier_id')->index();
            $table->string('warehouse_id')->index();
            $table->string('status')->index(); // DRAFT, SENT_TO_SUPPLIER, RECEIVED_INTO_STOCK, CANCELLED
            $table->unsignedBigInteger('total_cost_iqd')->default(0);
            $table->date('expected_delivery_date');
            $table->timestamp('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->cascadeOnDelete();
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
        });

        // 3. Purchase Order Items Table
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_order_id')->index();
            $table->string('product_id')->index();
            $table->unsignedInteger('ordered_quantity');
            $table->unsignedInteger('received_quantity')->default(0);
            $table->unsignedInteger('unit_cost_iqd');
            $table->unsignedBigInteger('line_total_cost_iqd');
            $table->string('batch_number')->nullable();
            $table->date('production_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        // 4. Inventory Batches Table (FEFO Tracking)
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->index(); // e.g. 'LOT-ALRAHMA-1101'
            $table->string('warehouse_id')->index();
            $table->string('product_id')->index();
            $table->string('purchase_order_id')->nullable()->index();
            $table->unsignedInteger('initial_quantity');
            $table->unsignedInteger('remaining_quantity');
            $table->unsignedInteger('unit_cost_iqd');
            $table->date('production_date');
            $table->date('expiry_date')->index();
            $table->string('status')->index(); // ACTIVE, NEAR_EXPIRY_PROMO, EXPIRED_QUARANTINED, DEPLETED
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
    }
};

