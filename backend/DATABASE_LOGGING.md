# Database Logging - Opsi Tambahan ✅

## Overview
Selain file logging, sistem juga menyediakan **Database Logging** untuk activity tracking yang lebih terstruktur dan mudah di-query.

## 📊 File vs Database Logging

### **Perbandingan:**

| Aspek | File Logging | Database Logging |
|-------|--------------|------------------|
| **Performance** | ⚡ Sangat cepat | 🔄 Sedikit overhead |
| **Query/Filter** | ❌ Sulit | ✅ Sangat mudah |
| **Analytics** | ❌ Perlu parsing | ✅ Built-in |
| **Storage** | 💾 Disk space | 💾 Database space |
| **Retention** | Manual cleanup | Auto cleanup |
| **Relasi** | ❌ Tidak ada | ✅ Ada (user, model) |
| **Dashboard** | ❌ Tidak ada | ✅ Ada |

### **Rekomendasi Penggunaan:**

| Jenis Log | File | Database | Alasan |
|-----------|------|----------|--------|
| **Error Logs** | ✅ | ✅ | File untuk debugging, DB untuk monitoring |
| **Query Logs** | ✅ | ❌ | Volume tinggi, akan membebani DB |
| **Transaction Logs** | ✅ | ✅ | Perlu analytics & relasi |
| **Payment Logs** | ✅ | ✅ | Audit trail penting |
| **API Logs** | ✅ | ❌ | Volume tinggi |
| **Auth Logs** | ✅ | ✅ | Security monitoring |

---

## 🗄️ Database Structure

### **Table: activity_logs**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | User yang melakukan aksi |
| type | string | Tipe aktivitas (transaction, payment, auth, error, api) |
| action | string | Aksi yang dilakukan (created, updated, deleted, etc) |
| description | text | Deskripsi aktivitas |
| model_type | string | Model class (nullable) |
| model_id | bigint | Model ID (nullable) |
| data | json | Data tambahan |
| ip_address | string | IP address |
| user_agent | text | User agent |
| created_at | timestamp | Waktu aktivitas |

**Indexes:**
- `user_id`
- `type`
- `action`
- `model_type, model_id`
- `created_at`

---

## 🔧 DatabaseLogger Service

### **Methods:**

#### 1. **log()** - Generic logging
```php
use App\Services\DatabaseLogger;

$logger = app(DatabaseLogger::class);

$logger->log(
    type: 'transaction',
    action: 'created',
    description: 'Transaction created',
    data: ['amount' => 50000],
    model: 'App\Models\Transaction',
    modelId: 1
);
```

#### 2. **logTransaction()** - Transaction logging
```php
$logger->logTransaction('created', $transaction, [
    'payment_method' => 'QRIS',
]);
```

#### 3. **logPayment()** - Payment logging
```php
$logger->logPayment('success', $payment, [
    'gateway_response' => $response,
]);
```

#### 4. **logAuth()** - Authentication logging
```php
$logger->logAuth('login', $user, [
    'ip' => request()->ip(),
]);
```

#### 5. **logError()** - Error logging
```php
$logger->logError('exception', $exception, [
    'context' => 'payment_processing',
]);
```

#### 6. **logApi()** - API logging
```php
$logger->logApi('request', [
    'status_code' => 200,
    'duration' => '125ms',
]);
```

---

## 📝 Usage Examples

### **1. Transaction Logging**

```php
use App\Services\DatabaseLogger;

class TransactionService
{
    protected $logger;
    
    public function __construct(DatabaseLogger $logger)
    {
        $this->logger = $logger;
    }
    
    public function createTransaction($user, $product, $data)
    {
        $transaction = Transaction::create([...]);
        
        // Log to database
        $this->logger->logTransaction('created', $transaction, [
            'product_name' => $product->name,
            'payment_method' => $data['payment_method'],
        ]);
        
        return $transaction;
    }
    
    public function markAsSuccess($transaction)
    {
        $transaction->update(['status' => 'success']);
        
        // Log status change
        $this->logger->logTransaction('success', $transaction, [
            'previous_status' => 'pending',
        ]);
    }
}
```

### **2. Payment Logging**

