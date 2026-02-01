<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class DatabaseLogger
{
  /**
   * Log activity to database
   * 
   * @param string $type
   * @param string $action
   * @param string|null $description
   * @param array $data
   * @param string|null $model
   * @param int|null $modelId
   * @return ActivityLog
   */
  public function log(
    string $type,
    string $action,
    ?string $description = null,
    array $data = [],
    ?string $model = null,
    ?int $modelId = null
  ): ActivityLog {
    return ActivityLog::create([
      'user_id' => Auth::id(),
      'action' => $action,
      'description' => $description,
      'model_type' => $model,
      'model_id' => $modelId,
      'meta_data' => array_merge(['log_type' => $type], $data),
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Log transaction activity
   */
  public function logTransaction(string $action, $transaction, array $additionalData = []): ActivityLog
  {
    return $this->log(
      type: 'transaction',
      action: $action,
      description: "Transaction {$action}: {$transaction->transaction_code}",
      data: array_merge([
        'transaction_code' => $transaction->transaction_code,
        'amount' => $transaction->total_price,
        'status' => $transaction->status,
      ], $additionalData),
      model: get_class($transaction),
      modelId: $transaction->id
    );
  }

  /**
   * Log payment activity
   */
  public function logPayment(string $action, $payment, array $additionalData = []): ActivityLog
  {
    return $this->log(
      type: 'payment',
      action: $action,
      description: "Payment {$action}: {$payment->payment_code}",
      data: array_merge([
        'payment_code' => $payment->payment_code,
        'payment_method' => $payment->payment_method,
        'amount' => $payment->amount,
        'status' => $payment->status,
      ], $additionalData),
      model: get_class($payment),
      modelId: $payment->id
    );
  }

  /**
   * Log authentication activity
   */
  public function logAuth(string $action, $user = null, array $additionalData = []): ActivityLog
  {
    return $this->log(
      type: 'auth',
      action: $action,
      description: "User {$action}",
      data: array_merge([
        'email' => $user?->email,
      ], $additionalData),
      model: $user ? get_class($user) : null,
      modelId: $user?->id
    );
  }

  /**
   * Log error activity
   */
  public function logError(string $action, \Throwable $exception, array $additionalData = []): ActivityLog
  {
    return $this->log(
      type: 'error',
      action: $action,
      description: $exception->getMessage(),
      data: array_merge([
        'exception' => get_class($exception),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString(),
      ], $additionalData)
    );
  }

  /**
   * Log API activity
   */
  public function logApi(string $action, array $data = []): ActivityLog
  {
    return $this->log(
      type: 'api',
      action: $action,
      description: "API {$action}: " . request()->method() . ' ' . request()->path(),
      data: array_merge([
        'method' => request()->method(),
        'url' => request()->fullUrl(),
        'status_code' => $data['status_code'] ?? null,
        'duration' => $data['duration'] ?? null,
      ], $data)
    );
  }

  /**
   * Log external API request/response
   * 
   * @param string $provider
   * @param string $action
   * @param array $request
   * @param array $response
   * @param bool $isSuccess
   * @return ActivityLog
   */
  public function logExternalApi(
    string $provider,
    string $action,
    array $request = [],
    array $response = [],
    bool $isSuccess = true
  ): ActivityLog {
    return $this->log(
      type: 'external_api',
      action: $action,
      description: "External API {$provider} {$action}",
      data: [
        'provider' => $provider,
        'request' => $request,
        'response' => $response,
        'success' => $isSuccess,
      ]
    );
  }

  /**
   * Get logs with filters
   */
  public function getLogs(array $filters = [])
  {
    $query = ActivityLog::with('user');

    if (isset($filters['type'])) {
      $query->where('type', $filters['type']);
    }

    if (isset($filters['action'])) {
      $query->where('action', $filters['action']);
    }

    if (isset($filters['user_id'])) {
      $query->where('user_id', $filters['user_id']);
    }

    if (isset($filters['model_type'])) {
      $query->where('model_type', $filters['model_type']);
    }

    if (isset($filters['start_date'])) {
      $query->whereDate('created_at', '>=', $filters['start_date']);
    }

    if (isset($filters['end_date'])) {
      $query->whereDate('created_at', '<=', $filters['end_date']);
    }

    return $query->latest()->paginate($filters['per_page'] ?? 50);
  }

  /**
   * Clean old logs
   */
  public function cleanOldLogs(int $days = 90): int
  {
    return ActivityLog::where('created_at', '<', now()->subDays($days))->delete();
  }
}
