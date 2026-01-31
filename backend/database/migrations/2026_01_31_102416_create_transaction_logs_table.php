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
        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();

            // Status Change
            $table->string('status_from', 50)->nullable();
            $table->string('status_to', 50);

            // Message
            $table->text('message')->nullable();

            // Additional Data
            $table->json('meta_data')->nullable()->comment('Additional info (error, response, dll)');

            // Created By
            $table->foreignId('created_by')->nullable()->comment('Admin ID jika manual action')->constrained('users')->nullOnDelete();

            // Timestamp
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('transaction_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_logs');
    }
};
