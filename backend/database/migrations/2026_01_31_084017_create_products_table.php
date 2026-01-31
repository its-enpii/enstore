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
            $table->foreignId('category_id')->constrained('product_categories')->restrictOnDelete();

            $table->string('digiflazz_code')->unique()->comment('SKU dari Digiflazz');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('brand')->comment('Mobile Legends, Free Fire, dll.');

            $table->decimal('base_price', 15, 2)->comment('Harga modal dari Digiflazz');
            $table->decimal('retail_price', 15, 2)->comment('Harga untuk retail/guest customer');
            $table->decimal('reseller_price', 15, 2)->comment('Harga untuk reseller (lebih murah)');
            $table->decimal('admin_fee', 15, 2)->default(0)->comment('Biaya admin');

            $table->decimal('retail_profit', 15, 2)->default(0)->comment('retail price - base price');
            $table->decimal('reseller_profit', 15, 2)->default(0)->comment('reseller price - base price');

            $table->enum('stock_status', ['available', 'empty', 'maintenance'])->default('available');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->json('server_options')->nullable()->comment('Server game: ["1001", "1002", "1003"]');
            $table->json('input_fields')->nullable()->comment('Field yang diperlukan customer');

            $table->integer('total_sold')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('sort_order')->default(0);

            $table->timestamp('last_sync_at')->nullable()->comment('Last sync dengan Digiflazz');

            $table->timestamps();

            $table->index('category_id');
            $table->index('digiflazz_code');
            $table->index('stock_status');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('retail_price');
            $table->index('reseller_price');
            $table->index(['category_id', 'is_active', 'retail_price'], 'category_active');
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
