# 🔗 CALLBACK_URL vs RETURN_URL - Penjelasan Lengkap

## 🤔 Apa Bedanya?

### **callback_url** (Server-to-Server)
- Diakses oleh **SERVER TRIPAY** → **SERVER KITA**
- Otomatis dipanggil saat ada perubahan status pembayaran
- User **TIDAK TAHU** URL ini dipanggil
- Digunakan untuk **UPDATE DATABASE**
- Format: API endpoint (backend)

### **return_url** (User Redirect)
- Diakses oleh **USER/BROWSER** setelah bayar
- User **dikembalikan** ke halaman ini setelah checkout
- User **BISA LIHAT** halaman ini
- Digunakan untuk **TAMPILAN HASIL** ke user
- Format: Web page URL (frontend)

---

## 📊 VISUALISASI FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Checkout                                            │
└─────────────────────────────────────────────────────────────┘
User klik "Bayar" → Request ke Backend Kita

Backend Kita → Tripay API:
{
  "merchant_ref": "TRX-20260131-ABC123",
  "amount": 25500,
  "callback_url": "https://api.topupstore.com/api/payment/callback",
  "return_url": "https://topupstore.com/transaction/result/TRX-20260131-ABC123"
}

Tripay Response:
{
  "checkout_url": "https://tripay.co.id/checkout/T12345ABCDE"
}


┌─────────────────────────────────────────────────────────────┐
│ 2. User Redirect ke Tripay                                  │
└─────────────────────────────────────────────────────────────┘
Backend Kita → User: Redirect ke checkout_url
User Browser → https://tripay.co.id/checkout/T12345ABCDE

User lihat:
├─ QR Code QRIS
├─ Virtual Account Number
├─ Instruksi pembayaran
└─ Tombol "Kembali ke Merchant"


┌─────────────────────────────────────────────────────────────┐
│ 3. User Bayar                                               │
└─────────────────────────────────────────────────────────────┘
User scan QR / transfer ke VA → Pembayaran SUCCESS


┌─────────────────────────────────────────────────────────────┐
│ 4. CALLBACK_URL dipanggil (Server-to-Server)               │
└─────────────────────────────────────────────────────────────┘
Tripay Server → Backend Kita (callback_url):

POST https://api.topupstore.com/api/payment/callback
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "reference": "T12345ABCDE",
  "merchant_ref": "TRX-20260131-ABC123",
  "status": "PAID",
  "amount": 25500,
  "paid_at": 1738326000,
  "signature": "abc123def456..."
}

Backend Kita:
├─ Validate signature
├─ Update payments table: status = 'paid'
├─ Update transactions table: payment_status = 'paid'
├─ Process ke Digiflazz (background job)
└─ Return response ke Tripay: {"success": true}

⚠️ USER TIDAK TAHU INI TERJADI!


┌─────────────────────────────────────────────────────────────┐
│ 5. RETURN_URL dikunjungi (User Redirect)                   │
└─────────────────────────────────────────────────────────────┘
User klik "Kembali ke Merchant" di halaman Tripay

Tripay → User Browser: Redirect ke return_url

User Browser → https://topupstore.com/transaction/result/TRX-20260131-ABC123

User lihat:
├─ "Pembayaran Berhasil! ✅"
├─ "Pesanan sedang diproses..."
├─ Transaction details
└─ Status: Paid

Frontend kita fetch data dari backend:
GET /api/transaction/status/TRX-20260131-ABC123
Response: {
  "status": "processing",
  "payment_status": "paid",
  "serial_number": null  ← Belum selesai
}

Frontend polling setiap 5 detik sampai dapat serial_number


┌─────────────────────────────────────────────────────────────┐
│ 6. Order Selesai                                            │
└─────────────────────────────────────────────────────────────┘
Backend selesai process ke Digiflazz

User lihat update di halaman:
├─ "Transaksi Berhasil! ✅"
├─ "Kode Voucher: 1234-5678-9012-3456"
└─ Status: Success
```

---

## 🌐 CONTOH URL KONKRET

### Development (Local)

```bash
# Backend API
callback_url: "http://localhost:8000/api/payment/callback"

