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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('wallet_id')->constrained('wallets');
            $table->uuid('uuid')->unique();
            $table->nullableMorphs('related'); // related_type, related_id
            $table->decimal('amount', 19, 2);
            $table->decimal('last_balance', 19, 2);
            $table->enum('type', ['topup', 'payment', 'refund', 'adjustment']);
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
