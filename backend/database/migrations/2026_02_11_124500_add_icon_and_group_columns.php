<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('image');
        });

        Schema::table('product_items', function (Blueprint $table) {
            $table->string('group')->nullable()->after('name')->comment('Group for items (e.g. Umum, Membership, etc)');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('icon');
        });

        Schema::table('product_items', function (Blueprint $table) {
            $table->dropColumn('group');
        });
    }
};
