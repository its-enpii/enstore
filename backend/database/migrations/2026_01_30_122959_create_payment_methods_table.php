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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('group')->index(); // Virtual Account, E-Wallet, Retail
            $table->string('code')->unique();
            $table->string('name');
            $table->string('icon_url')->nullable();
            $table->decimal('fee_flat', 12, 2)->default(0);
            $table->decimal('fee_percent', 5, 2)->default(0);
            $table->decimal('min_amount', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
