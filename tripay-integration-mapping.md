# 🔌 TRIPAY API INTEGRATION - Parameter Mapping

## 📸 Screenshot Analysis

Dari screenshot yang Anda berikan, ini adalah parameter untuk **Create Transaction** di Tripay.

---

## 📋 TRIPAY REQUEST PARAMETERS

### Parameter yang Dikirim ke Tripay:

| Parameter Tripay | Required | Deskripsi | Dari Database Kita |
|------------------|----------|-----------|-------------------|
| `method` | ✅ | Kode channel pembayaran | User pilih di frontend |
| `merchant_ref` | ✅ | No referensi merchant | `transactions.transaction_code` |
| `amount` | ✅ | Nominal transaksi | `transactions.total_price` |
| `customer_name` | ✅ | Nama pelanggan | `users.name` |
| `customer_email` | ✅ | Email pelanggan | `users.email` |
| `customer_phone` | ✅ | Nomor HP pelanggan | `users.phone` |
| `order_items` | ✅ | Array item pesanan | Dari `products` + `transactions` |
| `order_items[].sku` | ✅ | SKU produk | `products.digiflazz_code` |
| `order_items[].name` | ✅ | Nama produk | `products.name` |
| `order_items[].price` | ✅ | Harga satuan | `products.retail_price` atau `reseller_price` |
| `order_items[].quantity` | ✅ | Jumlah | Selalu `1` untuk top-up game |
| `callback_url` | ❌ | URL callback | Config di dashboard Tripay |
| `return_url` | ❌ | URL redirect setelah bayar | `https://yoursite.com/transaction/{transaction_code}` |
| `expired_time` | ❌ | Batas waktu pembayaran | `now() + 2 hours` (Unix timestamp) |
| `signature` | ✅ | Signature transaksi | Generate dari merchant code + merchant_ref + amount |

---

## 💻 CODE IMPLEMENTATION

