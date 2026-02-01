<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Product;
use App\Models\BalanceMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
  /**
   * Generate sales report
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function salesReport(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
      'group_by' => 'nullable|in:day,week,month',
    ]);

    try {
      $startDate = $request->start_date;
      $endDate = $request->end_date;
      $groupBy = $request->get('group_by', 'day');

      $query = Transaction::whereBetween('created_at', [$startDate, $endDate])
        ->where('status', 'success');

      // Group by period
      $dateFormat = match ($groupBy) {
        'week' => '%Y-%u',
        'month' => '%Y-%m',
        default => '%Y-%m-%d',
      };

      $sales = $query->selectRaw("
                DATE_FORMAT(created_at, '{$dateFormat}') as period,
                COUNT(*) as total_transactions,
                SUM(total_price) as total_revenue,
                SUM(admin_fee) as total_profit,
                AVG(total_price) as average_transaction
            ")
        ->groupBy('period')
        ->orderBy('period')
        ->get();

      $summary = [
        'total_transactions' => $query->count(),
        'total_revenue' => $query->sum('total_price'),
        'total_profit' => $query->sum('admin_fee'),
        'average_transaction' => $query->avg('total_price'),
      ];

      return response()->json([
        'success' => true,
        'data' => [
          'summary' => $summary,
          'details' => $sales,
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to generate sales report: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Generate product report
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function productReport(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    try {
      $startDate = $request->start_date;
      $endDate = $request->end_date;

      $products = DB::table('transactions')
        ->join('product_items', 'transactions.product_item_id', '=', 'product_items.id')
        ->join('products', 'product_items.product_id', '=', 'products.id')
        ->whereBetween('transactions.created_at', [$startDate, $endDate])
        ->where('transactions.status', 'success')
        ->selectRaw('
                    product_items.id,
                    CONCAT(products.name, " - ", product_items.name) as name,
                    product_items.digiflazz_code,
                    COUNT(*) as total_sales,
                    SUM(transactions.total_price) as total_revenue,
                    SUM(transactions.admin_fee) as total_profit,
                    AVG(transactions.total_price) as average_price
                ')
        ->groupBy('product_items.id', 'products.name', 'product_items.name', 'product_items.digiflazz_code')
        ->orderByDesc('total_sales')
        ->get();

      return response()->json([
        'success' => true,
        'data' => $products,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to generate product report: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Generate user report
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function userReport(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    try {
      $startDate = $request->start_date;
      $endDate = $request->end_date;

      $users = DB::table('users')
        ->leftJoin('transactions', function ($join) use ($startDate, $endDate) {
          $join->on('users.id', '=', 'transactions.user_id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->where('transactions.status', 'success');
        })
        ->selectRaw('
                    users.id,
                    users.name,
                    users.email,
                    users.customer_type,
                    COUNT(transactions.id) as total_transactions,
                    COALESCE(SUM(transactions.total_price), 0) as total_spent
                ')
        ->groupBy('users.id', 'users.name', 'users.email', 'users.customer_type')
        ->orderByDesc('total_spent')
        ->get();

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to generate user report: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Generate balance report
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function balanceReport(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    try {
      $startDate = $request->start_date;
      $endDate = $request->end_date;

      $mutations = BalanceMutation::whereBetween('created_at', [$startDate, $endDate])
        ->selectRaw('
                    type,
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount
                ')
        ->groupBy('type')
        ->get();

      $summary = [
        'total_credit' => $mutations->where('type', 'credit')->first()->total_amount ?? 0,
        'total_debit' => $mutations->where('type', 'debit')->first()->total_amount ?? 0,
        'credit_count' => $mutations->where('type', 'credit')->first()->total_count ?? 0,
        'debit_count' => $mutations->where('type', 'debit')->first()->total_count ?? 0,
      ];

      $summary['net_balance'] = $summary['total_credit'] - $summary['total_debit'];

      return response()->json([
        'success' => true,
        'data' => [
          'summary' => $summary,
          'details' => $mutations,
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to generate balance report: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Generate payment method report
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function paymentMethodReport(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    try {
      $startDate = $request->start_date;
      $endDate = $request->end_date;

      $paymentMethods = Transaction::whereBetween('created_at', [$startDate, $endDate])
        ->where('status', 'success')
        ->selectRaw('
                    payment_method,
                    COUNT(*) as total_transactions,
                    SUM(total_price) as total_revenue,
                    SUM(admin_fee) as total_fees,
                    AVG(total_price) as average_transaction
                ')
        ->groupBy('payment_method')
        ->orderByDesc('total_revenue')
        ->get();

      return response()->json([
        'success' => true,
        'data' => $paymentMethods,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to generate payment method report: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Export report to CSV
   * 
   * @param Request $request
   * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
   */
  public function exportTransactions(Request $request)
  {
    $request->validate([
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    try {
      $transactions = Transaction::with(['user', 'product'])
        ->whereBetween('created_at', [$request->start_date, $request->end_date])
        ->get();

      $csv = "Transaction Code,Date,User,Product,Type,Amount,Status,Payment Method\n";

      foreach ($transactions as $transaction) {
        $csv .= implode(',', [
          $transaction->transaction_code,
          $transaction->created_at->format('Y-m-d H:i:s'),
          $transaction->user->name ?? 'N/A',
          $transaction->product_name,
          $transaction->transaction_type,
          $transaction->total_price,
          $transaction->status,
          $transaction->payment_method,
        ]) . "\n";
      }

      return response($csv)
        ->header('Content-Type', 'text/csv')
        ->header('Content-Disposition', 'attachment; filename="transactions_' . date('Y-m-d') . '.csv"');
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to export transactions: ' . $e->getMessage(),
      ], 500);
    }
  }
}