```php
// In TripayCallbackController
public function handle(Request $request)
{
    $payment = Payment::where('payment_code', $request->reference)->first();
    
    if ($request->status === 'PAID') {
        $payment->update(['status' => 'paid']);
        
        // Log payment success
        app(DatabaseLogger::class)->logPayment('paid', $payment, [
            'paid_at' => now(),
            'callback_data' => $request->all(),
        ]);
    }
}
```

### **3. Authentication Logging**

```php
// In AuthController
public function login(Request $request)
{
    $user = User::where('email', $request->email)->first();
    
    if (!Hash::check($request->password, $user->password)) {
        // Log failed login
        app(DatabaseLogger::class)->logAuth('login_failed', null, [
            'email' => $request->email,
            'ip' => $request->ip(),
        ]);
        
        throw new InvalidCredentialsException();
    }
    
    // Log successful login
    app(DatabaseLogger::class)->logAuth('login', $user);
    
    return $token;
}

public function logout()
{
    $user = auth()->user();
    
    // Log logout
    app(DatabaseLogger::class)->logAuth('logout', $user);
    
    auth()->user()->tokens()->delete();
}
```

### **4. Error Logging**

```php
// In Exception Handler (bootstrap/app.php)
$exceptions->render(function (TransactionFailedException $e) {
    // Log to database
    app(DatabaseLogger::class)->logError('transaction_failed', $e, [
        'user_id' => auth()->id(),
    ]);
    
    return ApiResponse::error($e->getMessage(), 400);
});
```

---

## 🎯 Admin API Endpoints

### **1. Get Activity Logs**
```bash
GET /api/admin/activity-logs
```

**Query Parameters:**
- `type` - Filter by type (transaction, payment, auth, error, api)
- `action` - Filter by action
- `user_id` - Filter by user
- `model_type` - Filter by model
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)
- `per_page` - Items per page (default: 50)

**Example:**
```bash
GET /api/admin/activity-logs?type=transaction&start_date=2026-01-01&per_page=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "type": "transaction",
        "action": "created",
        "description": "Transaction created: TRX-20260201-ABC123",
        "model_type": "App\\Models\\Transaction",
        "model_id": 1,
        "data": {
          "transaction_code": "TRX-20260201-ABC123",
          "amount": 25000,
          "status": "pending"
        },
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-02-01T10:00:00Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "total": 150,
    "per_page": 20
  }
}
```

### **2. Get Activity Log Detail**
```bash
GET /api/admin/activity-logs/{id}
Authorization: Bearer {token}
```

### **3. Get Activity Statistics**
```bash
GET /api/admin/activity-logs/statistics?start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_activities": 1500,
    "by_type": {
      "transaction": 800,
      "payment": 400,
      "auth": 200,
      "error": 50,
      "api": 50
    },
    "by_action": [
      {
        "action": "created",
        "count": 500
      },
      {
        "action": "success",
        "count": 400
      }
    ],
    "recent_errors": [...],
    "top_users": [...]
  }
}
```

### **4. Clean Old Logs**
```bash
POST /api/admin/activity-logs/clean
Authorization: Bearer {token}
Content-Type: application/json

{
  "days": 90
}
```

**Response:**
```json
{
  "success": true,
  "message": "1234 old logs deleted successfully"
}
```

---

## 🔄 Automatic Cleanup

### **Setup Scheduled Task**

**File:** `app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule)
{
    // Clean logs older than 90 days, run daily at 2 AM
    $schedule->call(function () {
        app(DatabaseLogger::class)->cleanOldLogs(90);
    })->dailyAt('02:00');
}
```

**Or create a command:**
```bash
php artisan make:command CleanActivityLogs
```

```php
// app/Console/Commands/CleanActivityLogs.php
public function handle()
{
    $days = $this->option('days', 90);
    $deleted = app(DatabaseLogger::class)->cleanOldLogs($days);
    
    $this->info("{$deleted} old logs deleted successfully");
}
```

**Run manually:**
```bash
php artisan logs:clean --days=90
```

---

## 📊 Analytics & Monitoring

### **Query Examples:**

#### 1. **Most Active Users**
```php
$topUsers = ActivityLog::selectRaw('user_id, COUNT(*) as count')
    ->whereNotNull('user_id')
    ->groupBy('user_id')
    ->orderByDesc('count')
    ->limit(10)
    ->with('user')
    ->get();
```

