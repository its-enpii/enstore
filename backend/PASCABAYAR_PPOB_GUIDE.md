# Pascabayar (PPOB) Integration Guide

## 📋 Overview

Pascabayar adalah layanan pembayaran tagihan bulanan seperti PLN, PDAM, Telkom, TV Kabel, dll. Berbeda dengan prepaid yang langsung bayar, pascabayar memerlukan **2 langkah**: inquiry (cek tagihan) → payment (bayar tagihan).

---

## 🔄 Flow Pascabayar

```
Customer → Inquiry (Cek Tagihan) → Konfirmasi → Payment (Bayar) → Selesai
```

### **Step 1: Inquiry (Cek Tagihan)**
- Customer input ID Pelanggan
- System kirim inquiry ke Digiflazz
- Dapat info: Nama, Periode, Tagihan, Admin
- Tampilkan ke customer untuk konfirmasi

### **Step 2: Payment (Bayar Tagihan)**
- Customer konfirmasi bayar
- System kirim payment ke Digiflazz
- Dapat token/bukti bayar
- Tagihan lunas

---

## 🎯 Produk Pascabayar yang Tersedia

| Produk | buyer_sku_code | customer_no Format | Keterangan |
|--------|----------------|-------------------|------------|
| **PLN Pascabayar** | `pln` | ID Pelanggan (12 digit) | Tagihan listrik bulanan |
| **PDAM** | `pdam` | ID Pelanggan | Tagihan air bulanan |
| **Telkom/Indihome** | `telkom` | Nomor Telepon/ID | Tagihan internet/telepon |
| **Speedy** | `speedy` | ID Pelanggan | Tagihan internet |
| **TV Kabel** | `transvision`, `indovision` | ID Pelanggan | Tagihan TV berlangganan |

---

## 📡 API Endpoints

### **1. Inquiry Postpaid**

**Method:** `POST /api/customer/postpaid/inquiry`

**Request:**
```json
{
  "product_id": 123,  // ID produk pascabayar
  "customer_no": "530000000003"  // ID Pelanggan
}
```

**Backend Process:**
```php
$digiflazzService->inquiryPostpaid(
    'pln',  // buyer_sku_code
    '530000000003',  // customer_no
    'INQ-20260201-001'  // ref_id
);
```

**Digiflazz Request:**
```json
{
  "commands": "inq-pasca",
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "pln",
  "customer_no": "530000000003",
  "ref_id": "INQ-20260201-001",
  "sign": "..."
}
```

**Digiflazz Response:**
```json
{
  "data": {
    "ref_id": "INQ-20260201-001",
    "customer_no": "530000000003",
    "customer_name": "JOHN DOE",
    "period": "202601",
    "nominal": 150000,
    "admin": 2500,
    "total_bayar": 152500,
    "message": "INQUIRY SUCCESS",
    "rc": "00"
  }
}
```

**Frontend Response:**
```json
{
  "success": true,
  "data": {
    "customer_no": "530000000003",
    "customer_name": "JOHN DOE",
    "period": "Januari 2026",
    "tagihan": 150000,
    "admin": 2500,
    "total": 152500,
    "inquiry_ref": "INQ-20260201-001"
  }
}
```

---

### **2. Pay Postpaid**

**Method:** `POST /api/customer/postpaid/pay`

**Request:**
```json
{
  "inquiry_ref": "INQ-20260201-001",  // Ref dari inquiry
  "payment_method": "QRIS"  // Metode pembayaran
}
```

**Backend Process:**
```php
// 1. Create transaction & payment via Tripay
$transaction = TransactionService->createPostpaidTransaction(...);
$payment = TripayService->createTransaction(...);

// 2. Setelah payment success (via callback)
$digiflazzService->payPostpaid(
    'pln',  // buyer_sku_code
    '530000000003',  // customer_no
    'TRX-20260201-001'  // ref_id (transaction_code)
);
```

**Digiflazz Request:**
```json
{
  "commands": "pay-pasca",
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "pln",
  "customer_no": "530000000003",
  "ref_id": "TRX-20260201-001",
  "sign": "..."
}
```

**Digiflazz Response:**
```json
{
  "data": {
    "ref_id": "TRX-20260201-001",
    "customer_no": "530000000003",
    "customer_name": "JOHN DOE",
    "sn": "1234-5678-9012-3456-7890",  // Token PLN
    "nominal": 150000,
    "admin": 2500,
    "total_bayar": 152500,
    "message": "PAYMENT SUCCESS",
    "rc": "00"
  }
}
```

---

## 💻 Implementation

### **1. Controller: PostpaidController.php**

