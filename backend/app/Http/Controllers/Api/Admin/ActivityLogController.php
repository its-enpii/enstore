<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseLogger;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
  protected $logger;

  public function __construct(DatabaseLogger $logger)
  {
    $this->logger = $logger;
  }

  /**
   * Get activity logs
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    try {
      $filters = [
        'type' => $request->get('type'),
        'action' => $request->get('action'),
        'user_id' => $request->get('user_id'),
        'model_type' => $request->get('model_type'),
        'start_date' => $request->get('start_date'),
        'end_date' => $request->get('end_date'),
        'per_page' => $request->get('per_page', 50),
      ];

      $logs = $this->logger->getLogs($filters);

      return response()->json([
        'success' => true,
        'data' => $logs,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get activity logs: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single activity log
   * 
   * @param int $id
   * @return \Illuminate\Http\JsonResponse
   */
  public function show($id)
  {
    try {
      $log = ActivityLog::with('user')->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => $log,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Activity log not found',
      ], 404);
    }
  }

  /**
   * Get activity statistics
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function statistics(Request $request)
  {
    try {
      $startDate = $request->get('start_date', now()->startOfMonth());
      $endDate = $request->get('end_date', now()->endOfMonth());

      $query = ActivityLog::whereBetween('created_at', [$startDate, $endDate]);

      $stats = [
        'total_activities' => $query->count(),
        'by_type' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
          ->selectRaw('type, COUNT(*) as count')
          ->groupBy('type')
          ->get()
          ->pluck('count', 'type'),
        'by_action' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
          ->selectRaw('action, COUNT(*) as count')
          ->groupBy('action')
          ->orderByDesc('count')
          ->limit(10)
          ->get(),
        'recent_errors' => ActivityLog::where('type', 'error')
          ->whereBetween('created_at', [$startDate, $endDate])
          ->latest()
          ->limit(10)
          ->get(),
        'top_users' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
          ->whereNotNull('user_id')
          ->selectRaw('user_id, COUNT(*) as count')
          ->groupBy('user_id')
          ->orderByDesc('count')
          ->limit(10)
          ->with('user')
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

  /**
   * Clean old logs
   * 
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function clean(Request $request)
  {
    $request->validate([
      'days' => 'required|integer|min:1|max:365',
    ]);

    try {
      $deleted = $this->logger->cleanOldLogs($request->days);

      return response()->json([
        'success' => true,
        'message' => "{$deleted} old logs deleted successfully",
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to clean logs: ' . $e->getMessage(),
      ], 500);
    }
  }
}
