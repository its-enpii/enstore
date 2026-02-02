<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductItemController extends Controller
{
  /**
   * Get product item detail
   */
  public function show($id)
  {
    try {
      $item = ProductItem::with('product')->findOrFail($id);
      return response()->json([
        'success' => true,
        'data' => $item
      ]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => 'Product item not found'], 404);
    }
  }

  /**
   * Create new product item associated with parent product
   */
  public function store(Request $request, $productId)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'digiflazz_code' => 'required|string|unique:product_items,digiflazz_code',
      'base_price' => 'required|numeric|min:0',
      'retail_price' => 'required|numeric|min:0',
      'reseller_price' => 'required|numeric|min:0',
      'retail_profit' => 'sometimes|numeric|min:0',
      'reseller_profit' => 'sometimes|numeric|min:0',
      'stock_status' => 'sometimes|string|in:available,empty,maintenance',
      'is_active' => 'boolean',
      'description' => 'nullable|string',
      'server_options' => 'nullable|array',
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
      $product = Product::findOrFail($productId);

      $data = $validator->validated();
      $data['product_id'] = $product->id;

      // Auto calculate profit if not provided
      if (!isset($data['retail_profit'])) {
        $data['retail_profit'] = $data['retail_price'] - $data['base_price'];
      }
      if (!isset($data['reseller_profit'])) {
        $data['reseller_profit'] = $data['reseller_price'] - $data['base_price'];
      }

      $item = ProductItem::create($data);

      return response()->json([
        'success' => true,
        'message' => 'Product item created successfully',
        'data' => $item,
      ], 201);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create product item: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update product item (variant)
   */
  public function update(Request $request, $id)
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
      $item = ProductItem::findOrFail($id);
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
   * Delete product item
   */
  public function destroy($id)
  {
    try {
      $item = ProductItem::findOrFail($id);
      $item->delete();
      return response()->json([
        'success' => true,
        'message' => 'Product item deleted successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete product item: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Bulk update prices for product items
   */
  public function bulkUpdate(Request $request)
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
}