### 1. Tripay Service Class

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TripayService
{
    private $apiKey;
    private $privateKey;
    private $merchantCode;
    private $baseUrl;
    
    public function __construct()
    {
        $this->apiKey = config('services.tripay.api_key');
        $this->privateKey = config('services.tripay.private_key');
        $this->merchantCode = config('services.tripay.merchant_code');
        $this->baseUrl = config('services.tripay.base_url'); // https://tripay.co.id/api-sandbox (sandbox) atau https://tripay.co.id/api (production)
    }
    
    /**
     * Get available payment channels
     */
    public function getPaymentChannels()
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get($this->baseUrl . '/merchant/payment-channel');
            
            if ($response->successful()) {
                return $response->json()['data'];
            }
            
            throw new \Exception('Failed to get payment channels: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Tripay Get Payment Channels Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Create payment transaction
     * 
     * @param array $data
     * @return array
     */
    public function createPayment(array $data)
    {
        try {
            // Generate signature
            $signature = $this->generateSignature(
                $data['merchant_ref'],
                $data['amount']
            );
            
            // Prepare payload
            $payload = [
                'method' => $data['method'], // QRIS, BRIVA, BCAVA, dll
                'merchant_ref' => $data['merchant_ref'], // TRX-20260131-ABC123
                'amount' => $data['amount'], // 25500
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'order_items' => $data['order_items'], // Array of items
                'return_url' => $data['return_url'] ?? config('app.url') . '/transaction/result',
                'expired_time' => $data['expired_time'] ?? (time() + (2 * 3600)), // 2 hours
                'signature' => $signature,
            ];
            
            // Log request
            Log::info('Tripay Create Payment Request', $payload);
            
            // Send request to Tripay
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->post($this->baseUrl . '/transaction/create', $payload);
            
            // Log response
            Log::info('Tripay Create Payment Response', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    return $result['data'];
                }
                
                throw new \Exception($result['message'] ?? 'Unknown error from Tripay');
            }
            
            throw new \Exception('Failed to create payment: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Tripay Create Payment Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Generate signature for transaction
     * 
     * @param string $merchantRef
     * @param int $amount
     * @return string
     */
    private function generateSignature($merchantRef, $amount)
    {
        $signature = hash_hmac(
            'sha256',
            $this->merchantCode . $merchantRef . $amount,
            $this->privateKey
        );
        
        return $signature;
    }
    
    /**
     * Validate callback signature
     * 
     * @param array $callbackData
     * @return bool
     */
    public function validateCallbackSignature(array $callbackData)
    {
        $callbackSignature = $callbackData['signature'] ?? '';
        
        $generatedSignature = hash_hmac(
            'sha256',
            $this->merchantCode . $callbackData['merchant_ref'] . $callbackData['amount'],
            $this->privateKey
        );
        
        return $callbackSignature === $generatedSignature;
    }
    
    /**
     * Check transaction status
     * 
     * @param string $reference
     * @return array
     */
    public function checkTransactionStatus($reference)
    {
        try {
            $signature = hash_hmac('sha256', $this->merchantCode . $reference, $this->privateKey);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get($this->baseUrl . '/transaction/detail', [
                'reference' => $reference,
                'signature' => $signature,
            ]);
            
            if ($response->successful()) {
                return $response->json()['data'];
            }
            
            throw new \Exception('Failed to check transaction status');
            
        } catch (\Exception $e) {
            Log::error('Tripay Check Status Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
```

---

## 📝 CONFIG FILE

### config/services.php

```php
<?php

return [
    // ... other services
    
    'tripay' => [
        'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
        'base_url' => env('TRIPAY_BASE_URL', 'https://tripay.co.id/api-sandbox'),
    ],
];
```

### .env

```env
TRIPAY_API_KEY=your_api_key_here
TRIPAY_PRIVATE_KEY=your_private_key_here
TRIPAY_MERCHANT_CODE=T1234
TRIPAY_BASE_URL=https://tripay.co.id/api-sandbox
```

---

## 🔄 INTEGRATION FLOW

### Step-by-Step dengan Database

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TripayService;
use App\Services\GuestUserService;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
            'name' => 'nullable|string',
            'product_id' => 'required|exists:products,id',
            'customer_data' => 'required|array',
            'payment_method' => 'required|string', // QRIS, BRIVA, BCAVA, dll
        ]);
        
        DB::beginTransaction();
        try {
            // 1. Get or create guest user
            $guestService = new GuestUserService();
            $user = $guestService->getOrCreateGuestUser([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'name' => $validated['name'] ?? null,
            ]);
            
            // 2. Get product
            $product = Product::findOrFail($validated['product_id']);
            $price = $product->retail_price;
            $adminFee = 1500; // Atau ambil dari settings
            $totalPrice = $price + $adminFee;
            
            // 3. Generate transaction code
            $transactionCode = 'TRX-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
            
            // 4. Create transaction in database
            $transaction = Transaction::create([
                'transaction_code' => $transactionCode,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'customer_type' => 'retail',
                'payment_type' => 'gateway',
                'transaction_type' => 'purchase',
                'product_name' => $product->name,
                'product_code' => $product->digiflazz_code,
                'product_price' => $price,
                'admin_fee' => $adminFee,
                'total_price' => $totalPrice,
                'customer_data' => $validated['customer_data'],
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'payment_status' => 'pending',
                'expired_at' => now()->addHours(2),
            ]);
            
            // 5. Prepare data for Tripay
            $tripayData = [
                'method' => $validated['payment_method'], // ← Dari parameter Tripay
                'merchant_ref' => $transactionCode, // ← Dari parameter Tripay
                'amount' => $totalPrice, // ← Dari parameter Tripay
                'customer_name' => $user->name, // ← Dari parameter Tripay
                'customer_email' => $user->email, // ← Dari parameter Tripay
                'customer_phone' => $user->phone, // ← Dari parameter Tripay
                'order_items' => [ // ← Dari parameter Tripay
                    [
                        'sku' => $product->digiflazz_code, // ← order_items[].sku
                        'name' => $product->name, // ← order_items[].name
                        'price' => $price, // ← order_items[].price
                        'quantity' => 1, // ← order_items[].quantity
                    ],
                ],
                'return_url' => route('transaction.result', $transactionCode), // ← Dari parameter Tripay
                'expired_time' => now()->addHours(2)->timestamp, // ← Dari parameter Tripay (Unix timestamp)
            ];
            
            // 6. Create payment via Tripay
            $tripayService = new TripayService();
            $tripayResponse = $tripayService->createPayment($tripayData);
            
            // 7. Save payment to database
            $payment = Payment::create([
                'transaction_id' => $transaction->id,
                'payment_reference' => $tripayResponse['reference'], // Dari response Tripay
                'payment_method' => $tripayResponse['payment_method'], // Dari response Tripay
                'payment_channel' => $tripayResponse['payment_name'], // Dari response Tripay
                'payment_code' => $tripayResponse['pay_code'] ?? null, // VA number (jika ada)
                'amount' => $tripayResponse['amount'], // Dari response Tripay
                'fee' => $tripayResponse['total_fee']['customer'] ?? 0, // Fee customer
                'total_amount' => $tripayResponse['amount_received'], // Total yang harus dibayar
                'qr_url' => $tripayResponse['qr_url'] ?? null, // QR code URL (untuk QRIS)
                'checkout_url' => $tripayResponse['checkout_url'] ?? null, // Checkout page URL
                'payment_instructions' => $tripayResponse['instructions'] ?? null, // Instruksi pembayaran
                'status' => 'pending',
                'expired_at' => date('Y-m-d H:i:s', $tripayResponse['expired_time']),
            ]);
            
            DB::commit();
            
            // 8. Return response
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => [
                    'transaction_code' => $transactionCode,
                    'payment' => [
                        'reference' => $payment->payment_reference,
                        'method' => $payment->payment_channel,
                        'code' => $payment->payment_code, // VA number
                        'amount' => $payment->total_amount,
                        'qr_url' => $payment->qr_url, // Untuk QRIS
                        'checkout_url' => $payment->checkout_url, // Redirect ke sini
                        'instructions' => $payment->payment_instructions,
                        'expired_at' => $payment->expired_at,
                    ],
                ],
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
```

---

## 📥 TRIPAY RESPONSE FORMAT

### Response dari `createPayment()`:

```json
{
  "success": true,
  "message": "Transaction created",
  "data": {
    "reference": "T1234567890ABCDE",
    "merchant_ref": "TRX-20260131-ABC123",
    "payment_selection_type": "static",
    "payment_method": "QRIS",
    "payment_name": "QRIS (All Payment)",
    "customer_name": "John Doe",
    "customer_email": "john@email.com",
    "customer_phone": "081234567890",
    "callback_url": "https://yoursite.com/api/payment/callback",
    "return_url": "https://yoursite.com/transaction/result/TRX-20260131-ABC123",
    "amount": 25500,
    "fee_merchant": 0,
    "fee_customer": 0,
    "total_fee": {
      "merchant": 0,
      "customer": 0
    },
    "amount_received": 25500,
    "pay_code": null,
    "pay_url": null,
    "checkout_url": "https://tripay.co.id/checkout/T1234567890ABCDE",
    "order_items": [
      {
        "sku": "ML86",
        "name": "Mobile Legends 86 Diamonds",
        "price": 24000,
        "quantity": 1
      }
    ],
    "status": "UNPAID",
    "expired_time": 1738329600,
    "qr_url": "https://tripay.co.id/qr/T1234567890ABCDE",
    "qr_string": "00020101021226670016COM.NOBUBANK.WWW01189360050300000870214T1234567890ABCDE0303UMI51440014ID.CO.QRIS.WWW0215ID12345678901230303UMI5204839953033605802ID5913MERCHANT NAME6015JAKARTA SELATAN61051234062070703A0163041C3F",
    "instructions": [
      {
        "title": "Pembayaran via QRIS",
        "steps": [
          "Buka aplikasi dompet digital (GoPay, OVO, DANA, ShopeePay, dll)",
          "Pilih menu Scan QR",
          "Scan QR Code yang tersedia",
          "Konfirmasi pembayaran"
        ]
      }
    ]
  }
}
```

---

## 🔔 CALLBACK HANDLING

### Tripay Callback Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TripayService;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\PaymentCallback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TripayCallbackController extends Controller
{
    /**
     * Handle callback from Tripay
     * URL: POST /api/payment/callback
     */
    public function handle(Request $request)
    {
        // Log incoming callback
        Log::info('Tripay Callback Received', [
            'ip' => $request->ip(),
            'data' => $request->all(),
        ]);
        
        try {
            // Get callback data
            $callbackData = $request->all();
            
            // Validate signature
            $tripayService = new TripayService();
            $isValid = $tripayService->validateCallbackSignature($callbackData);
            
            if (!$isValid) {
                Log::warning('Invalid Tripay Callback Signature', $callbackData);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature',
                ], 400);
            }
            
            // Find payment
            $payment = Payment::where('payment_reference', $callbackData['reference'])->first();
            
            if (!$payment) {
                Log::warning('Payment not found for reference: ' . $callbackData['reference']);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found',
                ], 404);
            }
            
            // Log callback to database
            PaymentCallback::create([
                'payment_id' => $payment->id,
                'callback_data' => $callbackData,
                'signature' => $callbackData['signature'],
                'ip_address' => $request->ip(),
                'is_valid' => true,
                'processed' => false,
            ]);
            
            DB::beginTransaction();
            
            try {
                // Update payment status
                $payment->update([
                    'status' => strtolower($callbackData['status']), // PAID → paid
                    'paid_at' => $callbackData['status'] === 'PAID' ? now() : null,
                ]);
                
                // Update transaction
                $transaction = $payment->transaction;
                
                if ($callbackData['status'] === 'PAID') {
                    $transaction->update([
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);
                    
                    // Dispatch job to process to Digiflazz
                    \App\Jobs\ProcessDigiflazzOrder::dispatch($transaction);
                    
                } elseif ($callbackData['status'] === 'EXPIRED') {
                    $transaction->update([
                        'payment_status' => 'expired',
                        'expired_at' => now(),
                    ]);
                    
                } elseif ($callbackData['status'] === 'FAILED') {
                    $transaction->update([
                        'payment_status' => 'failed',
                        'failed_at' => now(),
                    ]);
                }
                
                // Mark callback as processed
                PaymentCallback::where('payment_id', $payment->id)
                    ->latest()
                    ->first()
                    ->update(['processed' => true]);
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed',
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error processing callback: ' . $e->getMessage());
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Tripay Callback Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }
}
```

---

## 🛣️ ROUTES

### routes/api.php

```php
<?php

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TripayCallbackController;

// Guest checkout
Route::post('/checkout', [CheckoutController::class, 'checkout']);

// Tripay callback (no auth needed)
Route::post('/payment/callback', [TripayCallbackController::class, 'handle']);
```

---

## 📊 MAPPING TABLE SUMMARY

### Request ke Tripay → Database Kita

| Tripay Parameter | Dari Database/Data |
|------------------|-------------------|
| `method` | User input (pilihan di frontend) |
| `merchant_ref` | `transactions.transaction_code` |
| `amount` | `transactions.total_price` |
| `customer_name` | `users.name` |
| `customer_email` | `users.email` |
| `customer_phone` | `users.phone` |
| `order_items[].sku` | `products.digiflazz_code` |
| `order_items[].name` | `products.name` |
| `order_items[].price` | `products.retail_price` |
| `order_items[].quantity` | `1` (hardcoded) |
| `return_url` | Config/generate |
| `expired_time` | `now() + 2 hours` |
| `signature` | Generate dari merchant_code + merchant_ref + amount |

### Response dari Tripay → Database Kita

| Tripay Response | Simpan ke Database |
|-----------------|-------------------|
| `reference` | `payments.payment_reference` |
| `payment_method` | `payments.payment_method` |
| `payment_name` | `payments.payment_channel` |
| `pay_code` | `payments.payment_code` (VA number) |
| `amount` | `payments.amount` |
| `fee_customer` | `payments.fee` |
| `amount_received` | `payments.total_amount` |
| `qr_url` | `payments.qr_url` |
| `checkout_url` | `payments.checkout_url` |
| `instructions` | `payments.payment_instructions` (JSON) |
| `expired_time` | `payments.expired_at` |
| `status` | `payments.status` |

---

## ✅ CHECKLIST INTEGRATION

- [ ] Install Guzzle/HTTP Client: `composer require guzzlehttp/guzzle`
- [ ] Buat TripayService class
- [ ] Setup config di `config/services.php`
- [ ] Setup `.env` dengan credentials Tripay
- [ ] Buat CheckoutController
- [ ] Buat TripayCallbackController
- [ ] Setup routes untuk checkout & callback
- [ ] Test di sandbox environment dulu
- [ ] Setup webhook URL di dashboard Tripay
- [ ] Whitelist IP Tripay untuk callback
- [ ] Test semua payment methods (QRIS, VA, dll)
- [ ] Monitor logs untuk debugging

---

**Semua parameter dari screenshot Tripay sudah ter-map dengan database kita! 🚀**