```php
<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\DigiflazzService;
use App\Services\TransactionService;
use App\Services\TripayService;
use Illuminate\Http\Request;

class PostpaidController extends Controller
{
    private $digiflazzService;
    private $transactionService;
    private $tripayService;

    public function __construct(
        DigiflazzService $digiflazzService,
        TransactionService $transactionService,
        TripayService $tripayService
    ) {
        $this->digiflazzService = $digiflazzService;
        $this->transactionService = $transactionService;
        $this->tripayService = $tripayService;
    }

    /**
     * Inquiry tagihan
     */
    public function inquiry(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'customer_no' => 'required|string',
        ]);

        $product = Product::findOrFail($request->product_id);
        $inquiryRef = 'INQ-' . time() . '-' . rand(1000, 9999);

        // Call Digiflazz inquiry
        $result = $this->digiflazzService->inquiryPostpaid(
            $product->digiflazz_code,
            $request->customer_no,
            $inquiryRef
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal cek tagihan',
            ], 400);
        }

        $data = $result['data'];

        // Save inquiry to session/cache for later payment
        cache()->put($inquiryRef, [
            'product_id' => $product->id,
            'customer_no' => $request->customer_no,
            'customer_name' => $data['customer_name'] ?? '',
            'period' => $data['period'] ?? '',
            'nominal' => $data['nominal'] ?? 0,
            'admin' => $data['admin'] ?? 0,
            'total' => $data['total_bayar'] ?? 0,
        ], now()->addMinutes(30));

        return response()->json([
            'success' => true,
            'data' => [
                'inquiry_ref' => $inquiryRef,
                'customer_no' => $request->customer_no,
                'customer_name' => $data['customer_name'] ?? '',
                'period' => $data['period'] ?? '',
                'tagihan' => $data['nominal'] ?? 0,
                'admin' => $data['admin'] ?? 0,
                'total' => $data['total_bayar'] ?? 0,
            ],
        ]);
    }

    /**
     * Pay tagihan
     */
    public function pay(Request $request)
    {
        $request->validate([
            'inquiry_ref' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        // Get inquiry data from cache
        $inquiryData = cache()->get($request->inquiry_ref);

        if (!$inquiryData) {
            return response()->json([
                'success' => false,
                'message' => 'Inquiry expired, silakan cek tagihan lagi',
            ], 400);
        }

        // Create transaction
        $transaction = $this->transactionService->createPostpaidTransaction([
            'user_id' => auth()->id(),
            'product_id' => $inquiryData['product_id'],
            'customer_data' => [
                'customer_no' => $inquiryData['customer_no'],
                'customer_name' => $inquiryData['customer_name'],
                'period' => $inquiryData['period'],
            ],
            'total_price' => $inquiryData['total'],
            'inquiry_ref' => $request->inquiry_ref,
        ]);

        // Create payment via Tripay
        $payment = $this->tripayService->createTransaction([
            'method' => $request->payment_method,
            'merchant_ref' => $transaction->transaction_code,
            'amount' => $transaction->total_price,
            'customer_name' => auth()->user()->name,
            'customer_email' => auth()->user()->email,
            'customer_phone' => auth()->user()->phone,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'transaction_code' => $transaction->transaction_code,
                'payment' => $payment,
            ],
        ]);
    }
}
```

---

### **2. Job: ProcessPostpaidPayment.php**

```php
<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Services\DigiflazzService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPostpaidPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function handle()
    {
        $digiflazzService = app(DigiflazzService::class);

        try {
            // Pay postpaid via Digiflazz
            $result = $digiflazzService->payPostpaid(
                $this->transaction->product->digiflazz_code,
                $this->transaction->customer_data['customer_no'],
                $this->transaction->transaction_code
            );

            if ($result['success'] && $result['data']['rc'] === '00') {
                // Success
                $this->transaction->update([
                    'status' => 'success',
                    'digiflazz_trx_id' => $result['data']['trx_id'] ?? null,
                    'digiflazz_serial_number' => $result['data']['sn'] ?? null,
                    'completed_at' => now(),
                ]);
            } else {
                // Failed
                $this->transaction->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            $this->transaction->update([
                'status' => 'failed',
                'failed_at' => now(),
            ]);
        }
    }
}
```

---

### **3. Routes**

```php
// routes/api.php

Route::middleware('auth:sanctum')->prefix('customer')->group(function () {
    // Postpaid (PPOB)
    Route::prefix('postpaid')->group(function () {
        Route::post('/inquiry', [PostpaidController::class, 'inquiry']);
        Route::post('/pay', [PostpaidController::class, 'pay']);
    });
});
```

---

## 🎨 Frontend Flow

### **1. Inquiry Page**

```html
<form @submit="checkBill">
  <select v-model="productId">
    <option value="1">PLN Pascabayar</option>
    <option value="2">PDAM</option>
    <option value="3">Telkom</option>
  </select>
  
  <input v-model="customerNo" placeholder="ID Pelanggan" />
  
  <button type="submit">Cek Tagihan</button>
</form>

<!-- Hasil Inquiry -->
<div v-if="billData">
  <h3>Detail Tagihan</h3>
  <p>ID Pelanggan: {{ billData.customer_no }}</p>
  <p>Nama: {{ billData.customer_name }}</p>
  <p>Periode: {{ billData.period }}</p>
  <p>Tagihan: Rp {{ billData.tagihan }}</p>
  <p>Admin: Rp {{ billData.admin }}</p>
  <hr>
  <p><strong>Total: Rp {{ billData.total }}</strong></p>
  
  <button @click="payBill">Bayar Sekarang</button>
</div>
```

### **2. Payment Page**

```html
<div v-if="payment">
  <h3>Pembayaran</h3>
  <p>Total: Rp {{ payment.amount }}</p>
  <img :src="payment.qr_url" alt="QR Code" />
  <p>Scan QR code untuk bayar</p>
</div>
```

---

## 📊 Database Schema

### **transactions table**

Tambahkan kolom untuk pascabayar:

```php
$table->string('transaction_type')->default('prepaid'); // prepaid, postpaid
$table->string('inquiry_ref')->nullable(); // Ref dari inquiry
$table->json('bill_data')->nullable(); // Data tagihan
```

---

## ✅ Summary

**Pascabayar Implementation:**
- ✅ `DigiflazzService::inquiryPostpaid()` - Cek tagihan
- ✅ `DigiflazzService::payPostpaid()` - Bayar tagihan
- ✅ 2-step flow: inquiry → payment
- ✅ Support PLN, PDAM, Telkom, TV Kabel
- ✅ Database logging via ActivityLog

**Produk PPOB:**
- ✅ PLN Pascabayar
- ✅ PDAM (Air)
- ✅ Telkom/Indihome
- ✅ TV Kabel (Transvision, Indovision)

Apakah perlu saya buatkan Controller dan Job untuk pascabayar? 🤔