# Frontend
return_url: "http://localhost:3000/transaction/result/TRX-20260131-ABC123"
```

**⚠️ MASALAH:** Tripay tidak bisa akses `localhost`!

**✅ SOLUSI:** Pakai ngrok atau expose.dev

```bash
# Install ngrok
# https://ngrok.com

# Expose local server
ngrok http 8000

# Dapat URL:
# https://abc123def.ngrok.io

# Pakai untuk callback_url:
callback_url: "https://abc123def.ngrok.io/api/payment/callback"
```

---

### Production (Live Server)

```bash
# Backend API (callback_url)
https://api.topupstore.com/api/payment/callback

# Frontend (return_url)
https://topupstore.com/transaction/result/{transaction_code}
```

**Atau jika pakai 1 domain:**

```bash
# Backend API (callback_url)
https://topupstore.com/api/payment/callback

# Frontend (return_url)
https://topupstore.com/transaction/result/{transaction_code}
```

---

## 💻 IMPLEMENTATION CODE

### 1. Setup callback_url di Tripay Dashboard

**PENTING:** callback_url biasanya di-setup **1 kali** di dashboard Tripay, bukan dikirim per transaksi.

**Cara Setup:**
1. Login ke dashboard Tripay
2. Masuk menu Settings → Webhook
3. Set callback URL: `https://api.topupstore.com/api/payment/callback`
4. Whitelist IP server kita (jika perlu)

**Jadi di code, kita TIDAK PERLU kirim `callback_url` parameter!**

---

