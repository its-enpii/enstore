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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->bigIncrements('id');

            // User
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Action
            $table->string('action', 100)->comment('created, updated, deleted, login, dll');

            // Model
            $table->string('model', 100)->nullable()->comment('User, Product, Transaction, dll');
            $table->unsignedBigInteger('model_id')->nullable();

            // Description
            $table->text('description')->nullable();

            // Request Info
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // Additional Data
            $table->json('properties')->nullable()->comment('Old values, new values, dll');

            // Timestamp
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('action');
            $table->index(['model', 'model_id'], 'model_index');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
