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
        Schema::create('balance_mutations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('transaction_id')->nullable()->comment('Reference to transactions.id (no FK to avoid circular dependency)');

            // Mutation Info
            $table->enum('type', ['credit', 'debit'])->comment('credit=masuk, debit=keluar');
            $table->decimal('amount', 15, 2);

            // Balance Snapshot (Audit Trail)
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);

            // Description
            $table->text('description');

            // Reference
            $table->string('reference_type', 50)->nullable()->comment('topup, purchase, refund, bonus, withdrawal, adjustment');
            $table->unsignedBigInteger('reference_id')->nullable();

            // Timestamp
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('transaction_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id'], 'reference');
            $table->index('created_at');
            $table->index(['user_id', 'created_at'], 'user_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balance_mutations');
    }
};
