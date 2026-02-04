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
        Schema::table('balance_mutations', function (Blueprint $table) {
            // Drop the incorrect foreign key if it exists
            // The error log showed 'balance_mutations_user_id_foreign' pointing to users table
            try {
                $table->dropForeign('balance_mutations_user_id_foreign');
            } catch (\Exception $e) {
                // Ignore if it doesn't exist (e.g. different environment)
            }

            // Ensure the correct foreign key exists
            // It should point to balances table
            $table->foreign('balance_id')
                  ->references('id')
                  ->on('balances')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('balance_mutations', function (Blueprint $table) {
            $table->dropForeign(['balance_id']);
            
            // Re-add the previous (incorrect) one? 
            // No, we shouldn't restore a bug. But for strict rollback:
            // $table->foreign('balance_id', 'balance_mutations_user_id_foreign')
            //       ->references('id')->on('users');
        });
    }
};
