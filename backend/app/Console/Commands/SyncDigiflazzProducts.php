<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductItem;
use App\Models\ProductCategory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SyncDigiflazzProducts extends Command
{
    protected $signature = 'digiflazz:sync-products 
                            {--force : Force sync without cache}
                            {--category= : Sync specific category only}';

    protected $description = 'Sync products from Digiflazz API to database (hierarchical structure)';

    private $stats = [
        'products_created' => 0,
        'products_updated' => 0,
        'items_created' => 0,
        'items_updated' => 0,
        'items_skipped' => 0,
        'categories_created' => 0,
    ];

    public function handle()
    {
        $this->info('🚀 Starting hierarchical product sync from Digiflazz...');
        $this->newLine();

        try {
            $digiflazzService = app(\App\Services\DigiflazzService::class);

            // Get price list from Digiflazz
            $this->info('📡 Fetching price list from Digiflazz API...');
            $useCache = !$this->option('force');
            $items = $digiflazzService->getPriceList($useCache);

            $this->info('✅ Total items fetched: ' . count($items));
            $this->newLine();

            // Filter by category if specified
            if ($categoryFilter = $this->option('category')) {
                $items = array_filter($items, function ($item) use ($categoryFilter) {
                    return stripos($item['category'] ?? '', $categoryFilter) !== false;
                });
                $this->info('🔍 Filtered to ' . count($items) . ' items for category: ' . $categoryFilter);
            }

            // Group items by brand to create parent products
            $this->info('📦 Grouping items by brand...');
            $groupedItems = $this->groupItemsByBrand($items);
            $this->info('✅ Found ' . count($groupedItems) . ' unique products');
            $this->newLine();

            // Sync products and items
            $this->info('⚙️  Syncing products and items...');
            $progressBar = $this->output->createProgressBar(count($groupedItems));
            $progressBar->start();

            foreach ($groupedItems as $brand => $brandItems) {
                $this->syncProduct($brand, $brandItems);
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine(2);

            // Display summary
            $this->displaySummary();

            $this->newLine();
            $this->info('🎉 Product sync finished!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Error syncing products: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    /**
     * Group items by brand to create parent products
     */
    private function groupItemsByBrand(array $items): array
    {
        $grouped = [];

        foreach ($items as $item) {
            $brand = $item['brand'] ?? 'Unknown';

            if (!isset($grouped[$brand])) {
                $grouped[$brand] = [];
            }

            $grouped[$brand][] = $item;
        }

        return $grouped;
    }

    /**
     * Sync a product and its items
     */
    private function syncProduct(string $brand, array $items): void
    {
        // Get first item to extract common data
        $firstItem = $items[0];

        // Get or create category
        $category = $this->getOrCreateCategory($firstItem['category'] ?? 'Uncategorized');

        // Detect product type and payment type
        $type = $this->detectType($firstItem);
        $paymentType = $this->detectPaymentType($firstItem);

        // Generate product name from brand
        $productName = $this->generateProductName($brand);
        $slug = Str::slug($productName);

        // Create or update parent product
        $product = Product::updateOrCreate(
            ['slug' => $slug],
            [
                'category_id' => $category->id,
                'name' => $productName,
                'brand' => $brand,
                'type' => $type,
                'payment_type' => $paymentType,
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 0,
            ]
        );

        if ($product->wasRecentlyCreated) {
            $this->stats['products_created']++;
        } else {
            $this->stats['products_updated']++;
        }

        // Sync all items for this product
        foreach ($items as $itemData) {
            $this->syncProductItem($product, $itemData);
        }
    }

    /**
     * Sync a product item (variant)
     */
    private function syncProductItem(Product $product, array $data): void
    {
        // Skip inactive products
        if (isset($data['seller_product_status']) && !$data['seller_product_status']) {
            $this->stats['items_skipped']++;
            return;
        }

        // Extract item name (remove brand prefix)
        $itemName = $this->extractItemName($data['product_name'], $product->brand);

        $productItem = ProductItem::updateOrCreate(
            ['digiflazz_code' => $data['buyer_sku_code']],
            [
                'product_id' => $product->id,
                'name' => $itemName,
                'description' => $data['desc'] ?? null,

                'base_price' => $data['price'] ?? 0,
                'retail_price' => $this->calculateRetailPrice($data['price'] ?? 0),
                'reseller_price' => $this->calculateResellerPrice($data['price'] ?? 0),
                'admin_fee' => $data['admin'] ?? 0,
                'retail_profit' => $this->calculateRetailProfit($data['price'] ?? 0),
                'reseller_profit' => $this->calculateResellerProfit($data['price'] ?? 0),

                'stock_status' => $this->mapStockStatus($data),
                'is_active' => $data['seller_product_status'] ?? true,

                'server_options' => null,
                'input_fields' => $this->generateInputFields($product->type),

                'last_synced_at' => now(),
            ]
        );

        if ($productItem->wasRecentlyCreated) {
            $this->stats['items_created']++;
        } else {
            $this->stats['items_updated']++;
        }
    }

    /**
     * Get or create category
     */
    private function getOrCreateCategory(string $categoryName): ProductCategory
    {
        $category = ProductCategory::firstOrCreate(
            ['slug' => Str::slug($categoryName)],
            [
                'name' => $categoryName,
                'description' => 'Auto-created from Digiflazz sync',
                'is_active' => true,
            ]
        );

        if ($category->wasRecentlyCreated) {
            $this->stats['categories_created']++;
        }

        return $category;
    }

    /**
     * Generate product name from brand
     */
    private function generateProductName(string $brand): string
    {
        // Remove common suffixes
        $name = preg_replace('/\s+(GAME|GAMES|VOUCHER|PULSA|DATA|PAKET)$/i', '', $brand);

        // Special cases for better naming
        $specialCases = [
            'FREE FIRE' => 'Free Fire',
            'MOBILE LEGENDS' => 'Mobile Legends',
            'PUBG' => 'PUBG Mobile',
            'VALORANT' => 'Valorant',
            'GENSHIN IMPACT' => 'Genshin Impact',
            'AXIS' => 'Axis',
            'TELKOMSEL' => 'Telkomsel',
            'INDOSAT' => 'Indosat',
            'XL' => 'XL Axiata',
            'TRI' => 'Tri',
            'SMARTFREN' => 'Smartfren',
            'DANA' => 'DANA',
            'OVO' => 'OVO',
            'GOPAY' => 'GoPay',
            'SHOPEEPAY' => 'ShopeePay',
            'PLN' => 'PLN',
        ];

        foreach ($specialCases as $key => $value) {
            if (stripos($brand, $key) !== false) {
                return $value;
            }
        }

        return ucwords(strtolower($name));
    }

    /**
     * Extract item name (remove brand prefix)
     */
    private function extractItemName(string $fullName, string $brand): string
    {
        // Remove brand from product name
        $name = str_ireplace($brand, '', $fullName);
        $name = trim($name);

        // Remove leading dash or space
        $name = ltrim($name, '- ');

        return $name ?: $fullName;
    }

    /**
     * Detect product type
     */
    private function detectType(array $data): string
    {
        $category = strtolower($data['category'] ?? '');
        $productName = strtolower($data['product_name'] ?? '');

        if (stripos($category, 'game') !== false || stripos($productName, 'diamond') !== false || stripos($productName, 'uc') !== false) {
            return 'game';
        }

        if (stripos($category, 'pulsa') !== false) {
            return 'pulsa';
        }

        if (stripos($category, 'data') !== false || stripos($category, 'paket') !== false) {
            return 'data';
        }

        if (stripos($category, 'pln') !== false || stripos($productName, 'token') !== false) {
            return 'pln';
        }

        if (stripos($category, 'voucher') !== false) {
            return 'voucher';
        }

        if (stripos($category, 'e-money') !== false || stripos($category, 'emoney') !== false) {
            return 'emoney';
        }

        return 'other';
    }

    /**
     * Detect payment type (prepaid/postpaid)
     */
    private function detectPaymentType(array $data): string
    {
        $type = strtolower($data['type'] ?? '');
        $category = strtolower($data['category'] ?? '');
        $productName = strtolower($data['product_name'] ?? '');

        // Check type field
        if (stripos($type, 'pasca') !== false) {
            return 'postpaid';
        }

        // Check category
        $postpaidCategories = [
            'pln pascabayar',
            'pdam',
            'telkom',
            'indihome',
            'tv kabel',
            'bpjs',
            'multifinance',
        ];

        foreach ($postpaidCategories as $postpaidCat) {
            if (stripos($category, $postpaidCat) !== false) {
                return 'postpaid';
            }
        }

        // Check product name
        if (stripos($productName, 'pascabayar') !== false || stripos($productName, 'pasca bayar') !== false) {
            return 'postpaid';
        }

        return 'prepaid';
    }

    /**
     * Calculate retail price (base + margin)
     */
    private function calculateRetailPrice(float $basePrice): float
    {
        return $basePrice + 2000; // Rp 2.000 margin
    }

    /**
     * Calculate reseller price (base + smaller margin)
     */
    private function calculateResellerPrice(float $basePrice): float
    {
        return $basePrice + 1000; // Rp 1.000 margin
    }

    /**
     * Calculate retail profit
     */
    private function calculateRetailProfit(float $basePrice): float
    {
        return 2000;
    }

    /**
     * Calculate reseller profit
     */
    private function calculateResellerProfit(float $basePrice): float
    {
        return 1000;
    }

    /**
     * Map stock status from Digiflazz
     */
    private function mapStockStatus(array $data): string
    {
        $buyerProductStatus = $data['buyer_product_status'] ?? true;
        $sellerProductStatus = $data['seller_product_status'] ?? true;

        if (!$buyerProductStatus || !$sellerProductStatus) {
            return 'empty';
        }

        return 'available';
    }

    /**
     * Generate input fields based on product type
     */
    private function generateInputFields(string $type): array
    {
        switch ($type) {
            case 'game':
                return [
                    ['name' => 'user_id', 'label' => 'User ID', 'type' => 'text', 'required' => true],
                    ['name' => 'zone_id', 'label' => 'Zone ID', 'type' => 'text', 'required' => true],
                ];

            case 'pulsa':
            case 'data':
            case 'emoney':
                return [
                    ['name' => 'phone', 'label' => 'Nomor HP', 'type' => 'tel', 'required' => true],
                ];

            case 'pln':
                return [
                    ['name' => 'meter_no', 'label' => 'Nomor Meter / ID Pelanggan', 'type' => 'text', 'required' => true],
                ];

            case 'voucher':
                return [
                    ['name' => 'email', 'label' => 'Email (Optional)', 'type' => 'email', 'required' => false],
                ];

            default:
                return [
                    ['name' => 'customer_no', 'label' => 'Nomor Pelanggan', 'type' => 'text', 'required' => true],
                ];
        }
    }

    /**
     * Display sync summary
     */
    private function displaySummary(): void
    {
        $this->table(
            ['Metric', 'Count'],
            [
                ['Products Created', $this->stats['products_created']],
                ['Products Updated', $this->stats['products_updated']],
                ['Items Created', $this->stats['items_created']],
                ['Items Updated', $this->stats['items_updated']],
                ['Items Skipped (Inactive)', $this->stats['items_skipped']],
                ['Categories Created', $this->stats['categories_created']],
            ]
        );
    }
}
