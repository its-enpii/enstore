<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductService
{
  /**
   * Get all active products with caching
   * 
   * @param array $filters
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getActiveProducts(array $filters = [])
  {
    $cacheKey = 'products.active.' . md5(json_encode($filters));

    return Cache::remember($cacheKey, 300, function () use ($filters) {
      $query = Product::active()->with('category');

      // Filter by category
      if (!empty($filters['category_id'])) {
        $query->where('category_id', $filters['category_id']);
      }

      // Filter by category slug
      if (!empty($filters['category_slug'])) {
        $query->whereHas('category', function ($q) use ($filters) {
          $q->where('slug', $filters['category_slug']);
        });
      }

      // Filter by featured
      if (isset($filters['featured']) && $filters['featured']) {
        $query->featured();
      }

      // Search by name
      if (!empty($filters['search'])) {
        $query->where('name', 'like', '%' . $filters['search'] . '%');
      }

      // Sort
      $sortBy = $filters['sort_by'] ?? 'sort_order';
      $sortOrder = $filters['sort_order'] ?? 'asc';
      $query->orderBy($sortBy, $sortOrder);

      return $query->get();
    });
  }

  /**
   * Get product by ID with validation
   * 
   * @param int $id
   * @return Product
   * @throws \Exception
   */
  public function getProductById($id)
  {
    $product = Product::with('category')->find($id);

    if (!$product) {
      throw new \Exception('Product not found');
    }

    return $product;
  }

  /**
   * Get product by Digiflazz code
   * 
   * @param string $code
   * @return Product|null
   */
  public function getProductByDigiflazzCode($code)
  {
    return Product::where('digiflazz_code', $code)->first();
  }

  /**
   * Check product availability
   * 
   * @param Product $product
   * @return array
   */
  public function checkAvailability(Product $product)
  {
    $available = true;
    $reason = null;

    // Check if product is active
    if (!$product->is_active) {
      $available = false;
      $reason = 'Product is not active';
    }

    // Check stock (if applicable)
    if ($product->stock !== null && $product->stock <= 0) {
      $available = false;
      $reason = 'Product is out of stock';
    }

    // Check if product is available (custom scope)
    if (!$product->is_available) {
      $available = false;
      $reason = 'Product is not available';
    }

    return [
      'available' => $available,
      'reason' => $reason,
    ];
  }

  /**
   * Get product price for customer type
   * 
   * @param Product $product
   * @param string $customerType
   * @return float
   */
  public function getPrice(Product $product, $customerType = 'retail')
  {
    return $product->getPriceForCustomerType($customerType);
  }

  /**
   * Get product profit for customer type
   * 
   * @param Product $product
   * @param string $customerType
   * @return float
   */
  public function getProfit(Product $product, $customerType = 'retail')
  {
    return $product->getProfitForCustomerType($customerType);
  }

  /**
   * Increment product total sold
   * 
   * @param Product $product
   * @param int $quantity
   * @return void
   */
  public function incrementTotalSold(Product $product, $quantity = 1)
  {
    $product->increment('total_sold', $quantity);

    Log::info('Product total sold incremented', [
      'product_id' => $product->id,
      'product_name' => $product->name,
      'quantity' => $quantity,
      'new_total' => $product->fresh()->total_sold,
    ]);
  }

  /**
   * Decrement product stock
   * 
   * @param Product $product
   * @param int $quantity
   * @return void
   * @throws \Exception
   */
  public function decrementStock(Product $product, $quantity = 1)
  {
    if ($product->stock === null) {
      // Unlimited stock
      return;
    }

    if ($product->stock < $quantity) {
      throw new \Exception('Insufficient stock');
    }

    $product->decrement('stock', $quantity);

    Log::info('Product stock decremented', [
      'product_id' => $product->id,
      'product_name' => $product->name,
      'quantity' => $quantity,
      'remaining_stock' => $product->fresh()->stock,
    ]);
  }

  /**
   * Get categories with product count
   * 
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getCategoriesWithProductCount()
  {
    return Cache::remember('categories.with_count', 300, function () {
      return ProductCategory::where('is_active', true)
        ->withCount(['products' => function ($query) {
          $query->active();
        }])
        ->orderBy('sort_order')
        ->get();
    });
  }

  /**
   * Clear product cache
   * 
   * @return void
   */
  public function clearCache()
  {
    Cache::forget('products.active.*');
    Cache::forget('categories.with_count');

    Log::info('Product cache cleared');
  }

  /**
   * Sync product from Digiflazz
   * 
   * @param array $digiflazzProduct
   * @return Product
   */
  public function syncFromDigiflazz(array $digiflazzProduct)
  {
    $product = Product::updateOrCreate(
      ['digiflazz_code' => $digiflazzProduct['buyer_sku_code']],
      [
        'name' => $digiflazzProduct['product_name'],
        'category_id' => $this->getCategoryIdFromType($digiflazzProduct['category'] ?? 'other'),
        'description' => $digiflazzProduct['desc'] ?? null,
        'base_price' => $digiflazzProduct['price'] ?? 0,
        'retail_price' => $digiflazzProduct['price'] ?? 0,
        'retail_profit' => 0,
        'reseller_price' => $digiflazzProduct['price'] ?? 0,
        'reseller_profit' => 0,
        'is_active' => $digiflazzProduct['seller_product_status'] ?? true,
        'is_available' => $digiflazzProduct['buyer_product_status'] ?? true,
        'last_synced_at' => now(),
      ]
    );

    $this->clearCache();

    return $product;
  }

  /**
   * Get category ID from Digiflazz type
   * 
   * @param string $type
   * @return int|null
   */
  private function getCategoryIdFromType($type)
  {
    $typeMapping = [
      'games' => 'games',
      'pulsa' => 'pulsa',
      'data' => 'paket-data',
      'pln' => 'pln',
      'emoney' => 'e-money',
      'voucher' => 'voucher',
    ];

    $slug = $typeMapping[strtolower($type)] ?? 'voucher';

    $category = ProductCategory::where('slug', $slug)->first();

    return $category ? $category->id : null;
  }
}
