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
   * Get product list with filters
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    try {
      $filters = [
        'category_slug' => $request->get('category'),
        'featured' => $request->get('featured'),
        'search' => $request->get('search'),
        'sort_by' => $request->get('sort_by', 'sort_order'),
        'sort_order' => $request->get('sort_order', 'asc'),
      ];

      // Get user's customer type for pricing
      $user = auth()->user();
      $customerType = $user ? $user->customer_type : 'retail';

      $products = $this->productService->getActiveProducts($filters);

      // Add price for customer type
      $products = $products->map(function ($product) use ($customerType) {
        $product->price = $product->getPriceForCustomerType($customerType);
        $product->makeHidden(['base_price', 'retail_price', 'retail_profit', 'reseller_price', 'reseller_profit']);
        return $product;
      });

      // Filter by price range
      if ($request->has('min_price')) {
        $products = $products->filter(function ($product) use ($request) {
          return $product->price >= $request->min_price;
        });
      }

      if ($request->has('max_price')) {
        $products = $products->filter(function ($product) use ($request) {
          return $product->price <= $request->max_price;
        });
      }

      // Paginate manually
      $perPage = $request->get('per_page', 20);
      $page = $request->get('page', 1);
      $total = $products->count();
      $products = $products->forPage($page, $perPage)->values();

      return response()->json([
        'success' => true,
        'data' => [
          'products' => $products,
          'pagination' => [
            'current_page' => $page,
            'per_page' => $perPage,
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
   * Get product detail
   * 
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function show($id)
  {
    try {
      $product = $this->productService->getProductById($id);

      // Check availability
      $availability = $this->productService->checkAvailability($product);

      // Get user's customer type for pricing
      $user = auth()->user();
      $customerType = $user ? $user->customer_type : 'retail';

      // Add price and availability
      $product->price = $product->getPriceForCustomerType($customerType);
      $product->available = $availability['available'];
      $product->availability_message = $availability['reason'];

      // Hide sensitive fields
      $product->makeHidden(['base_price', 'retail_price', 'retail_profit', 'reseller_price', 'reseller_profit']);

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
   * 
   * @return \Illuminate\Http\JsonResponse
   */
  public function categories()
  {
    try {
      $categories = $this->productService->getCategoriesWithProductCount();

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
