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
        Schema::create('notifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Notification Content
            $table->string('title', 255);
            $table->text('message');

            // Type
            $table->enum('type', ['info', 'success', 'warning', 'error', 'promo'])->default('info');

            // Additional Data
            $table->json('data')->nullable()->comment('Transaction ID, product info, dll');

            // Read Status
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            // Timestamp
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('is_read');
            $table->index('created_at');
            $table->index(['user_id', 'is_read'], 'user_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
