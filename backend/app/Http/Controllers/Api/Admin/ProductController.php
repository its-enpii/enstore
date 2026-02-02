<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductItem;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Get all parent products with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Product::with(['category', 'items']);

            // 1. TRULY DYNAMIC FILTERING (Schema Aware)
            $tableName = (new Product())->getTable();
            $tableColumns = Schema::getColumnListing($tableName);

            // Exclude kolom sensitif/internal jika perlu (opsional)
            $excludedColumns = ['description', 'deleted_at'];

            foreach ($request->all() as $key => $value) {
                if ($value === null || $value === '') continue;

                // A. Handle Kolom Tabel Utama (Direct Column)
                if (in_array($key, $tableColumns) && !in_array($key, $excludedColumns)) {
                    // Auto-detect boolean
                    if ($value === 'true' || $value === 'false') {
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    }
                    $query->where($key, $value);
                }

                // B. Handle Relasi (Dot Notation: category.name)
                elseif (str_contains($key, '.')) {
                    [$relation, $field] = explode('.', $key);

                    // Cek apakah method relasi ada di model
                    if (method_exists(Product::class, $relation)) {
                        $query->whereHas($relation, function ($q) use ($field, $value) {
                            // Sederhana: kita asumsikan field-nya ada di tabel relasi (atau bisa pakai Schema check lagi tapi costly)
                            $q->where($field, $value);
                        });
                    }
                }
            }

            // Flexible Search (Global Search Bar) - Configurable Approach
            if ($request->filled('search')) {
                $search = $request->search;

                // Konfigurasi kolom yang bisa dicari (tinggal tambah di sini jika mau expand)
                $searchableFields = ['name', 'brand'];

                // Konfigurasi relasi yang bisa dicari
                $searchableRelations = [
                    'category' => ['name', 'slug'],
                    'items' => ['name', 'digiflazz_code']
                ];

                $query->where(function ($q) use ($search, $searchableFields, $searchableRelations) {
                    // 1. Loop kolom di tabel utama
                    foreach ($searchableFields as $field) {
                        $q->orWhere($field, 'like', '%' . $search . '%');
                    }

                    // 2. Loop kolom di tabel relasi
                    foreach ($searchableRelations as $relation => $fields) {
                        $q->orWhereHas($relation, function ($relQuery) use ($search, $fields) {
                            $relQuery->where(function ($nestedQ) use ($search, $fields) {
                                foreach ($fields as $field) {
                                    $nestedQ->orWhere($field, 'like', '%' . $search . '%');
                                }
                            });
                        });
                    }
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = (int) $request->get('per_page', 20);
            if ($perPage > 100) $perPage = 100;

            $products = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get products: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single parent product with its items
     */
    public function show($id)
    {
        try {
            $product = Product::with(['category', 'items' => function ($q) {
                $q->orderBy('sort_order', 'asc');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }
    }

    /**
     * Create new parent product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug',
            'brand' => 'required|string|max:100',
            'type' => 'required|string|in:game,pulsa,data,pln,pascabayar,other',
            'payment_type' => 'required|string|in:prepaid,postpaid',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $product = Product::create($validator->validated());

            if (method_exists($this->productService, 'clearCache')) {
                $this->productService->clearCache();
            }

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update parent product
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:product_categories,id',
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $id,
            'brand' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|in:game,pulsa,data,pln,pascabayar,other',
            'payment_type' => 'sometimes|string|in:prepaid,postpaid',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $product = Product::findOrFail($id);
            $product->update($validator->validated());

            if (method_exists($this->productService, 'clearCache')) {
                $this->productService->clearCache();
            }

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update product item (variant)
     */
    public function updateItem(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'base_price' => 'sometimes|numeric|min:0',
            'retail_price' => 'sometimes|numeric|min:0',
            'retail_profit' => 'sometimes|numeric|min:0',
            'reseller_price' => 'sometimes|numeric|min:0',
            'reseller_profit' => 'sometimes|numeric|min:0',
            'is_active' => 'boolean',
            'stock_status' => 'sometimes|string|in:available,out_of_stock,under_maintenance',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $item = ProductItem::findOrFail($itemId);
            $item->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Product item updated successfully',
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update prices for product items
     */
    public function bulkUpdatePrices(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:product_items,id',
            'items.*.retail_price' => 'sometimes|numeric|min:0',
            'items.*.retail_profit' => 'sometimes|numeric|min:0',
            'items.*.reseller_price' => 'sometimes|numeric|min:0',
            'items.*.reseller_profit' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updated = 0;

            foreach ($request->items as $itemData) {
                $item = ProductItem::find($itemData['id']);
                if ($item) {
                    $item->update(array_intersect_key($itemData, array_flip([
                        'retail_price',
                        'retail_profit',
                        'reseller_price',
                        'reseller_profit'
                    ])));
                    $updated++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "{$updated} product items updated successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product items: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync products from Digiflazz
     */
    public function syncFromDigiflazz()
    {
        try {
            \Illuminate\Support\Facades\Artisan::call('digiflazz:sync-products');
            $output = \Illuminate\Support\Facades\Artisan::output();

            return response()->json([
                'success' => true,
                'message' => 'Product sync completed successfully.',
                'output' => $output
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync products: ' . $e->getMessage(),
            ], 500);
        }
    }
}
