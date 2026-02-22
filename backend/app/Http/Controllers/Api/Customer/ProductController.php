<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Helper to get customer type from optional auth.
     * Uses multi-layer detection to ensure resellers are correctly identified
     * even on unprotected public routes.
     */
    private function getCustomerType(): string
    {
        try {
            // Layer 1: Check if Sanctum guard already has the user
            $user = Auth::guard('sanctum')->user();
            if ($user) {
                return $user->customer_type;
            }

            // Layer 2: Manually find token from Authorization header if guard didn't pick it up
            $token = request()->bearerToken();
            if ($token) {
                $accessToken = PersonalAccessToken::findToken($token);
                if ($accessToken && $accessToken->tokenable) {
                    $user = $accessToken->tokenable;
                    // Important: Authenticate the user for the rest of this request
                    Auth::guard('sanctum')->setUser($user);

                    return $user->customer_type;
                }
            }
        } catch (\Exception $e) {
            Log::error('[AUTH_DETECTION] Error: ' . $e->getMessage());
        }

        return 'retail';
    }

    /**
     * Get product list with hierarchical items
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->all();
            $customerType = $this->getCustomerType();

            $products = $this->productService->getActiveProducts($filters, $customerType);

            $products->getCollection()->each(function ($product) use ($customerType) {
                // Eager load items if they aren't there
                if (! $product->relationLoaded('items')) {
                    $product->load(['items' => function ($q) {
                        $q->active()->available()->orderBy('sort_order', 'asc');
                    }]);
                }

                $product->items->each(function ($item) use ($customerType) {
                    $price = $item->getPriceForCustomer($customerType);
                    $item->price = $price;
                    $item->retail_price = $price;
                    $item->makeHidden(['base_price', 'reseller_price', 'reseller_profit', 'retail_profit']);
                });

                $product->price_range = $product->getPriceRange($customerType);
                $product->makeHidden(['provider', 'server_options', 'items']); // Hide sensitive/internal fields and avoid heavy items payload in list
            });

            return response()->json([
                'success' => true,
                'role' => $customerType,
                'data' => $products,
            ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get product detail
     */
    public function show($id)
    {
        try {
            $product = $this->productService->getProductById($id);
            $customerType = $this->getCustomerType();

            $product->items->each(function ($item) use ($customerType) {
                $price = $item->getPriceForCustomer($customerType);
                $item->price = $price;
                $item->retail_price = $price;
                $item->makeHidden(['base_price', 'reseller_price', 'reseller_profit', 'retail_profit']);
            });

            $product->makeHidden(['provider', 'server_options']);

            return response()->json([
                'success' => true,
                'role' => $customerType,
                'data' => $product,
            ])->header('Cache-Control', 'no-store');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
    }

    /**
     * Get product detail by slug
     */
    public function showBySlug($slug)
    {
        try {
            $product = $this->productService->getProductBySlug($slug);
            $customerType = $this->getCustomerType();

            $product->items->each(function ($item) use ($customerType) {
                $price = $item->getPriceForCustomer($customerType);
                $item->price = $price;
                $item->retail_price = $price;
                $item->makeHidden(['base_price', 'reseller_price', 'reseller_profit', 'retail_profit']);
            });

            $product->makeHidden(['provider', 'server_options']);

            return response()->json([
                'success' => true,
                'role' => $customerType,
                'data' => $product,
            ])->header('Cache-Control', 'no-store');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
    }

    public function categories()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->productService->getCategories(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
