<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DigiflazzService;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SyncDigiflazzProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'digiflazz:sync-products 
                            {--force : Force sync without cache}
                            {--category= : Sync specific category only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync products from Digiflazz API to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting product sync from Digiflazz...');
        $this->newLine();

        try {
            $digiflazzService = new DigiflazzService();

            // Get price list from Digiflazz
            $this->info('📡 Fetching price list from Digiflazz API...');
            $useCache = !$this->option('force');
            $products = $digiflazzService->getPriceList($useCache);

            $this->info('✅ Total products fetched: ' . count($products));
            $this->newLine();

            // Filter by category if specified
            if ($categoryFilter = $this->option('category')) {
                $products = array_filter($products, function ($product) use ($categoryFilter) {
                    return strtolower($product['category']) === strtolower($categoryFilter);
                });
                $this->info('🔍 Filtered to category: ' . $categoryFilter);
                $this->info('Products to sync: ' . count($products));
                $this->newLine();
            }

            if (empty($products)) {
                $this->warn('⚠️  No products to sync.');
                return 0;
            }

            $progressBar = $this->output->createProgressBar(count($products));
            $progressBar->setFormat('verbose');
            $progressBar->start();

            $stats = [
                'synced' => 0,
                'updated' => 0,
                'created' => 0,
                'skipped' => 0,
                'categories' => 0,
            ];

            DB::beginTransaction();

            foreach ($products as $product) {
                // Skip if product inactive
                if (!$product['buyer_product_status'] || !$product['seller_product_status']) {
                    $stats['skipped']++;
                    $progressBar->advance();
                    continue;
                }

                // Get or create category
                $categoryName = $product['category'];
                $category = ProductCategory::firstOrCreate(
                    ['slug' => Str::slug($categoryName)],
                    [
                        'name' => $categoryName,
                        'type' => $this->mapCategoryType($categoryName),
                        'is_active' => true,
                    ]
                );

                if ($category->wasRecentlyCreated) {
                    $stats['categories']++;
                }

                // Calculate prices with markup
                $basePrice = $product['price'];
                $retailMarkup = $this->getMarkup('retail', $categoryName);
                $resellerMarkup = $this->getMarkup('reseller', $categoryName);

                $retailPrice = $basePrice + $retailMarkup;
                $resellerPrice = $basePrice + $resellerMarkup;

                // Update or create product
                $productModel = Product::updateOrCreate(
                    ['digiflazz_code' => $product['buyer_sku_code']],
                    [
                        'category_id' => $category->id,
                        'name' => $product['product_name'],
                        'brand' => $product['brand'],
                        'type' => $this->mapProductType($product['category']),
                        'base_price' => $basePrice,
                        'retail_price' => $retailPrice,
                        'reseller_price' => $resellerPrice,
                        'retail_profit' => $retailPrice - $basePrice,
                        'reseller_profit' => $resellerPrice - $basePrice,
                        'stock_status' => $product['seller_product_status'] ? 'available' : 'empty',
                        'is_active' => true,
                        'description' => $product['desc'] ?? null,
                        'last_synced_at' => now(),
                    ]
                );

                if ($productModel->wasRecentlyCreated) {
                    $stats['created']++;
                } else {
                    $stats['updated']++;
                }

                $stats['synced']++;
                $progressBar->advance();
            }

            DB::commit();

            $progressBar->finish();
            $this->newLine(2);

            // Display results
            $this->info('✅ Sync completed successfully!');
            $this->newLine();

            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Synced', $stats['synced']],
                    ['Created', $stats['created']],
                    ['Updated', $stats['updated']],
                    ['Skipped (Inactive)', $stats['skipped']],
                    ['Categories Created', $stats['categories']],
                ]
            );

            $this->newLine();
            $this->info('🎉 Product sync finished!');

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();

            $this->newLine();
            $this->error('❌ Sync failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());

            return 1;
        }
    }

    /**
     * Map category name to type
     */
    private function mapCategoryType($category)
    {
        $mapping = [
            'Games' => 'game',
            'Pulsa' => 'pulsa',
            'Paket Data' => 'data',
            'PLN' => 'pln',
            'E-Money' => 'emoney',
            'Voucher' => 'voucher',
        ];

        return $mapping[$category] ?? 'other';
    }

    /**
     * Map category to product type
     */
    private function mapProductType($category)
    {
        return $this->mapCategoryType($category);
    }

    /**
     * Get markup based on customer type and category
     */
    private function getMarkup($customerType, $category)
    {
        // Markup configuration (in Rupiah)
        $markupConfig = [
            'retail' => [
                'Games' => 3000,
                'Pulsa' => 2000,
                'Paket Data' => 2500,
                'PLN' => 2000,
                'E-Money' => 2500,
                'Voucher' => 3000,
                'default' => 2500,
            ],
            'reseller' => [
                'Games' => 1500,
                'Pulsa' => 1000,
                'Paket Data' => 1200,
                'PLN' => 1000,
                'E-Money' => 1200,
                'Voucher' => 1500,
                'default' => 1200,
            ],
        ];

        return $markupConfig[$customerType][$category] ?? $markupConfig[$customerType]['default'];
    }
}
