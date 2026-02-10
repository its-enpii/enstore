<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Games',
                'slug' => 'games',
                'icon' => '🎮',
                'description' => 'Voucher game populer seperti Mobile Legends, Free Fire, PUBG, dan lainnya',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pulsa',
                'slug' => 'pulsa',
                'icon' => '📱',
                'description' => 'Pulsa semua operator (Telkomsel, Indosat, XL, Tri, Smartfren)',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Data',
                'slug' => 'data',
                'icon' => '📶',
                'description' => 'Paket internet semua operator',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'PLN',
                'slug' => 'pln',
                'icon' => '⚡',
                'description' => 'Token listrik PLN',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'E-Money',
                'slug' => 'e-money',
                'icon' => '💰',
                'description' => 'Top up GoPay, OVO, DANA, ShopeePay, dan lainnya',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Voucher',
                'slug' => 'voucher',
                'icon' => '🎫',
                'description' => 'Voucher digital lainnya',
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->command->info('✅ Product categories seeded successfully!');
        $this->command->info('Total categories: ' . count($categories));
    }
}
