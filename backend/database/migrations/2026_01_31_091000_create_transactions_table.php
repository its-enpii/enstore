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
            $table->bigIncrements('id');

            $table->string('transaction_code')->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreignId('product_item_id')->nullable()->comment('Null untuk topup saldo')->constrained('product_items')->nullOnDelete();

            $table->enum('customer_type', ['retail', 'reseller'])->default('retail');
            $table->enum('payment_method_type', ['gateway', 'balance'])->default('gateway')->comment('gateway=Tripay, balance=potong saldo');
            $table->enum('transaction_type', ['purchase', 'topup'])->default('purchase')->comment('purchase=beli produk, topup=isi saldo');
            $table->enum('prepaid_postpaid_type', ['prepaid', 'postpaid'])->default('prepaid')->comment('Prepaid atau Postpaid (PPOB)');
            $table->string('inquiry_ref', 100)->nullable()->comment('Reference dari inquiry (untuk postpaid)');
            $table->json('bill_data')->nullable()->comment('Data tagihan (customer_name, period, nominal, admin)');

            $table->string('product_name')->nullable();
            $table->string('product_code')->nullable()->comment('Digiflazz SKU');
            $table->decimal('product_price', 15, 2)->default(0);
            $table->decimal('admin_fee', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2);

            $table->json('customer_data')->nullable()->comment('user_id, zone_id, phone number, dll.');
            $table->text('customer_note')->nullable();

            $table->string('payment_method')->nullable()->comment('BCA, BRI, QRIS, VA, dll.');
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'failed'])->default('pending');
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'refunded'])->default('pending');

            $table->string('digiflazz_trx_id')->nullable();
            $table->string('digiflazz_serial_number')->nullable();
            $table->text('digiflazz_message')->nullable();
            $table->string('digiflazz_status')->nullable();
            $table->string('digiflazz_rc')->nullable()->comment('Response code from Digiflazz');

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('expired_at')->nullable();

            $table->timestamps();

            $table->index('transaction_code');
            $table->index('user_id');
            $table->index('product_item_id');
            $table->index('customer_type');
            $table->index('payment_method_type');
            $table->index('transaction_type');
            $table->index('prepaid_postpaid_type');
            $table->index('inquiry_ref');
            $table->index('payment_status');
            $table->index('status');
            $table->index('paid_at');
            $table->index('created_at');
            $table->index(['user_id', 'status', 'created_at'], 'user_status');
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