### 2. Backend: Tripay Service (Updated)

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
        $this->baseUrl = config('services.tripay.base_url');
    }
    
    /**
     * Create payment transaction
     */
    public function createPayment(array $data)
    {
        try {
            $signature = $this->generateSignature(
                $data['merchant_ref'],
                $data['amount']
            );
            
            $payload = [
                'method' => $data['method'],
                'merchant_ref' => $data['merchant_ref'],
                'amount' => $data['amount'],
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'order_items' => $data['order_items'],
                
                // ✅ return_url: Untuk redirect user setelah bayar
                'return_url' => $data['return_url'] ?? $this->getReturnUrl($data['merchant_ref']),
                
                // ❌ callback_url: TIDAK PERLU (sudah di dashboard)
                // Tapi jika Tripay allow per-transaction callback, bisa tambahkan:
                // 'callback_url' => config('app.url') . '/api/payment/callback',
                
                'expired_time' => $data['expired_time'] ?? (time() + (2 * 3600)),
                'signature' => $signature,
            ];
            
            Log::info('Tripay Create Payment Request', $payload);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->post($this->baseUrl . '/transaction/create', $payload);
            
            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    return $result['data'];
                }
                
                throw new \Exception($result['message'] ?? 'Unknown error');
            }
            
            throw new \Exception('Failed to create payment: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Tripay Create Payment Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Generate return URL
     */
    private function getReturnUrl($transactionCode)
    {
        // Untuk SPA (Next.js, React, Vue)
        return config('app.frontend_url') . '/transaction/result/' . $transactionCode;
        
        // Atau jika pakai Blade (Laravel Monolith)
        // return route('transaction.result', $transactionCode);
    }
    
    /**
     * Generate signature
     */
    private function generateSignature($merchantRef, $amount)
    {
        return hash_hmac(
            'sha256',
            $this->merchantCode . $merchantRef . $amount,
            $this->privateKey
        );
    }
}
```

---

### 3. Backend: Callback Handler (Server-to-Server)

**Route:** `POST /api/payment/callback`

**File:** `app/Http/Controllers/Api/TripayCallbackController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TripayService;
use App\Models\Payment;
use App\Models\PaymentCallback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TripayCallbackController extends Controller
{
    /**
     * Handle Tripay callback
     * 
     * URL: POST https://api.topupstore.com/api/payment/callback
     * Called by: Tripay Server
     */
    public function handle(Request $request)
    {
        // Log semua request dari Tripay
        Log::info('Tripay Callback Received', [
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
            'body' => $request->all(),
        ]);
        
        try {
            $callbackData = $request->all();
            
            // ✅ Validate signature
            $tripayService = new TripayService();
            $isValid = $tripayService->validateCallbackSignature($callbackData);
            
            if (!$isValid) {
                Log::warning('Invalid Tripay Callback Signature', [
                    'data' => $callbackData,
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature',
                ], 400);
            }
            
            // ✅ Validate IP (optional, untuk security)
            $allowedIps = [
                '103.127.96.0/22', // Tripay IP range
                '103.127.96.10',
            ];
            
            if (!$this->isIpAllowed($request->ip(), $allowedIps)) {
                Log::warning('Unauthorized IP trying to access callback', [
                    'ip' => $request->ip(),
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
            
            // Find payment
            $payment = Payment::where('payment_reference', $callbackData['reference'])->first();
            
            if (!$payment) {
                Log::warning('Payment not found', [
                    'reference' => $callbackData['reference'],
                ]);
                
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
                    'status' => strtolower($callbackData['status']),
                    'paid_at' => $callbackData['status'] === 'PAID' ? now() : null,
                ]);
                
                // Update transaction
                $transaction = $payment->transaction;
                
                if ($callbackData['status'] === 'PAID') {
                    $transaction->update([
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);
                    
                    // ✅ Process order (dispatch job ke Digiflazz)
                    \App\Jobs\ProcessDigiflazzOrder::dispatch($transaction);
                    
                    Log::info('Payment success, order dispatched', [
                        'transaction_code' => $transaction->transaction_code,
                    ]);
                    
                } elseif ($callbackData['status'] === 'EXPIRED') {
                    $transaction->update([
                        'payment_status' => 'expired',
                        'status' => 'failed',
                        'expired_at' => now(),
                    ]);
                    
                } elseif ($callbackData['status'] === 'FAILED') {
                    $transaction->update([
                        'payment_status' => 'failed',
                        'status' => 'failed',
                        'failed_at' => now(),
                    ]);
                }
                
                // Mark callback as processed
                PaymentCallback::where('payment_id', $payment->id)
                    ->latest()
                    ->first()
                    ->update(['processed' => true]);
                
                DB::commit();
                
                // ✅ Response ke Tripay (PENTING!)
                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed successfully',
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error processing callback', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Tripay Callback Handler Error', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }
    
    /**
     * Check if IP is allowed
     */
    private function isIpAllowed($ip, $allowedRanges)
    {
        // Simple check for development
        if (app()->environment('local')) {
            return true;
        }
        
        foreach ($allowedRanges as $range) {
            if ($this->ipInRange($ip, $range)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if IP in CIDR range
     */
    private function ipInRange($ip, $range)
    {
        if (strpos($range, '/') === false) {
            return $ip === $range;
        }
        
        list($subnet, $bits) = explode('/', $range);
        $ip = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        $subnet &= $mask;
        
        return ($ip & $mask) == $subnet;
    }
}
```

---

### 4. Frontend: Result Page (User Page)

**Route:** `/transaction/result/{transaction_code}`

**File (Next.js):** `pages/transaction/result/[code].jsx`

```jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function TransactionResultPage() {
  const router = useRouter();
  const { code } = router.query; // transaction_code dari URL
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  
  // Fetch transaction status
  const fetchTransaction = async () => {
    try {
      const response = await axios.get(`/api/transaction/status/${code}`);
      setTransaction(response.data.data);
      
      // ✅ Stop polling jika sudah success atau failed
      if (['success', 'failed', 'refunded'].includes(response.data.data.status)) {
        setPolling(false);
      }
      
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (code) {
      fetchTransaction();
    }
  }, [code]);
  
  // Polling every 5 seconds
  useEffect(() => {
    if (!polling) return;
    
    const interval = setInterval(() => {
      fetchTransaction();
    }, 5000); // Poll setiap 5 detik
    
    return () => clearInterval(interval);
  }, [polling]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border" />
          <p className="mt-4">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Transaksi Tidak Ditemukan</h1>
          <button onClick={() => router.push('/')} className="mt-4 btn btn-primary">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {transaction.payment_status === 'pending' && (
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold mb-2">Menunggu Pembayaran</h1>
            <p className="text-gray-600">
              Silakan selesaikan pembayaran Anda
            </p>
          </div>
        )}
        
        {transaction.payment_status === 'paid' && transaction.status === 'processing' && (
          <div className="text-center">
            <div className="text-blue-500 text-6xl mb-4">
              <div className="animate-spin">⚙️</div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Pesanan Sedang Diproses</h1>
            <p className="text-gray-600">
              Pembayaran berhasil! Mohon tunggu sebentar...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Halaman ini akan otomatis update
            </p>
          </div>
        )}
        
        {transaction.status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Transaksi Berhasil!</h1>
            <p className="text-gray-600">
              Pesanan Anda telah selesai diproses
            </p>
          </div>
        )}
        
        {transaction.status === 'failed' && (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Transaksi Gagal</h1>
            <p className="text-gray-600">
              {transaction.payment_status === 'expired' 
                ? 'Pembayaran telah kadaluarsa' 
                : 'Terjadi kesalahan dalam pemrosesan'}
            </p>
          </div>
        )}
      </div>
      
      {/* Transaction Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Detail Transaksi</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Kode Transaksi:</span>
            <span className="font-mono font-bold">{transaction.transaction_code}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Produk:</span>
            <span className="font-medium">{transaction.product_name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Pembayaran:</span>
            <span className="font-bold text-lg">
              Rp {transaction.total_price.toLocaleString('id-ID')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status Pembayaran:</span>
            <span className={`font-medium ${
              transaction.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {transaction.payment_status === 'paid' ? 'Lunas' : 'Pending'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status Pesanan:</span>
            <span className={`font-medium ${
              transaction.status === 'success' ? 'text-green-600' :
              transaction.status === 'processing' ? 'text-blue-600' :
              transaction.status === 'failed' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {transaction.status === 'success' ? 'Berhasil' :
               transaction.status === 'processing' ? 'Diproses' :
               transaction.status === 'failed' ? 'Gagal' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Serial Number / Voucher Code */}
      {transaction.status === 'success' && transaction.digiflazz_serial_number && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-green-800">
            🎉 Kode Voucher
          </h2>
          
          <div className="bg-white rounded p-4 text-center">
            <p className="text-3xl font-mono font-bold text-green-600 select-all">
              {transaction.digiflazz_serial_number}
            </p>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(transaction.digiflazz_serial_number);
              alert('Kode voucher berhasil disalin!');
            }}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            📋 Salin Kode
          </button>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-bold mb-2">Cara Penggunaan:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Buka game {transaction.product_name}</li>
              <li>Masuk ke menu Top Up / Recharge</li>
              <li>Masukkan kode voucher di atas</li>
              <li>Diamond/UC akan masuk otomatis</li>
            </ol>
          </div>
        </div>
      )}
      
      {/* Payment Instructions (if pending) */}
      {transaction.payment_status === 'pending' && transaction.payment && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">
            Cara Pembayaran
          </h2>
          
          {/* QR Code untuk QRIS */}
          {transaction.payment.qr_url && (
            <div className="text-center mb-4">
              <img 
                src={transaction.payment.qr_url} 
                alt="QR Code" 
                className="mx-auto w-64 h-64"
              />
              <p className="mt-2 text-sm text-gray-600">
                Scan QR Code dengan aplikasi pembayaran Anda
              </p>
            </div>
          )}
          
          {/* Virtual Account Number */}
          {transaction.payment.payment_code && (
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {transaction.payment.payment_channel}
              </p>
              <p className="text-2xl font-mono font-bold select-all">
                {transaction.payment.payment_code}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transaction.payment.payment_code);
                  alert('Nomor VA berhasil disalin!');
                }}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                📋 Salin Nomor
              </button>
            </div>
          )}
          
          {/* Expired Time */}
          <div className="text-center text-sm text-red-600">
            ⏰ Bayar sebelum: {new Date(transaction.payment.expired_at).toLocaleString('id-ID')}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/')}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
        >
          Kembali ke Beranda
        </button>
        
        {transaction.status === 'success' && (
          <button
            onClick={() => router.push('/transactions')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Lihat Riwayat
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 5. Backend: Get Transaction Status API

**Route:** `GET /api/transaction/status/{code}`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Get transaction status
     * 
     * URL: GET /api/transaction/status/{transaction_code}
     * Called by: Frontend (user's browser)
     */
    public function getStatus($transactionCode)
    {
        $transaction = Transaction::with(['payment', 'product'])
            ->where('transaction_code', $transactionCode)
            ->first();
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'transaction_code' => $transaction->transaction_code,
                'product_name' => $transaction->product_name,
                'total_price' => $transaction->total_price,
                'status' => $transaction->status,
                'payment_status' => $transaction->payment_status,
                'digiflazz_serial_number' => $transaction->digiflazz_serial_number,
                'customer_data' => $transaction->customer_data,
                'created_at' => $transaction->created_at,
                'payment' => $transaction->payment ? [
                    'method' => $transaction->payment->payment_channel,
                    'code' => $transaction->payment->payment_code,
                    'qr_url' => $transaction->payment->qr_url,
                    'checkout_url' => $transaction->payment->checkout_url,
                    'expired_at' => $transaction->payment->expired_at,
                ] : null,
            ],
        ]);
    }
}
```

---

## 📋 ROUTES SUMMARY

### routes/api.php

```php
<?php

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\TripayCallbackController;
use App\Http\Controllers\Api\TransactionController;

// Checkout
Route::post('/checkout', [CheckoutController::class, 'checkout']);

// ✅ Callback URL (dipanggil oleh Tripay Server)
Route::post('/payment/callback', [TripayCallbackController::class, 'handle']);

// Transaction status (dipanggil oleh Frontend)
Route::get('/transaction/status/{code}', [TransactionController::class, 'getStatus']);
```

---

## 🔒 SECURITY CHECKLIST

### Untuk callback_url:

- [ ] ✅ Validate signature dari Tripay
- [ ] ✅ Whitelist IP Tripay (103.127.96.0/22)
- [ ] ✅ Log semua request untuk audit
- [ ] ✅ Prevent duplicate processing
- [ ] ✅ Return proper HTTP status (200 OK jika success)
- [ ] ✅ Gunakan HTTPS (bukan HTTP)
- [ ] ✅ Disable CSRF protection untuk route callback

### Untuk return_url:

- [ ] ✅ Jangan expose sensitive data di URL
- [ ] ✅ Validate transaction ownership (jika perlu auth)
- [ ] ✅ Implement rate limiting untuk prevent spam
- [ ] ✅ Handle expired/invalid transaction code

---

## 📊 COMPARISON TABLE

| Aspek | callback_url | return_url |
|-------|--------------|------------|
| **Dipanggil oleh** | Tripay Server | User Browser |
| **Tujuan** | Update database | Show hasil ke user |
| **Timing** | Saat status berubah | Saat user klik "Kembali" |
| **Format** | API endpoint (JSON) | Web page (HTML) |
| **Security** | Signature + IP whitelist | Public (siapa aja bisa akses) |
| **Response** | JSON: {success: true} | HTML Page |
| **Example** | `/api/payment/callback` | `/transaction/result/TRX-xxx` |
| **User aware?** | ❌ Tidak | ✅ Ya |
| **Required?** | ✅ Ya (wajib) | ❌ Optional |

---

## ✅ COMPLETE URL EXAMPLES

### Scenario: Production Server

```bash
# 1. Tripay Dashboard Setup
Callback URL: https://api.topupstore.com/api/payment/callback

# 2. Saat Create Payment
Request ke Tripay:
{
  "merchant_ref": "TRX-20260131-ABC123",
  "return_url": "https://topupstore.com/transaction/result/TRX-20260131-ABC123"
}

# 3. User Flow:
User bayar → Tripay redirect ke:
https://topupstore.com/transaction/result/TRX-20260131-ABC123

# 4. Callback Flow (background):
Tripay → POST https://api.topupstore.com/api/payment/callback
```

---

**Jelas sekarang perbedaan callback_url dan return_url? 🚀**

Intinya:
- **callback_url** = Server-to-server (untuk update DB)
- **return_url** = User redirect (untuk tampilan)
