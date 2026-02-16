<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\ProductItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResellerAnalyticsController extends Controller
{
    /**
     * Get analytics dashboard summary
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Date range (default to current month)
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Base query for successful purchase transactions
        $query = Transaction::where('user_id', $user->id)
            ->where('status', 'success')
            ->where('transaction_type', 'purchase')
            ->whereBetween('created_at', [$startDate, $endDate]);

        // 1. Summary Stats
        $totalSpending = (float) $query->sum('total_price');
        $transactionCount = $query->count();
        
        // Success Rate (using all transactions in period, not just success)
        $allTransactions = Transaction::where('user_id', $user->id)
            ->where('transaction_type', 'purchase')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $successRate = $allTransactions > 0 
            ? round(($transactionCount / $allTransactions) * 100, 1) 
            : 0;

        // 2. Spending Chart Data (Daily)
        $chartData = $query->clone()
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'count' => (int) $item->count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_spending' => $totalSpending,
                    'transaction_count' => $transactionCount,
                    'success_rate' => $successRate,
                ],
                'chart_data' => $chartData,
            ],
        ]);
    }

    /**
     * Get top purchased products
     */
    public function topProducts(Request $request)
    {
        $user = $request->user();
        $limit = $request->input('limit', 5);
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $topProducts = Transaction::where('user_id', $user->id)
            ->where('status', 'success')
            ->where('transaction_type', 'purchase')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                product_name, 
                COUNT(*) as count, 
                SUM(total_price) as total_spent
            ')
            ->groupBy('product_name')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }
}
