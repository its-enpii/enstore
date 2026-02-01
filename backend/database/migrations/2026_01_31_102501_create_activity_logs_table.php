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

            // Model (polymorphic relationship)
            $table->string('model_type', 255)->nullable()->comment('App\\Models\\User, App\\Models\\Product, dll');
            $table->unsignedBigInteger('model_id')->nullable();

            // Description
            $table->text('description')->nullable();

            // Request Info
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // Additional Data
            $table->json('meta_data')->nullable()->comment('Additional data, log_type, request, response, dll');

            // Timestamp
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('action');
            $table->index(['model_type', 'model_id'], 'model_index');
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
