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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->bigIncrements('id');

            // Voucher Info
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();

            // Discount
            $table->enum('type', ['percentage', 'fixed'])->comment('percentage=%, fixed=nominal');
            $table->decimal('value', 15, 2)->comment('Nilai diskon (10 = 10% atau Rp 10,000)');

            // Conditions
            $table->decimal('min_transaction', 15, 2)->default(0)->comment('Min. transaksi untuk pakai voucher');
            $table->decimal('max_discount', 15, 2)->nullable()->comment('Max. diskon (untuk percentage)');

            // Usage Limit
            $table->integer('usage_limit')->nullable()->comment('Total usage limit (NULL = unlimited)');
            $table->integer('usage_count')->default(0);
            $table->integer('user_limit')->default(1)->comment('Berapa kali per user bisa pakai');

            // Status
            $table->boolean('is_active')->default(true);

            // Schedule
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
