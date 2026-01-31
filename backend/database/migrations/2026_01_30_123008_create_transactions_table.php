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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique()->index();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('product_id')->nullable()->constrained('products'); // Linked to current product snapshot ideally
            $table->string('customer_no'); // Phone/PLN
            
            // Financials
            $table->decimal('amount_product', 12, 2);
            $table->decimal('amount_fee', 12, 2)->default(0);
            $table->decimal('amount_total', 12, 2);
            
            // Statuses
            $table->enum('payment_status', ['unpaid', 'paid', 'expired', 'failed', 'refunded'])->default('unpaid');
            $table->enum('order_status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            
            // Payment Details
            $table->foreignId('payment_method_id')->nullable(); // constrained later if needed or just id
            $table->string('payment_ref')->nullable(); // Tripay ref
            $table->string('payment_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            
            // Provider Details
            $table->string('provider_ref')->nullable(); // Digiflazz SN
            $table->string('provider_status')->nullable();
            $table->json('provider_response')->nullable();
            
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
