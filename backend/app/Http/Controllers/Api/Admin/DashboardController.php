<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
  /**
   * Get dashboard statistics
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    try {
      $period = $request->get('period', 'today'); // today, week, month, year

      $startDate = $this->getStartDate($period);
      $endDate = now();

      $stats = [
        'overview' => $this->getOverviewStats($startDate, $endDate),
        'revenue' => $this->getRevenueStats($startDate, $endDate),
        'transactions' => $this->getTransactionStats($startDate, $endDate),
        'products' => $this->getProductStats(),
        'users' => $this->getUserStats(),
        'charts' => $this->getChartData($startDate, $endDate),
      ];

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get dashboard data: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get overview statistics
   */
  private function getOverviewStats($startDate, $endDate)
  {
    $currentPeriod = Transaction::whereBetween('created_at', [$startDate, $endDate]);
    $previousStart = $startDate->copy()->sub($endDate->diffInDays($startDate), 'days');
    $previousPeriod = Transaction::whereBetween('created_at', [$previousStart, $startDate]);

    $currentRevenue = $currentPeriod->where('status', 'success')->sum('total_price');
    $previousRevenue = $previousPeriod->where('status', 'success')->sum('total_price');
    $revenueGrowth = $previousRevenue > 0
      ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
      : 0;

    $currentTransactions = $currentPeriod->count();
    $previousTransactions = $previousPeriod->count();
    $transactionGrowth = $previousTransactions > 0
      ? (($currentTransactions - $previousTransactions) / $previousTransactions) * 100
      : 0;

    return [
      'total_revenue' => $currentRevenue,
      'revenue_growth' => round($revenueGrowth, 2),
      'total_transactions' => $currentTransactions,
      'transaction_growth' => round($transactionGrowth, 2),
      'success_rate' => $currentTransactions > 0
        ? round(($currentPeriod->where('status', 'success')->count() / $currentTransactions) * 100, 2)
        : 0,
    ];
  }

  /**
   * Get revenue statistics
   */
  private function getRevenueStats($startDate, $endDate)
  {
    $query = Transaction::whereBetween('created_at', [$startDate, $endDate])
      ->where('status', 'success');

    return [
      'total_revenue' => $query->sum('total_price'),
      'total_profit' => $query->sum('admin_fee'),
      'average_transaction_value' => $query->avg('total_price'),
      'by_type' => [
        'purchase' => $query->where('transaction_type', 'purchase')->sum('total_price'),
        'topup' => $query->where('transaction_type', 'topup')->sum('total_price'),
      ],
    ];
  }

  /**
   * Get transaction statistics
   */
  private function getTransactionStats($startDate, $endDate)
  {
    $query = Transaction::whereBetween('created_at', [$startDate, $endDate]);

    return [
      'total' => $query->count(),
      'success' => $query->where('status', 'success')->count(),
      'pending' => $query->where('status', 'pending')->count(),
      'processing' => $query->where('status', 'processing')->count(),
      'failed' => $query->where('status', 'failed')->count(),
      'by_payment_method' => Transaction::whereBetween('created_at', [$startDate, $endDate])
        ->selectRaw('payment_method, COUNT(*) as count')
        ->groupBy('payment_method')
        ->get()
        ->pluck('count', 'payment_method'),
    ];
  }

  /**
   * Get product statistics
   */
  private function getProductStats()
  {
    return [
      'total_products' => Product::count(),
      'active_products' => Product::where('is_active', true)->count(),
      'featured_products' => Product::where('is_featured', true)->count(),
      'out_of_stock' => ProductItem::where('stock_status', 'empty')->count(),
      'top_selling' => ProductItem::with('product')
        ->orderBy('total_sold', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->product ? $item->product->name . ' - ' . $item->name : $item->name,
                'total_sold' => $item->total_sold,
            ];
        }),
    ];
  }

  /**
   * Get user statistics
   */
  private function getUserStats()
  {
    return [
      'total_users' => User::count(),
      'active_users' => User::where('status', 'active')->count(),
      'new_users_today' => User::whereDate('created_at', today())->count(),
      'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
      'by_customer_type' => [
        'retail' => User::where('customer_type', 'retail')->count(),
        'reseller' => User::where('customer_type', 'reseller')->count(),
      ],
    ];
  }

  /**
   * Get chart data
   */
  private function getChartData($startDate, $endDate)
  {
    // Daily revenue chart
    $dailyRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
      ->where('status', 'success')
      ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as count')
      ->groupBy('date')
      ->orderBy('date')
      ->get();

    // Transaction status distribution
    $statusDistribution = Transaction::whereBetween('created_at', [$startDate, $endDate])
      ->selectRaw('status, COUNT(*) as count')
      ->groupBy('status')
      ->get()
      ->pluck('count', 'status');

    // Top products
    $topProducts = DB::table('transactions')
      ->join('product_items', 'transactions.product_item_id', '=', 'product_items.id')
      ->join('products', 'product_items.product_id', '=', 'products.id')
      ->whereBetween('transactions.created_at', [$startDate, $endDate])
      ->where('transactions.status', 'success')
      ->selectRaw('CONCAT(products.name, " - ", product_items.name) as name, COUNT(*) as sales, SUM(transactions.total_price) as revenue')
      ->groupBy('products.id', 'products.name', 'product_items.id', 'product_items.name')
      ->orderByDesc('sales')
      ->limit(10)
      ->get();

    return [
      'daily_revenue' => $dailyRevenue,
      'status_distribution' => $statusDistribution,
      'top_products' => $topProducts,
    ];
  }

  /**
   * Get start date based on period
   */
  private function getStartDate($period)
  {
    return match ($period) {
      'today' => now()->startOfDay(),
      'week' => now()->startOfWeek(),
      'month' => now()->startOfMonth(),
      'year' => now()->startOfYear(),
      default => now()->startOfDay(),
    };
  }
}
