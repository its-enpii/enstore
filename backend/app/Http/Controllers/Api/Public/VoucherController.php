<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
  /**
   * Display a listing of available vouchers.
   */
  public function index(Request $request)
  {
    $user = $request->user('sanctum');

    $vouchers = Voucher::active()
      ->with('product:id,name')
      ->when($user, function ($query) use ($user) {
        $query->withCount(['usages as user_usage_count' => function ($q) use ($user) {
          $q->where('user_id', $user->id);
        }]);
      })
      ->select([
        'id',
        'code',
        'name',
        'type',
        'value',
        'description',
        'start_date',
        'end_date',
        'min_transaction',
        'max_discount',
        'usage_limit',
        'usage_count',
        'user_limit',
        'product_id'
      ])
      ->get()
      ->map(function ($voucher) use ($user) {
        $usedCount = $voucher->user_usage_count ?? 0;
        $userRemaining = max(0, $voucher->user_limit - $usedCount);
        $isAvailable = $userRemaining > 0;

        return [
          'id'              => $voucher->id,
          'code'            => $voucher->code,
          'name'            => $voucher->name,
          'type'            => $voucher->type,
          'value'           => $voucher->value,
          'description'     => $voucher->description,
          'start_date'      => $voucher->start_date,
          'end_date'        => $voucher->end_date,
          'min_transaction' => $voucher->min_transaction,
          'max_discount'    => $voucher->max_discount,
          'product_name'    => $voucher->product ? $voucher->product->name : null,
          'is_available'    => $isAvailable,
          'user_remaining'  => $userRemaining,
        ];
      });

    return response()->json([
      'success' => true,
      'message' => 'Available vouchers retrieved successfully',
      'data'    => $vouchers
    ]);
  }
}