#### 2. **Error Trends**
```php
$errorTrends = ActivityLog::where('type', 'error')
    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
    ->groupBy('date')
    ->orderBy('date')
    ->get();
```

#### 3. **Transaction Activity**
```php
$transactionActivity = ActivityLog::where('type', 'transaction')
    ->where('action', 'created')
    ->whereBetween('created_at', [$startDate, $endDate])
    ->count();
```

#### 4. **Failed Login Attempts**
```php
$failedLogins = ActivityLog::where('type', 'auth')
    ->where('action', 'login_failed')
    ->whereDate('created_at', today())
    ->get();
```

---

## 🎨 Dashboard Integration

### **Example Dashboard Component:**

```php
// Get dashboard data
$dashboardData = [
    'today_transactions' => ActivityLog::where('type', 'transaction')
        ->whereDate('created_at', today())
        ->count(),
    
    'today_errors' => ActivityLog::where('type', 'error')
        ->whereDate('created_at', today())
        ->count(),
    
    'recent_activities' => ActivityLog::with('user')
        ->latest()
        ->limit(10)
        ->get(),
    
    'activity_chart' => ActivityLog::selectRaw('type, COUNT(*) as count')
        ->whereDate('created_at', '>=', now()->subDays(7))
        ->groupBy('type')
        ->get(),
];
```

---

## ⚙️ Configuration

### **Retention Policy:**

| Log Type | Retention | Reason |
|----------|-----------|--------|
| Transaction | 90 days | Audit & compliance |
| Payment | 365 days | Financial records |
| Auth | 30 days | Security monitoring |
| Error | 30 days | Debugging |
| API | 7 days | Performance monitoring |

### **Custom Retention:**

```php
// Clean specific log types
ActivityLog::where('type', 'api')
    ->where('created_at', '<', now()->subDays(7))
    ->delete();

ActivityLog::where('type', 'payment')
    ->where('created_at', '<', now()->subDays(365))
    ->delete();
```

---

## 🚀 Best Practices

### **1. Log Strategically**
```php
// ✅ Good - Log important events
$logger->logTransaction('created', $transaction);
$logger->logPayment('success', $payment);

// ❌ Bad - Don't log everything
$logger->log('debug', 'variable_value', ['value' => $x]); // Too much
```

### **2. Include Context**
```php
// ✅ Good - Include relevant context
$logger->logError('payment_failed', $e, [
    'user_id' => $user->id,
    'transaction_id' => $transaction->id,
    'payment_method' => $method,
]);

// ❌ Bad - No context
$logger->logError('error', $e);
```

### **3. Use Appropriate Types**
```php
// ✅ Good - Use specific types
$logger->logTransaction('created', $transaction);
$logger->logPayment('success', $payment);

// ❌ Bad - Generic types
$logger->log('info', 'something happened');
```

---

## 📈 Performance Considerations

### **Indexing:**
```sql
-- Already indexed in migration
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

### **Partitioning (Optional for large scale):**
```sql
-- Partition by month for better performance
ALTER TABLE activity_logs PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at));
```

### **Async Logging (Optional):**
```php
// Use queued jobs for high-volume logging
dispatch(new LogActivityJob($type, $action, $data));
```

---

## 📊 Summary

| Feature | Status |
|---------|--------|
| **Database Logger Service** | ✅ |
| **Admin API Endpoints** | ✅ (4 endpoints) |
| **Activity Statistics** | ✅ |
| **Auto Cleanup** | ✅ |
| **User Tracking** | ✅ |
| **Model Relations** | ✅ |
| **IP & User Agent** | ✅ |
| **JSON Data Storage** | ✅ |

**Total: 4 New Endpoints**
- `GET /api/admin/activity-logs`
- `GET /api/admin/activity-logs/statistics`
- `GET /api/admin/activity-logs/{id}`
- `POST /api/admin/activity-logs/clean`

---

## 🎯 Kesimpulan

**Hybrid Approach (File + Database):**
- ✅ File logging untuk debugging & high-volume logs
- ✅ Database logging untuk analytics & monitoring
- ✅ Best of both worlds!

**Kapan menggunakan apa:**
- **File only:** Query logs, API logs (high volume)
- **Database only:** Transaction logs, Payment logs (need analytics)
- **Both:** Error logs (file for debugging, DB for monitoring)
