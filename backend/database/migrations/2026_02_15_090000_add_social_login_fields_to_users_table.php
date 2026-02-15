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
    Schema::table('users', function (Blueprint $table) {
      $table->string('google_id')->nullable()->unique()->after('avatar');
      $table->string('facebook_id')->nullable()->unique()->after('google_id');
      $table->string('social_avatar')->nullable()->after('facebook_id');

      // Make phone nullable for social login users (they may not have phone)
      $table->string('phone', 20)->nullable()->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn(['google_id', 'facebook_id', 'social_avatar']);
      $table->string('phone', 20)->nullable(false)->change();
    });
  }
};
