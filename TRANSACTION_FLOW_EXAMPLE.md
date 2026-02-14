# 🎮 Alur Top Up Mobile Legends - Enstore

## 📋 Scenario
**Pelanggan ingin top up 100 Diamond Mobile Legends**

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Customer   │
│ (Guest/User) │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Browse Products                                             │
│ ------------------------------------------------------------------- │
│ Frontend: GET /api/products?category=mobile-legends                 │
│ Backend:  ProductController@index                                   │
│ Service:  ProductService->getActiveProducts()                       │
│ Cache:    Cache::remember('products.active.*', 300)                 │
│ Response: List of ML Diamond products                               │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: Select Product                                              │
│ ------------------------------------------------------------------- │
│ Customer selects: "100 Diamond Mobile Legends - Rp 25,000"          │
│ Input required:                                                     │
│   - User ID: 123456789                                              │
│   - Zone ID: 1234                                                   │
│   - Email: customer@example.com (optional)                          │
│   - Phone: 08123456789 (optional)                                   │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Transaction (Guest/Customer)                         │
│ ------------------------------------------------------------------- │
│ Frontend: POST /api/public/transactions (guest)                     │
│           POST /api/customer/transactions (logged in)               │
│                                                                     │
│ Request Body:                                                       │
│ {                                                                   │
│   "product_id": 123,                                                │
│   "quantity": 1,                                                    │
│   "customer_data": {                                                │
│     "user_id": "123456789",                                         │
│     "zone_id": "1234",                                              │
│     "email": "customer@example.com",                                │
│     "phone": "08123456789"                                          │
│   },                                                                │
│   "payment_method": "QRIS"                                          │
│ }                                                                   │
│                                                                     │
│ Backend Process:                                                    │
│ 1. Validate request (StoreTransactionRequest)                       │
│ 2. Check product availability (ProductService)                      │
│ 3. Calculate price (retail/reseller based on user)                  │
│ 4. Create transaction (TransactionService)                          │
│ 5. Create payment via Tripay (TripayService)                        │
│                                                                     │
│ Database Changes:                                                   │
│ - INSERT into transactions (status: pending)                        │
│ - INSERT into payments (status: pending)                            │
│ - INSERT into transaction_logs                                      │
│ - INSERT into activity_logs (external_api: Tripay)                  │
│                                                                     │
│ Response:                                                           │
│ {                                                                   │
│   "transaction_code": "TRX-20260201-001",                           │
│   "payment": {                                                      │
│     "payment_code": "PAY-20260201-001",                             │
│     "qr_url": "https://tripay.co.id/qr/xxx",                        │
│     "amount": 25000,                                                │
│     "expired_at": "2026-02-01 18:35:00"                             │
│   }                                                                 │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: Customer Pays via QRIS                                      │
│ ------------------------------------------------------------------- │
│ Customer scans QR code and pays Rp 25,000                           │
│ Payment processed by Tripay                                         │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: Tripay Callback (Payment Success)                           │
│ ------------------------------------------------------------------- │
│ Tripay: POST /api/tripay/callback                                   │
│                                                                     │
│ Callback Data:                                                      │
│ {                                                                   │
│   "reference": "PAY-20260201-001",                                  │
│   "status": "PAID",                                                 │
│   "amount": 25000,                                                  │
│   "paid_at": "2026-02-01 17:40:00"                                  │
│ }                                                                   │
│                                                                     │
│ Backend Process:                                                    │
│ 1. Validate signature (TripayService->validateCallbackSignature)    │
│ 2. Find payment by reference                                        │
│ 3. Update payment status to 'paid'                                  │
│ 4. Update transaction status to 'processing'                        │
│ 5. Dispatch job: ProcessDigiflazzOrder                              │
│                                                                     │
│ Database Changes:                                                   │
│ - UPDATE payments SET status='paid', paid_at=now()                  │
│ - UPDATE transactions SET status='processing'                       │
│ - INSERT into transaction_logs (payment_received)                   │
│ - INSERT into activity_logs (external_api: Tripay callback)         │
│                                                                     │
│ Queue:                                                              │
│ - Job: ProcessDigiflazzOrder dispatched to Redis queue              │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: Process Digiflazz Order (Background Job)                    │
│ ------------------------------------------------------------------- │
│ Queue Worker picks up: ProcessDigiflazzOrder                         │
│                                                                     │
│ Job Process:                                                        │
│ 1. Get transaction data                                             │
│ 2. Prepare Digiflazz request                                        │
│    {                                                                │
│      "username": "lefapaDLpVXD",                                    │
│      "buyer_sku_code": "ml100",                                     │
│      "customer_no": "123456789",                                    │
│      "ref_id": "TRX-20260201-001",                                  │
│      "sign": "generated_signature"                                  │
│    }                                                                │
│ 3. Send to Digiflazz API (DigiflazzService->createTransaction)      │
│ 4. Log request/response to activity_logs                            │
│                                                                     │
│ Digiflazz Response (Success):                                       │
│ {                                                                   │
│   "data": {                                                         │
│     "ref_id": "TRX-20260201-001",                                   │
│     "status": "Sukses",                                             │
│     "sn": "100 Diamond telah dikirim ke 123456789",                 │
│     "buyer_sku_code": "ml100",                                      │
│     "price": 24500                                                  │
│   }                                                                 │
│ }                                                                   │
│                                                                     │
│ Database Changes:                                                   │
│ - UPDATE transactions SET                                           │
│     status='completed',                                             │
│     digiflazz_trx_id='DGF-xxx',                                     │
│     serial_number='100 Diamond telah dikirim...',                   │
│     completed_at=now()                                              │
│ - UPDATE products SET total_sold = total_sold + 1                   │
│ - INSERT into transaction_logs (order_completed)                    │
│ - INSERT into activity_logs (external_api: Digiflazz)               │
│                                                                     │
│ Notification:                                                       │
│ - Send email to customer (if provided)                              │
│ - Send WhatsApp notification (if configured)                        │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: Customer Receives Notification                              │
│ ------------------------------------------------------------------- │
│ Email Content:                                                      │
│ ┌─────────────────────────────────────────────────────────┐        │
│ │ Subject: Top Up Berhasil - TRX-20260201-001            │        │
│ │                                                         │        │
│ │ Halo Customer,                                          │        │
│ │                                                         │        │
│ │ Top up Anda telah berhasil!                             │        │
│ │                                                         │        │
│ │ Detail Transaksi:                                       │        │
│ │ - Produk: 100 Diamond Mobile Legends                    │        │
│ │ - User ID: 123456789 (1234)                             │        │
│ │ - Serial Number: 100 Diamond telah dikirim...           │        │
│ │ - Total: Rp 25,000                                      │        │
│ │ - Status: Completed                                     │        │
│ │                                                         │        │
│ │ Terima kasih telah berbelanja di Enstore!               │        │
│ └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 8: Customer Checks In-Game                                     │
│ ------------------------------------------------------------------- │
│ Customer opens Mobile Legends                                       │
│ 100 Diamond sudah masuk ke akun                                     │
│ ✅ Transaction Complete!                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Technical Flow

### **1. Browse Products**

**Endpoint:** `GET /api/products?category=mobile-legends`

**Controller:** `ProductController@index`

```php
public function index(Request $request)
{
    $products = $this->productService->getActiveProducts([
        'category_slug' => 'mobile-legends',
        'search' => $request->search,
    ]);
    
    return response()->json($products);
}
```

**Service:** `ProductService->getActiveProducts()`

```php
public function getActiveProducts(array $filters = [])
{
    $cacheKey = 'products.active.' . md5(json_encode($filters));
    
    return Cache::remember($cacheKey, 300, function () use ($filters) {
        return Product::active()
            ->with('category')
            ->where('category_id', $categoryId)
            ->orderBy('sort_order')
            ->get();
    });
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "name": "100 Diamond Mobile Legends",
      "category": "Mobile Legends",
      "retail_price": 25000,
      "reseller_price": 24000,
      "description": "Top up 100 Diamond ML",
      "is_available": true
    }
  ]
}
```

---

### **2. Create Transaction**

**Endpoint:** `POST /api/public/transactions` (guest) or `POST /api/customer/transactions` (logged in)

**Controller:** `PublicTransactionController@store` or `TransactionController@store`

**Request Validation:**
```php
// StoreTransactionRequest
public function rules()
{
    return [
        'product_id' => 'required|exists:products,id',
        'quantity' => 'required|integer|min:1',
        'customer_data' => 'required|array',
        'customer_data.user_id' => 'required|string',
        'customer_data.zone_id' => 'nullable|string',
        'customer_data.email' => 'nullable|email',
        'customer_data.phone' => 'nullable|string',
        'payment_method' => 'required|string',
    ];
}
```

**Service Flow:**

```php
// 1. Check product availability
$product = $this->productService->checkAvailability($productId, $quantity);

// 2. Calculate price
$price = $user ? $product->reseller_price : $product->retail_price;
$totalPrice = $price * $quantity;

// 3. Create transaction
DB::beginTransaction();

$transaction = Transaction::create([
    'user_id' => $user?->id,
    'transaction_code' => $this->generateTransactionCode(),
    'product_id' => $product->id,
    'quantity' => $quantity,
    'price' => $price,
    'total_price' => $totalPrice,
    'customer_data' => $customerData,
    'status' => 'pending',
]);

// 4. Create payment via Tripay
$tripayResponse = $this->tripayService->createTransaction([
    'method' => $paymentMethod,
    'merchant_ref' => $transaction->transaction_code,
    'amount' => $totalPrice,
    'customer_name' => $customerData['name'] ?? 'Guest',
    'customer_email' => $customerData['email'] ?? 'guest@enstore.com',
    'customer_phone' => $customerData['phone'] ?? '08123456789',
]);

// 5. Create payment record
$payment = Payment::create([
    'transaction_id' => $transaction->id,
    'payment_code' => $this->generatePaymentCode(),
    'payment_method' => $paymentMethod,
    'amount' => $totalPrice,
    'tripay_reference' => $tripayResponse['reference'],
    'status' => 'pending',
    'expired_at' => $tripayResponse['expired_time'],
]);

// 6. Log activity
$this->logger->logTransaction('created', $transaction);

DB::commit();
```

---

### **3. Tripay Callback**

**Endpoint:** `POST /api/tripay/callback`

**Controller:** `TripayCallbackController@handle`

```php
public function handle(Request $request)
{
    // 1. Validate signature
    if (!$this->tripayService->validateCallbackSignature($request)) {
        return response()->json(['message' => 'Invalid signature'], 403);
    }
    
    // 2. Find payment
    $payment = Payment::where('tripay_reference', $request->reference)->first();
    
    // 3. Update payment status
    DB::beginTransaction();
    
    $payment->update([
        'status' => 'paid',
        'paid_at' => now(),
    ]);
    
    // 4. Update transaction status
    $transaction = $payment->transaction;
    $transaction->update(['status' => 'processing']);
    
    // 5. Dispatch job
    ProcessDigiflazzOrder::dispatch($transaction);
    
    // 6. Log activity
    $this->logger->logPayment('paid', $payment);
    
    DB::commit();
    
    return response()->json(['success' => true]);
}
```

---

### **4. Process Digiflazz Order (Background Job)**

**Job:** `ProcessDigiflazzOrder`

```php
public function handle()
{
    DB::beginTransaction();
    
    try {
        // 1. Prepare request
        $digiflazzRequest = [
            'username' => config('digiflazz.username'),
            'buyer_sku_code' => $this->transaction->product->sku_code,
            'customer_no' => $this->getCustomerNumber(),
            'ref_id' => $this->transaction->transaction_code,
            'sign' => $this->generateSignature(),
        ];
        
        // 2. Send to Digiflazz
        $response = $this->digiflazzService->createTransaction($digiflazzRequest);
        
        // 3. Handle response
        if ($response['data']['status'] === 'Sukses') {
            // Success
            $this->transaction->update([
                'status' => 'completed',
                'digiflazz_trx_id' => $response['data']['trx_id'],
                'serial_number' => $response['data']['sn'],
                'completed_at' => now(),
            ]);
            
            // Update product stats
            $this->transaction->product->increment('total_sold');
            
            // Send notification
            $this->sendNotification();
            
        } elseif ($response['data']['status'] === 'Pending') {
            // Pending - dispatch check status job
            CheckDigiflazzOrderStatus::dispatch($this->transaction)
                ->delay(now()->addMinutes(2));
                
        } else {
            // Failed
            $this->transaction->update([
                'status' => 'failed',
                'failed_reason' => $response['data']['message'],
                'failed_at' => now(),
            ]);
        }
        
        DB::commit();
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        // Log error
        $this->logger->logError('process_order_failed', $e);
        
        // Retry job
        $this->release(60); // Retry after 60 seconds
    }
}
```

---

## 📊 Database State Changes

### **Initial State (Step 1-2)**
```
transactions: 0 records
payments: 0 records
transaction_logs: 0 records
activity_logs: 0 records
```

### **After Create Transaction (Step 3)**
```sql
-- transactions table
INSERT INTO transactions (
    transaction_code, user_id, product_id, quantity, 
    price, total_price, customer_data, status
) VALUES (
    'TRX-20260201-001', NULL, 123, 1,
    25000, 25000, '{"user_id":"123456789","zone_id":"1234"}', 'pending'
);

-- payments table
INSERT INTO payments (
    payment_code, transaction_id, payment_method, amount,
    tripay_reference, status, expired_at
) VALUES (
    'PAY-20260201-001', 1, 'QRIS', 25000,
    'T123456789', 'pending', '2026-02-01 18:35:00'
);

-- transaction_logs table
INSERT INTO transaction_logs (
    transaction_id, status, description
) VALUES (
    1, 'pending', 'Transaction created'
);

-- activity_logs table
INSERT INTO activity_logs (
    action, description, model_type, model_id, meta_data
) VALUES (
    'Create Transaction Request', 'External API Tripay Create Transaction Request',
    NULL, NULL, '{"log_type":"external_api","provider":"Tripay",...}'
);
```

### **After Payment (Step 5)**
```sql
-- UPDATE payments
UPDATE payments 
SET status = 'paid', paid_at = '2026-02-01 17:40:00'
WHERE id = 1;

-- UPDATE transactions
UPDATE transactions
SET status = 'processing'
WHERE id = 1;

-- INSERT transaction_logs
INSERT INTO transaction_logs (transaction_id, status, description)
VALUES (1, 'processing', 'Payment received');
```

### **After Digiflazz Success (Step 6)**
```sql
-- UPDATE transactions
UPDATE transactions
SET 
    status = 'completed',
    digiflazz_trx_id = 'DGF-123456',
    serial_number = '100 Diamond telah dikirim ke 123456789',
    completed_at = '2026-02-01 17:41:00'
WHERE id = 1;

-- UPDATE products
UPDATE products
SET total_sold = total_sold + 1
WHERE id = 123;

-- INSERT transaction_logs
INSERT INTO transaction_logs (transaction_id, status, description)
VALUES (1, 'completed', 'Order completed successfully');
```

---

## ⏱️ Timeline

| Time | Event | Status |
|------|-------|--------|
| 17:30:00 | Customer browses products | - |
| 17:32:00 | Customer creates transaction | pending |
| 17:33:00 | Customer scans QR and pays | pending |
| 17:40:00 | Tripay callback received | processing |
| 17:40:05 | Job dispatched to queue | processing |
| 17:40:10 | Digiflazz order sent | processing |
| 17:41:00 | Digiflazz success response | completed |
| 17:41:05 | Email sent to customer | completed |
| 17:42:00 | Customer checks in-game | ✅ Done |

**Total Time:** ~12 minutes (from browse to completion)

---

## 🔐 Security & Validation

### **1. Signature Validation (Tripay)**
```php
$signature = hash_hmac('sha256', $callbackData, $privateKey);
if ($signature !== $request->header('X-Callback-Signature')) {
    abort(403, 'Invalid signature');
}
```

### **2. Signature Generation (Digiflazz)**
```php
$sign = md5($username . $apiKey . $refId);
```

### **3. Transaction Validation**
- Product availability check
- Stock validation
- Price validation
- Duplicate transaction check

---

## 📝 Logging & Monitoring

### **Activity Logs Created:**
1. External API - Tripay Create Transaction
2. External API - Tripay Callback
3. External API - Digiflazz Create Transaction
4. Transaction Created
5. Payment Received
6. Order Completed

### **Transaction Logs Created:**
1. Transaction created (pending)
2. Payment received (processing)
3. Order sent to Digiflazz (processing)
4. Order completed (completed)

---

## 🔄 Refund Flow (Transaksi Gagal)

### Scenario A: Auto-Refund (Digiflazz Order Gagal)

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6-ALT: Digiflazz Order FAILED                                  │
│ ------------------------------------------------------------------- │
│ Digiflazz Response:                                                 │
│ {                                                                   │
│   "data": {                                                         │
│     "ref_id": "TRX-20260201-001",                                   │
│     "status": "Gagal",                                              │
│     "message": "Nomor tujuan tidak valid"                           │
│   }                                                                 │
│ }                                                                   │
│                                                                     │
│ Backend Process:                                                    │
│ 1. handleFailed() dipanggil                                          │
│ 2. Cek: user_id ada?                                                 │
│    → Ya: TransactionService->refundTransaction()                     │
│      a. BalanceService->addBalance() — dana masuk saldo             │
│      b. Transaction status → 'refunded', set refunded_at            │
│      c. TransactionLog dicatat                                       │
│      d. Notification: "Refund Berhasil, Rp 25.000"                   │
│    → Tidak (guest): Skip auto-refund, perlu manual admin            │
│                                                                     │
│ Database Changes:                                                   │
│ - UPDATE transactions SET status='refunded', refunded_at=now()      │
│ - UPDATE balances SET balance=balance+25000                          │
│ - INSERT into balance_mutations (type='credit', amount=25000)       │
│ - INSERT into transaction_logs (status='refunded')                  │
│ - INSERT into notifications (type='success', title='Refund')        │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Customer menerima notifikasi:                                        │
│ "Dana sebesar Rp 25.000 telah dikembalikan ke saldo Anda"           │
│                                                                     │
│ Saldo user otomatis bertambah Rp 25.000                              │
│ ✅ Refund Complete!                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Scenario B: Admin Manual Refund

```
┌─────────────────────────────────────────────────────────────────────┐
│ Admin membuka dashboard → Detail Transaksi                           │
│ ------------------------------------------------------------------- │
│ Admin: POST /api/admin/transactions/{id}/refund                      │
│ Body: { "reason": "Customer complaint - product not received" }      │
│                                                                     │
│ Backend Process:                                                    │
│ 1. Validasi: status in [failed, processing, success]                │
│ 2. Validasi: belum pernah refund (refunded_at == null)              │
│ 3. Validasi: user_id ada                                             │
│ 4. TransactionService->refundTransaction()                           │
│    → Sama seperti auto-refund di atas                               │
│                                                                     │
│ Response: 200 OK                                                    │
│ {                                                                   │
│   "success": true,                                                  │
│   "message": "Transaction refunded successfully"                    │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Refund Database State

```sql
-- UPDATE transactions (status refunded)
UPDATE transactions
SET 
    status = 'refunded',
    refunded_at = '2026-02-01 17:42:00'
WHERE id = 1;

-- UPDATE balances (dana dikembalikan)
UPDATE balances
SET balance = balance + 25000
WHERE user_id = 1;

-- INSERT balance_mutations (record credit)
INSERT INTO balance_mutations (
    balance_id, transaction_id, type, amount,
    balance_before, balance_after, description
) VALUES (
    1, 1, 'credit', 25000,
    0, 25000, 'Refund: TRX-20260201-001 - Digiflazz order failed'
);

-- INSERT transaction_logs
INSERT INTO transaction_logs (
    transaction_id, from_status, to_status, description, meta_data
) VALUES (
    1, 'failed', 'refunded', 'Transaction refunded: order failed',
    '{"refund_amount":25000,"refund_method":"balance","original_payment_method":"tripay"}'
);

-- INSERT notifications
INSERT INTO notifications (
    user_id, title, message, type
) VALUES (
    1, 'Refund Berhasil',
    'Dana sebesar Rp 25.000 telah dikembalikan ke saldo Anda untuk transaksi TRX-20260201-001.',
    'success'
);
```

### Refund Timeline (tambahan)

| Time | Event | Status |
|------|-------|--------|
| 17:41:00 | Digiflazz gagal memproses | failed |
| 17:41:01 | Auto-refund ke saldo | refunded |
| 17:41:02 | Notifikasi refund dikirim | refunded |
| 17:42:00 | Customer cek saldo — sudah bertambah | ✅ Done |

> 📖 **Dokumentasi lengkap fitur refund:** Lihat [REFUND_FEATURE.md](./REFUND_FEATURE.md)

---

## 🎯 Success Criteria

✅ Transaction created successfully  
✅ Payment received and validated  
✅ Order sent to Digiflazz  
✅ Serial number received  
✅ Customer notified  
✅ Diamond credited to game account  
✅ **Refund otomatis jika transaksi gagal**  
✅ **Admin bisa refund manual**  

---

**Apakah ada bagian tertentu yang ingin saya jelaskan lebih detail?** 🤔
