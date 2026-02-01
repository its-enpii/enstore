<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
  protected $productService;

  public function __construct(ProductService $productService)
  {
    $this->productService = $productService;
  }

  /**
   * Get product list with hierarchical items
   */
  public function index(Request $request)
  {
    try {
      $filters = [
        'category_slug' => $request->get('category'),
        'type' => $request->get('type'),
        'featured' => $request->get('featured'),
        'search' => $request->get('search'),
        'sort_by' => $request->get('sort_by', 'sort_order'),
        'sort_order' => $request->get('sort_order', 'asc'),
      ];

      // Get user's customer type for pricing
      $user = auth()->user();
      $customerType = $user ? $user->customer_type : 'retail';

      $products = $this->productService->getActiveProducts($filters);

      // Hide sensitive fields from items and add price based on customer type
      $products->each(function ($product) use ($customerType) {
        $product->items->each(function ($item) use ($customerType) {
          $item->price = $item->getPriceForCustomer($customerType);
          $item->makeHidden(['base_price', 'retail_price', 'retail_profit', 'reseller_price', 'reseller_profit']);
        });

        // Add price range metadata for the parent product
        $range = $product->getPriceRange($customerType);
        $product->price_range = $range;
      });

      // Handle manual pagination since getActiveProducts returns a collection
      $perPage = $request->get('per_page', 20);
      $page = $request->get('page', 1);
      $total = $products->count();
      $paginatedProducts = $products->forPage($page, $perPage)->values();

      return response()->json([
        'success' => true,
        'data' => [
          'products' => $paginatedProducts,
          'pagination' => [
            'current_page' => (int) $page,
            'per_page' => (int) $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage),
          ],
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get products: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get product detail with items
   */
  public function show($id)
  {
    try {
      $product = $this->productService->getProductById($id);

      // Get user's customer type for pricing
      $user = auth()->user();
      $customerType = $user ? $user->customer_type : 'retail';

      // Add price and hide sensitive fields for each item
      $product->items->each(function ($item) use ($customerType) {
        $item->price = $item->getPriceForCustomer($customerType);
        $item->makeHidden(['base_price', 'retail_price', 'retail_profit', 'reseller_price', 'reseller_profit']);
      });

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
   * Get product detail by slug
   */
  public function showBySlug($slug)
  {
    try {
      $product = $this->productService->getProductBySlug($slug);

      $user = auth()->user();
      $customerType = $user ? $user->customer_type : 'retail';

      $product->items->each(function ($item) use ($customerType) {
        $item->price = $item->getPriceForCustomer($customerType);
        $item->makeHidden(['base_price', 'retail_price', 'retail_profit', 'reseller_price', 'reseller_profit']);
      });

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
   * Get product categories
   */
  public function categories()
  {
    try {
      $categories = $this->productService->getCategories();

      return response()->json([
        'success' => true,
        'data' => $categories,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get categories: ' . $e->getMessage(),
      ], 500);
    }
  }
}
