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
        Schema::create('user_devices', function (Blueprint $userDevices) {
            $userDevices->id();
            $userDevices->foreignId('user_id')->constrained()->onDelete('cascade');
            $userDevices->string('device_id')->index(); // Unique ID for the physical device
            $userDevices->string('fcm_token')->nullable();
            $userDevices->string('device_name')->nullable();
            $userDevices->enum('platform', ['android', 'ios', 'web', 'other'])->default('other');
            $userDevices->timestamp('last_active_at')->nullable();
            $userDevices->timestamps();

            // Ensure a user doesn't have duplicate records for the same physical device ID
            $userDevices->unique(['user_id', 'device_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
