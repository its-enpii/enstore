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
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('sku')->unique()->index();
            $table->string('name');
            $table->string('category');
            $table->string('brand');
            $table->string('seller_name')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price_buy', 12, 2)->default(0);
            $table->decimal('price_sell', 12, 2)->default(0);
            $table->boolean('available')->default(true);
            $table->enum('type', ['prepaid', 'postpaid']);
            $table->string('thumbnail')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
