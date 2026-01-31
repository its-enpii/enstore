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
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();

            // Payment Reference
            $table->string('payment_reference', 100)->unique()->comment('Reference dari Tripay');

            // Payment Method
            $table->string('payment_method', 50)->comment('QRIS, BRIVA, BCAVA, dll');
            $table->string('payment_channel', 50)->comment('Nama channel dari Tripay');
            $table->string('payment_code', 100)->nullable()->comment('VA number, QRIS code, dll');

            // Amount
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0)->comment('Fee dari payment gateway');
            $table->decimal('total_amount', 15, 2)->comment('Amount yang harus dibayar customer');

            // Status
            $table->enum('status', ['pending', 'paid', 'expired', 'failed', 'refunded'])->default('pending');

            // Tripay Data
            $table->string('tripay_merchant_ref', 100)->nullable();
            $table->string('tripay_customer_name', 255)->nullable();
            $table->string('tripay_customer_email', 255)->nullable();
            $table->string('tripay_customer_phone', 20)->nullable();

            // Payment Info
            $table->string('qr_url', 255)->nullable()->comment('URL QRIS code');
            $table->string('checkout_url', 255)->nullable()->comment('Tripay checkout URL');

            // Instructions (JSON)
            $table->json('payment_instructions')->nullable()->comment('Instruksi pembayaran dari Tripay');

            // Timestamps
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('transaction_id');
            $table->index('payment_reference');
            $table->index('status');
            $table->index(['status', 'created_at'], 'status_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
