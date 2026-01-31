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
        Schema::create('settings', function (Blueprint $table) {
            $table->bigIncrements('id');

            // Setting Key
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();

            // Type
            $table->enum('type', ['string', 'number', 'boolean', 'json'])->default('string');

            // Grouping
            $table->string('group', 50)->nullable()->comment('general, payment, product, notification, dll');

            // Description
            $table->text('description')->nullable();

            // Visibility
            $table->boolean('is_public')->default(false)->comment('Bisa diakses dari frontend API?');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('key');
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
