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
        Schema::create('banners', function (Blueprint $table) {
            $table->bigIncrements('id');

            // Banner Info
            $table->string('title', 255);
            $table->string('image', 255);
            $table->string('link', 255)->nullable()->comment('URL redirect');
            $table->text('description')->nullable();

            // Type
            $table->enum('type', ['slider', 'popup', 'promo', 'banner'])->default('slider');

            // Status
            $table->boolean('is_active')->default(true);

            // Schedule
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();

            // Sort
            $table->integer('sort_order')->default(0);

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('type');
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
