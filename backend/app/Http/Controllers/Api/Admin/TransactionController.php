<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
  protected $transactionService;

  public function __construct(TransactionService $transactionService)
  {
    $this->transactionService = $transactionService;
  }

  /**
   * Get all transactions with filters
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    try {
      $query = Transaction::with(['user', 'productItem.product', 'payment']);

      // Filter by type
      if ($request->has('type')) {
        $query->where('transaction_type', $request->type);
      }

      // Filter by status
      if ($request->has('status')) {
        $query->where('status', $request->status);
      }

      // Filter by payment status
      if ($request->has('payment_status')) {
        $query->where('payment_status', $request->payment_status);
      }

      // Filter by user
      if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
      }

      // Filter by date range
      if ($request->has('start_date')) {
        $query->whereDate('created_at', '>=', $request->start_date);
      }

      if ($request->has('end_date')) {
        $query->whereDate('created_at', '<=', $request->end_date);
      }

      // Search
      if ($request->has('search')) {
        $query->where(function ($q) use ($request) {
          $q->where('transaction_code', 'like', '%' . $request->search . '%')
            ->orWhere('product_name', 'like', '%' . $request->search . '%');
        });
      }

      // Sort
      $sortBy = $request->get('sort_by', 'created_at');
      $sortOrder = $request->get('sort_order', 'desc');
      $query->orderBy($sortBy, $sortOrder);

      // Paginate
      $perPage = $request->get('per_page', 20);
      $transactions = $query->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => $transactions,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get transactions: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single transaction
   * 
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function show($id)
  {
    try {
      $transaction = Transaction::with(['user', 'productItem.product', 'payment', 'logs'])
        ->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => $transaction,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Transaction not found',
      ], 404);
    }
  }

  /**
   * Update transaction status
   * 
   * @param Request $request
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function updateStatus(Request $request, $id)
  {
    $request->validate([
      'status' => 'required|in:pending,processing,success,failed,cancelled',
      'reason' => 'nullable|string',
    ]);

    try {
      $transaction = Transaction::findOrFail($id);

      if ($request->status === 'success') {
        $this->transactionService->markAsSuccess($transaction);
      } elseif ($request->status === 'failed') {
        $this->transactionService->markAsFailed($transaction, $request->reason);
      } else {
        $this->transactionService->updateStatus($transaction, $request->status);
      }

      return response()->json([
        'success' => true,
        'message' => 'Transaction status updated successfully',
        'data' => $transaction->fresh(),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update status: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get transaction statistics
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function statistics(Request $request)
  {
    try {
      $startDate = $request->get('start_date', now()->startOfMonth());
      $endDate = $request->get('end_date', now()->endOfMonth());

      $query = Transaction::whereBetween('created_at', [$startDate, $endDate]);

      $stats = [
        'total_transactions' => $query->count(),
        'total_revenue' => $query->where('status', 'success')->sum('total_price'),
        'total_profit' => $query->where('status', 'success')->sum('admin_fee'),
        'success_count' => $query->where('status', 'success')->count(),
        'pending_count' => $query->where('status', 'pending')->count(),
        'failed_count' => $query->where('status', 'failed')->count(),
        'by_type' => [
          'purchase' => $query->where('transaction_type', 'purchase')->count(),
          'topup' => $query->where('transaction_type', 'topup')->count(),
        ],
        'by_payment_method' => Transaction::whereBetween('created_at', [$startDate, $endDate])
          ->selectRaw('payment_method, COUNT(*) as count, SUM(total_price) as total')
          ->groupBy('payment_method')
          ->get(),
      ];

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get statistics: ' . $e->getMessage(),
      ], 500);
    }
  }
}
