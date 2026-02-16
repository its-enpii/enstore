<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    /**
     * Display a listing of vouchers.
     */
    public function index(Request $request)
    {
        try {
            $query = Voucher::with(['product']);

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('code', 'like', '%'.$request->search.'%')
                        ->orWhere('name', 'like', '%'.$request->search.'%');
                });
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            $vouchers = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $vouchers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get vouchers: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created voucher.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:vouchers,code|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_transaction' => 'numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'user_limit' => 'integer|min:1',
            'product_id' => 'nullable|exists:products,id',
            'customer_type' => 'required|in:retail,reseller,all',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $voucher = Voucher::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Voucher created successfully',
                'data' => $voucher,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create voucher: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified voucher.
     */
    public function show($id)
    {
        try {
            $voucher = Voucher::with(['product'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $voucher,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher not found',
            ], 404);
        }
    }

    /**
     * Update the specified voucher.
     */
    public function update(Request $request, $id)
    {
        try {
            $voucher = Voucher::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'code' => 'sometimes|required|string|max:50|unique:vouchers,code,'.$id,
                'name' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|in:percentage,fixed',
                'value' => 'sometimes|required|numeric|min:0',
                'min_transaction' => 'numeric|min:0',
                'max_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:0',
                'user_limit' => 'integer|min:1',
                'product_id' => 'nullable|exists:products,id',
                'customer_type' => 'sometimes|required|in:retail,reseller,all',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $voucher->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Voucher updated successfully',
                'data' => $voucher,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update voucher: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified voucher.
     */
    public function destroy($id)
    {
        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->delete();

            return response()->json([
                'success' => true,
                'message' => 'Voucher deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete voucher: '.$e->getMessage(),
            ], 500);
        }
    }
}
