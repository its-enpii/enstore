<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductItem;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ProductService
{
    /**
     * Get all active products with hierarchical structure
     */
    public function getActiveProducts(array $filters = [], string $customerType = 'retail')
    {
        // Partition cache by customer type to prevent pricing leaks/stale prices between roles
        $cacheKey = 'products.active.h.'.$customerType.'.'.md5(json_encode($filters));

        return Cache::remember($cacheKey, 300, function () use ($filters) {
            $query = Product::active()->with(['category']);

            // 1. TRULY DYNAMIC FILTERING (Schema Aware)
            $tableName = (new Product)->getTable();
            $tableColumns = Schema::getColumnListing($tableName);

            foreach ($filters as $key => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                // Special logic for Category Slug from frontend
                if ($key === 'category') {
                    $query->whereHas('category', fn ($q) => $q->where('slug', $value));

                    continue;
                }

                // Special logic "featured" string
                if ($key === 'featured') {
                    if (filter_var($value, FILTER_VALIDATE_BOOLEAN)) {
                        $query->featured();
                    }

                    continue;
                }

                // A. Direct Columns
                if (in_array($key, $tableColumns)) {
                    if ($value === 'true' || $value === 'false') {
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    }
                    $query->where($key, $value);
                }

                // B. Relations (Dot or Underscore)
                else {
                    $relation = null;
                    $field = null;

                    if (str_contains($key, '.')) {
                        [$relation, $field] = explode('.', $key, 2);
                    } elseif (str_contains($key, '_')) {
                        [$relation, $field] = explode('_', $key, 2);
                    }

                    if ($relation && $field && method_exists(Product::class, $relation)) {
                        $query->whereHas($relation, function ($q) use ($field, $value) {
                            $q->where($field, $value);
                        });
                    }
                }
            }

            // 2. Flexible Search
            if (! empty($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($catQ) use ($search) {
                            $catQ->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('items', function ($itemQ) use ($search) {
                            $itemQ->where('name', 'like', "%{$search}%")
                                ->orWhere('digiflazz_code', 'like', "%{$search}%");
                        });
                });
            }

            // Sort
            $sortBy = $filters['sort_by'] ?? 'sort_order';
            $sortOrder = $filters['sort_order'] ?? 'asc';
            $query->orderBy($sortBy, $sortOrder);

            return $query->paginate($filters['per_page'] ?? 10);
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
        if (! $item->is_active) {
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
        try {
            Cache::flush();
        } catch (\Exception $e) {
            // Redis error?
        }
        Log::info('Product cache cleared');

        return true;
    }
}
