<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseLogger;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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
      $query = ActivityLog::with('user');

      // 1. TRULY DYNAMIC FILTERING
      $tableName = (new ActivityLog())->getTable();
      $tableColumns = Schema::getColumnListing($tableName);

      foreach ($request->all() as $key => $value) {
        if ($value === null || $value === '') continue;

        // Handle Date separate logic below
        if ($key === 'start_date' || $key === 'end_date') continue;

        // A. Direct Columns
        if (in_array($key, $tableColumns)) {
          $query->where($key, $value);
        }

        // B. Relations
        else {
          $relation = null;
          $field = null;

          if (str_contains($key, '.')) {
            [$relation, $field] = explode('.', $key, 2);
          } elseif (str_contains($key, '_')) {
            [$relation, $field] = explode('_', $key, 2);
          }

          if ($relation && $field && method_exists(ActivityLog::class, $relation)) {
            $query->whereHas($relation, function ($q) use ($field, $value) {
              $q->where($field, $value);
            });
          }
        }
      }
      // Filter Date Range
      if ($request->has('start_date')) {
        $query->whereDate('created_at', '>=', $request->start_date);
      }
      if ($request->has('end_date')) {
        $query->whereDate('created_at', '<=', $request->end_date);
      }

      // 2. Flexible Search
      if ($request->filled('search')) {
        $search = $request->search;
        $searchableFields = ['description', 'action']; // removed type as it is in meta_data
        $searchableRelations = [
          'user' => ['name', 'email']
        ];

        $query->where(function ($q) use ($search, $searchableFields, $searchableRelations) {
          foreach ($searchableFields as $field) {
            $q->orWhere($field, 'like', '%' . $search . '%');
          }
          foreach ($searchableRelations as $relation => $fields) {
            $q->orWhereHas($relation, function ($relQuery) use ($search, $fields) {
              $relQuery->where(function ($nestedQ) use ($search, $fields) {
                foreach ($fields as $field) {
                  $nestedQ->orWhere($field, 'like', '%' . $search . '%');
                }
              });
            });
          }
        });
      }
      // Sort
      $sortBy = $request->get('sort_by', 'created_at');
      $sortOrder = $request->get('sort_order', 'desc');
      $query->orderBy($sortBy, $sortOrder);

      // Pagination with max limit safety
      $perPage = (int) $request->get('per_page', 50);
      if ($perPage > 100) $perPage = 100; // Prevent abuse

      $logs = $query->paginate($perPage);

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
          ->selectRaw("JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.log_type')) as log_type, COUNT(*) as count")
          ->groupBy('log_type')
          ->get()
          ->pluck('count', 'log_type'),
        'by_action' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
          ->selectRaw('action, COUNT(*) as count')
          ->groupBy('action')
          ->orderByDesc('count')
          ->limit(10)
          ->get(),
        'recent_errors' => ActivityLog::where('meta_data->log_type', 'error')
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
