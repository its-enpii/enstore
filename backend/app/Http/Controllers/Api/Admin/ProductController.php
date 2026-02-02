<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductItem;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
            $query = Product::with(['category']);

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

                // B. Handle Relasi (Dot Notation OR Underscore Notation due to PHP conversion)
                // e.g. 'category.slug' (JSON) or 'category_slug' (GET Param)
                else {
                    $relation = null;
                    $field = null;

                    // Coba pecah berdasarkan titik (JSON/Body)
                    if (str_contains($key, '.')) {
                        [$relation, $field] = explode('.', $key, 2);
                    }
                    // Coba pecah berdasarkan underscore pertama (GET Param)
                    elseif (str_contains($key, '_')) {
                        // Strategi: Split di underscore pertama. 
                        // Jika 'user_name' -> relation 'user', field 'name'
                        // Risiko: konflik jika nama relation mengandung underscore. 
                        // Tapi convention Laravel relation biasanya camelCase (productItem), bukan snake_case.
                        [$relation, $field] = explode('_', $key, 2);
                    }

                    // Jika kandidat relation ditemukan dan method-nya ada di Model
                    if ($relation && $field && method_exists(Product::class, $relation)) {
                        $query->whereHas($relation, function ($q) use ($field, $value) {
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'input_fields' => 'nullable|array',
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
            $data = $validator->validated();

            // Handle Image Upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $data['image'] = url('storage/' . $path);
            }

            $product = Product::create($data);

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'input_fields' => 'nullable|array',
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

            $data = $validator->validated();

            // Handle Image Upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($product->image) {
                    $this->deleteImage($product->image);
                }

                $path = $request->file('image')->store('products', 'public');
                $data['image'] = url('storage/' . $path);
            }

            $product->update($data);

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

    /**
     * Delete parent product
     */
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            // Delete image if exists
            if ($product->image) {
                $this->deleteImage($product->image);
            }

            // Delete items if not cascaded by database
            $product->items()->delete();
            $product->delete();

            if (method_exists($this->productService, 'clearCache')) {
                $this->productService->clearCache();
            }

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to delete image from storage
     */
    private function deleteImage($fullUrl)
    {
        if (!$fullUrl) return;

        try {
            // Convert full URL to relative storage path
            // Example: http://domain.com/storage/products/abc.jpg -> products/abc.jpg
            $baseUrl = url('storage/');
            $path = str_replace($baseUrl, '', $fullUrl);
            $path = ltrim($path, '/');

            // Safety check: ensure we are not deleting outside
            if (strpos($path, 'http') === false && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        } catch (\Exception $e) {
            // Ignore error if image specific cleanup fails, as product deletion is priority
        }
    }
}
