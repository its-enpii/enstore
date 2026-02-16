<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@enstore.com'],
            [
                'name' => 'Admin Enstore',
                'email' => 'admin@enstore.com',
                'phone' => '081234567890',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'customer_type' => 'retail',
                'is_guest' => false,
                'status' => 'active',
                'referral_code' => Str::upper(Str::random(8)),
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin user created successfully!');
        $this->command->info('Email: admin@enstore.com');
        $this->command->info('Password: password');
    }
}
