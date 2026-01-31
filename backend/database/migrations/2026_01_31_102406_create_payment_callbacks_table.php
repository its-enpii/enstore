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
        Schema::create('payment_callbacks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();

            // Callback Data
            $table->json('callback_data')->comment('Full payload dari Tripay');
            $table->string('signature', 255)->comment('Signature untuk validasi');
            $table->string('ip_address', 45);

            // Validation
            $table->boolean('is_valid')->default(true)->comment('Signature valid?');
            $table->boolean('processed')->default(false)->comment('Callback sudah diproses?');

            // Timestamp
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('payment_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_callbacks');
    }
};
