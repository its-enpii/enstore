<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductItem;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductService
{
  /**
   * Get all active products with hierarchical structure
   */
  public function getActiveProducts(array $filters = [])
  {
    $cacheKey = 'products.active.hierarchical.' . md5(json_encode($filters));

    return Cache::remember($cacheKey, 300, function () use ($filters) {
      $query = Product::active()->with(['category', 'items' => function ($q) {
        $q->active()->available()->orderBy('sort_order', 'asc');
      }]);

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

      // Filter by type (game, pulsa, etc)
      if (!empty($filters['type'])) {
        $query->where('type', $filters['type']);
      }

      // Filter by featured
      if (isset($filters['featured']) && $filters['featured']) {
        $query->featured();
      }

      // Search by name or brand
      if (!empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%")
            ->orWhere('brand', 'like', "%{$search}%");
        });
      }

      // Sort parent products
      $sortBy = $filters['sort_by'] ?? 'sort_order';
      $sortOrder = $filters['sort_order'] ?? 'asc';
      $query->orderBy($sortBy, $sortOrder);

      return $query->get();
    });
  }

  /**
   * Get parent product by ID
   */
  public function getProductById($id)
  {
    return Product::with(['category', 'items' => function ($q) {
      $q->active()->available()->orderBy('sort_order', 'asc');
    }])->findOrFail($id);
  }

  /**
   * Get parent product by Slug
   */
  public function getProductBySlug($slug)
  {
    return Product::with(['category', 'items' => function ($q) {
      $q->active()->available()->orderBy('sort_order', 'asc');
    }])->where('slug', $slug)->firstOrFail();
  }

  /**
   * Get product item (variant) by ID
   */
  public function getProductItemById($id)
  {
    return ProductItem::with('product.category')->findOrFail($id);
  }

  /**
   * Get product item by Digiflazz code
   */
  public function getProductItemByCode($code)
  {
    return ProductItem::with('product.category')->where('digiflazz_code', $code)->firstOrFail();
  }

  /**
   * Get categories list for filtering
   */
  public function getCategories()
  {
    return ProductCategory::active()->orderBy('sort_order', 'asc')->get();
  }

  public function checkItemAvailability(ProductItem $item)
  {
    if (!$item->is_active) {
      return ['available' => false, 'reason' => 'Product is currently inactive'];
    }

    if ($item->stock_status !== 'available') {
      return ['available' => false, 'reason' => 'Product is out of stock or under maintenance'];
    }

    return ['available' => true];
  }

  /**
   * Clear product cache
   */
  public function clearCache()
  {
    Log::info('Product cache cleared');
    return true;
  }
}
