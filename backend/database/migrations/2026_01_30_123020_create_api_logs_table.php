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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('vendor')->index(); // digiflazz, tripay
            $table->string('endpoint');
            $table->json('request_payload')->nullable();
            $table->json('response_body')->nullable();
            $table->integer('status_code')->nullable();
            $table->float('duration')->nullable(); // seconds
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
