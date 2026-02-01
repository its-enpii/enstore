<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductItem;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

            // Filter by category
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            // Search by name or brand
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                        ->orWhere('brand', 'like', '%' . $request->search . '%');
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
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
