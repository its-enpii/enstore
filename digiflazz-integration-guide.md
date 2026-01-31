# 🎮 DIGIFLAZZ API INTEGRATION - Complete Guide

## 📖 Pengenalan Digiflazz

Digiflazz adalah H2H (Host to Host) provider untuk pembelian produk digital:
- Voucher Game (Mobile Legends, Free Fire, PUBG, dll)
- Pulsa & Paket Data
- Token PLN
- E-money (GoPay, OVO, DANA, dll)
- Voucher Digital

**Base URL:**
- Production: `https://api.digiflazz.com/v1`

**Authentication:** Username + API Key (dikirim di setiap request)

---

## 🔑 DIGIFLAZZ API CREDENTIALS

### Yang Diperlukan:

1. **Username** - Username akun Digiflazz kamu
2. **API Key** - Development / Production API Key
3. **Saldo** - Deposit di Digiflazz (untuk beli produk)

### Cara Daftar:

1. Daftar di https://member.digiflazz.com/buyer-area
2. Login → Menu API → Salin API Key
3. Deposit saldo (min. Rp 10.000)
4. Cek price list untuk lihat SKU produk

---

## 📋 DIGIFLAZZ API ENDPOINTS

### 1. Cek Saldo

```
POST https://api.digiflazz.com/v1/cek-saldo
```

**Request:**
```json
{
  "cmd": "deposit",
  "username": "your_username",
  "sign": "md5(username + api_key + depo)"
}
```

**Response:**
```json
{
  "data": {
    "username": "your_username",
    "deposit": 500000,
    "status": "sukses"
  }
}
```

---

### 2. Get Price List (Daftar Produk)

```
POST https://api.digiflazz.com/v1/price-list
```

**Request:**
```json
{
  "cmd": "prepaid",
  "username": "your_username",
  "sign": "md5(username + api_key + pricelist)"
}
```

**Response:**
```json
{
  "data": [
    {
      "product_name": "Mobile Legends 86 Diamond",
      "category": "Games",
      "brand": "MOBILE LEGENDS",
      "type": "Umum",
      "seller_name": "DIGIFLAZZ",
      "price": 20000,
      "buyer_sku_code": "ML86",
      "buyer_product_status": true,
      "seller_product_status": true,
      "unlimited_stock": false,
      "stock": 9999999,
      "multi": false,
      "start_cut_off": "00:00",
      "end_cut_off": "23:59",
      "desc": "Mobile Legends 86 Diamond\nMasukkan User ID & Zone ID\nProses 1-3 menit"
    },
    // ... more products
  ]
}
```

---

### 3. Create Transaction (Beli Produk)

```
POST https://api.digiflazz.com/v1/transaction
```

**Request:**
```json
{
  "username": "your_username",
  "buyer_sku_code": "ML86",
  "customer_no": "12345678",
  "ref_id": "TRX-20260131-ABC123",
  "sign": "md5(username + api_key + ref_id)"
}
```

**Field Explanation:**
- `buyer_sku_code`: SKU produk dari price list (contoh: ML86)
- `customer_no`: 
  - Untuk game: User ID + Zone ID (format: `12345678` atau `12345678-1234`)
  - Untuk pulsa: Nomor HP (contoh: `081234567890`)
  - Untuk PLN: Nomor meter (contoh: `12345678901`)
- `ref_id`: Unique reference dari kita (transaction_code)
- `sign`: Signature untuk security

**Response (Success):**
```json
{
  "data": {
    "ref_id": "TRX-20260131-ABC123",
    "customer_no": "12345678",
    "buyer_sku_code": "ML86",
    "message": "SUKSES",
    "status": "Sukses",
    "rc": "00",
    "sn": "1234567890123456",
    "buyer_last_saldo": 480000,
    "price": 20000
  }
}
```

**Response (Pending):**
```json
{
  "data": {
    "ref_id": "TRX-20260131-ABC123",
    "status": "Pending",
    "rc": "01",
    "message": "PENDING"
  }
}
```

**Response (Failed):**
```json
{
  "data": {
    "ref_id": "TRX-20260131-ABC123",
    "status": "Gagal",
    "rc": "201",
    "message": "INVALID USER ID"
  }
}
```

**Response Codes:**
- `00` = Success
- `01` = Pending
- `02` = Invalid
- `03` = Insufficient balance
- `201` = Invalid customer number
- `202` = Product unavailable

---

### 4. Check Transaction Status

```
POST https://api.digiflazz.com/v1/transaction
```

**Request (sama seperti create, tapi pakai ref_id yang sama):**
```json
{
  "username": "your_username",
  "buyer_sku_code": "ML86",
  "customer_no": "12345678",
  "ref_id": "TRX-20260131-ABC123",
  "sign": "md5(username + api_key + ref_id)"
}
```

**Note:** Jika ref_id sudah pernah digunakan, Digiflazz return status transaksi (tidak create baru).

---

## 💻 CODE IMPLEMENTATION

### 1. Digiflazz Service Class

**File:** `app/Services/DigiflazzService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DigiflazzService
{
    private $username;
    private $apiKey;
    private $baseUrl;
    
    public function __construct()
    {
        $this->username = config('services.digiflazz.username');
        $this->apiKey = config('services.digiflazz.api_key');
        $this->baseUrl = config('services.digiflazz.base_url', 'https://api.digiflazz.com/v1');
    }
    
    /**
     * Generate signature
     */
    private function generateSign($command)
    {
        $string = $this->username . $this->apiKey . $command;
        return md5($string);
    }
    
    /**
     * Check balance (Cek Saldo)
     */
    public function checkBalance()
    {
        try {
            $payload = [
                'cmd' => 'deposit',
                'username' => $this->username,
                'sign' => $this->generateSign('depo'),
            ];
            
            Log::info('Digiflazz Check Balance Request', $payload);
            
            $response = Http::timeout(30)
                ->post($this->baseUrl . '/cek-saldo', $payload);
            
            $result = $response->json();
            
            Log::info('Digiflazz Check Balance Response', $result);
            
            if (isset($result['data']['status']) && $result['data']['status'] === 'sukses') {
                return [
                    'success' => true,
                    'balance' => $result['data']['deposit'],
                    'username' => $result['data']['username'],
                ];
            }
            
            throw new \Exception('Failed to check balance: ' . json_encode($result));
            
        } catch (\Exception $e) {
            Log::error('Digiflazz Check Balance Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get price list (all products)
     */
    public function getPriceList($useCache = true)
    {
        try {
            // Cache for 1 hour
            if ($useCache) {
                return Cache::remember('digiflazz_price_list', 3600, function () {
                    return $this->fetchPriceList();
                });
            }
            
            return $this->fetchPriceList();
            
        } catch (\Exception $e) {
            Log::error('Digiflazz Get Price List Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Fetch price list from API
     */
    private function fetchPriceList()
    {
        $payload = [
            'cmd' => 'prepaid',
            'username' => $this->username,
            'sign' => $this->generateSign('pricelist'),
        ];
        
        Log::info('Digiflazz Get Price List Request');
        
        $response = Http::timeout(60)
            ->post($this->baseUrl . '/price-list', $payload);
        
        $result = $response->json();
        
        if (isset($result['data']) && is_array($result['data'])) {
            Log::info('Digiflazz Price List Retrieved', [
                'total_products' => count($result['data']),
            ]);
            
            return $result['data'];
        }
        
        throw new \Exception('Failed to get price list: ' . json_encode($result));
    }
    
    /**
     * Create transaction (buy product)
     * 
     * @param string $buyerSkuCode - Product SKU (ML86, FF100, dll)
     * @param string $customerNo - User ID / Phone number
     * @param string $refId - Unique reference ID (transaction_code)
     * @return array
     */
    public function createTransaction($buyerSkuCode, $customerNo, $refId)
    {
        try {
            $payload = [
                'username' => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no' => $customerNo,
                'ref_id' => $refId,
                'sign' => $this->generateSign($refId),
            ];
            
            Log::info('Digiflazz Create Transaction Request', $payload);
            
            $response = Http::timeout(60)
                ->post($this->baseUrl . '/transaction', $payload);
            
            $result = $response->json();
            
            Log::info('Digiflazz Create Transaction Response', $result);
            
            if (isset($result['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data'],
                ];
            }
            
            throw new \Exception('Failed to create transaction: ' . json_encode($result));
            
        } catch (\Exception $e) {
            Log::error('Digiflazz Create Transaction Error', [
                'error' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            throw $e;
        }
    }
    
    /**
     * Check transaction status
     * (Sama seperti create transaction, tapi dengan ref_id yang sudah ada)
     */
    public function checkTransactionStatus($buyerSkuCode, $customerNo, $refId)
    {
        try {
            // Same as create transaction
            return $this->createTransaction($buyerSkuCode, $customerNo, $refId);
            
        } catch (\Exception $e) {
            Log::error('Digiflazz Check Transaction Status Error', [
                'error' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            throw $e;
        }
    }
    
    /**
     * Format customer number based on product type
     */
    public function formatCustomerNumber($customerData, $productType)
    {
        // For games (Mobile Legends, Free Fire, dll)
        if (in_array($productType, ['game', 'games'])) {
            // Format: user_id atau user_id-zone_id
            if (isset($customerData['zone_id']) && !empty($customerData['zone_id'])) {
                return $customerData['user_id'] . '-' . $customerData['zone_id'];
            }
            return $customerData['user_id'];
        }
        
        // For pulsa/data
        if (in_array($productType, ['pulsa', 'data'])) {
            // Format: 081234567890
            return $customerData['phone'] ?? $customerData['customer_no'];
        }
        
        // For PLN
        if ($productType === 'pln') {
            // Format: meter number
            return $customerData['meter_no'] ?? $customerData['customer_no'];
        }
        
        // Default
        return $customerData['customer_no'] ?? '';
    }
}
```

---

### 2. Config File

**File:** `config/services.php`

```php
<?php

return [
    // ... other services
    
    'digiflazz' => [
        'username' => env('DIGIFLAZZ_USERNAME'),
        'api_key' => env('DIGIFLAZZ_API_KEY'),
        'base_url' => env('DIGIFLAZZ_BASE_URL', 'https://api.digiflazz.com/v1'),
    ],
];
```

**File:** `.env`

```env
DIGIFLAZZ_USERNAME=your_username
DIGIFLAZZ_API_KEY=your_api_key_here
DIGIFLAZZ_BASE_URL=https://api.digiflazz.com/v1
```

---

### 3. Sync Products Command (Artisan)

**File:** `app/Console/Commands/SyncDigiflazzProducts.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DigiflazzService;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class SyncDigiflazzProducts extends Command
{
    protected $signature = 'digiflazz:sync-products';
    protected $description = 'Sync products from Digiflazz API';
    
    public function handle()
    {
        $this->info('Starting product sync from Digiflazz...');
        
        try {
            $digiflazzService = new DigiflazzService();
            
            // Get price list from Digiflazz
            $this->info('Fetching price list...');
            $products = $digiflazzService->getPriceList(false); // Don't use cache
            
            $this->info('Total products: ' . count($products));
            
            $progressBar = $this->output->createProgressBar(count($products));
            $progressBar->start();
            
            $synced = 0;
            $skipped = 0;
            
            foreach ($products as $product) {
                // Skip if product inactive
                if (!$product['buyer_product_status'] || !$product['seller_product_status']) {
                    $skipped++;
                    $progressBar->advance();
                    continue;
                }
                
                // Determine category
                $categoryName = $product['category'];
                $category = ProductCategory::firstOrCreate(
                    ['slug' => Str::slug($categoryName)],
                    [
                        'name' => $categoryName,
                        'type' => $this->mapCategoryType($categoryName),
                        'is_active' => true,
                    ]
                );
                
                // Calculate prices
                $basePrice = $product['price'];
                $retailPrice = $basePrice + 3000; // Markup Rp 3.000 untuk retail
                $resellerPrice = $basePrice + 1500; // Markup Rp 1.500 untuk reseller
                
                // Update or create product
                Product::updateOrCreate(
                    ['digiflazz_code' => $product['buyer_sku_code']],
                    [
                        'category_id' => $category->id,
                        'name' => $product['product_name'],
                        'brand' => $product['brand'],
                        'type' => $this->mapProductType($product['category']),
                        'base_price' => $basePrice,
                        'retail_price' => $retailPrice,
                        'reseller_price' => $resellerPrice,
                        'retail_profit' => $retailPrice - $basePrice,
                        'reseller_profit' => $resellerPrice - $basePrice,
                        'stock_status' => $product['seller_product_status'] ? 'available' : 'empty',
                        'is_active' => true,
                        'description' => $product['desc'] ?? null,
                        'last_synced_at' => now(),
                    ]
                );
                
                $synced++;
                $progressBar->advance();
            }
            
            $progressBar->finish();
            $this->newLine(2);
            
            $this->info("✅ Sync completed!");
            $this->info("Synced: {$synced} products");
            $this->info("Skipped: {$skipped} products");
            
        } catch (\Exception $e) {
            $this->error('❌ Sync failed: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
    
    private function mapCategoryType($category)
    {
        $mapping = [
            'Games' => 'game',
            'Pulsa' => 'pulsa',
            'Paket Data' => 'data',
            'PLN' => 'pln',
            'E-Money' => 'emoney',
            'Voucher' => 'voucher',
        ];
        
        return $mapping[$category] ?? 'other';
    }
    
    private function mapProductType($category)
    {
        return $this->mapCategoryType($category);
    }
}
```

**Register command di:** `app/Console/Kernel.php`

```php
protected $commands = [
    \App\Console\Commands\SyncDigiflazzProducts::class,
];

protected function schedule(Schedule $schedule)
{
    // Sync products every day at 2 AM
    $schedule->command('digiflazz:sync-products')->dailyAt('02:00');
}
```

**Run manual:**
```bash
php artisan digiflazz:sync-products
```

---

### 4. Process Order Job (Background Job)

**File:** `app/Jobs/ProcessDigiflazzOrder.php`

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\Notification;
use App\Services\DigiflazzService;
use Illuminate\Support\Facades\Log;

class ProcessDigiflazzOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $transaction;
    public $tries = 3; // Retry 3x jika gagal
    public $timeout = 120; // Timeout 2 menit
    
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }
    
    public function handle()
    {
        Log::info('Processing Digiflazz Order', [
            'transaction_code' => $this->transaction->transaction_code,
        ]);
        
        try {
            // Update status to processing
            $this->transaction->update(['status' => 'processing']);
            
            TransactionLog::create([
                'transaction_id' => $this->transaction->id,
                'status_from' => 'pending',
                'status_to' => 'processing',
                'message' => 'Order is being processed to Digiflazz',
            ]);
            
            // Get Digiflazz service
            $digiflazzService = new DigiflazzService();
            
            // Format customer number
            $customerNo = $digiflazzService->formatCustomerNumber(
                $this->transaction->customer_data,
                $this->transaction->product->type
            );
            
            // Create transaction to Digiflazz
            $result = $digiflazzService->createTransaction(
                $this->transaction->product_code, // buyer_sku_code
                $customerNo,
                $this->transaction->transaction_code // ref_id
            );
            
            $data = $result['data'];
            
            // Check response code
            if ($data['rc'] === '00') {
                // ✅ SUCCESS
                $this->handleSuccess($data);
                
            } elseif ($data['rc'] === '01') {
                // ⏳ PENDING - Akan dicek lagi nanti
                $this->handlePending($data);
                
            } else {
                // ❌ FAILED
                $this->handleFailed($data);
            }
            
        } catch (\Exception $e) {
            Log::error('Process Digiflazz Order Error', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Jika retry habis, mark as failed
            if ($this->attempts() >= $this->tries) {
                $this->handleFailed([
                    'message' => 'Maximum retry exceeded: ' . $e->getMessage(),
                    'rc' => '999',
                ]);
            } else {
                // Retry in 2 minutes
                $this->release(120);
            }
        }
    }
    
    /**
     * Handle success response
     */
    private function handleSuccess($data)
    {
        $this->transaction->update([
            'status' => 'success',
            'digiflazz_trx_id' => $data['trx_id'] ?? null,
            'digiflazz_serial_number' => $data['sn'] ?? null,
            'digiflazz_message' => $data['message'] ?? 'Success',
            'digiflazz_status' => $data['status'] ?? 'Sukses',
            'completed_at' => now(),
        ]);
        
        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'success',
            'message' => 'Order completed successfully',
            'meta_data' => $data,
        ]);
        
        // Create notification for user
        Notification::create([
            'user_id' => $this->transaction->user_id,
            'title' => 'Transaksi Berhasil!',
            'message' => "Pesanan {$this->transaction->product_name} berhasil diproses. Kode voucher: {$data['sn']}",
            'type' => 'success',
            'data' => [
                'transaction_code' => $this->transaction->transaction_code,
                'serial_number' => $data['sn'],
            ],
        ]);
        
        // TODO: Send email/WhatsApp notification
        
        Log::info('Digiflazz Order Success', [
            'transaction_code' => $this->transaction->transaction_code,
            'serial_number' => $data['sn'],
        ]);
    }
    
    /**
     * Handle pending response
     */
    private function handlePending($data)
    {
        $this->transaction->update([
            'status' => 'processing',
            'digiflazz_message' => $data['message'] ?? 'Pending',
            'digiflazz_status' => $data['status'] ?? 'Pending',
        ]);
        
        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'processing',
            'message' => 'Order is pending at Digiflazz',
            'meta_data' => $data,
        ]);
        
        // Dispatch job to check status in 2 minutes
        CheckDigiflazzOrderStatus::dispatch($this->transaction)
            ->delay(now()->addMinutes(2));
        
        Log::info('Digiflazz Order Pending', [
            'transaction_code' => $this->transaction->transaction_code,
        ]);
    }
    
    /**
     * Handle failed response
     */
    private function handleFailed($data)
    {
        $this->transaction->update([
            'status' => 'failed',
            'digiflazz_message' => $data['message'] ?? 'Failed',
            'digiflazz_status' => $data['status'] ?? 'Gagal',
            'failed_at' => now(),
        ]);
        
        TransactionLog::create([
            'transaction_id' => $this->transaction->id,
            'status_from' => 'processing',
            'status_to' => 'failed',
            'message' => 'Order failed: ' . ($data['message'] ?? 'Unknown error'),
            'meta_data' => $data,
        ]);
        
        // Refund if payment via balance (reseller)
        if ($this->transaction->payment_type === 'balance') {
            $this->refundBalance();
        }
        
        // Create notification
        Notification::create([
            'user_id' => $this->transaction->user_id,
            'title' => 'Transaksi Gagal',
            'message' => "Pesanan {$this->transaction->product_name} gagal diproses. " . ($data['message'] ?? ''),
            'type' => 'error',
            'data' => [
                'transaction_code' => $this->transaction->transaction_code,
                'reason' => $data['message'] ?? 'Unknown error',
            ],
        ]);
        
        // TODO: Send email/WhatsApp notification
        
        Log::error('Digiflazz Order Failed', [
            'transaction_code' => $this->transaction->transaction_code,
            'message' => $data['message'] ?? 'Unknown',
        ]);
    }
    
    /**
     * Refund balance for reseller
     */
    private function refundBalance()
    {
        if ($this->transaction->payment_type !== 'balance') {
            return;
        }
        
        $balance = $this->transaction->user->balance;
        $oldBalance = $balance->balance;
        
        $balance->increment('balance', $this->transaction->total_price);
        
        \App\Models\BalanceMutation::create([
            'user_id' => $this->transaction->user_id,
            'transaction_id' => $this->transaction->id,
            'type' => 'credit',
            'amount' => $this->transaction->total_price,
            'balance_before' => $oldBalance,
            'balance_after' => $oldBalance + $this->transaction->total_price,
            'description' => 'Refund untuk transaksi gagal: ' . $this->transaction->transaction_code,
            'reference_type' => 'refund',
            'reference_id' => $this->transaction->id,
        ]);
        
        $this->transaction->update(['refunded_at' => now()]);
        
        Log::info('Balance refunded', [
            'transaction_code' => $this->transaction->transaction_code,
            'amount' => $this->transaction->total_price,
        ]);
    }
}
```

---

### 5. Check Order Status Job (For Pending Orders)

**File:** `app/Jobs/CheckDigiflazzOrderStatus.php`

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Transaction;
use App\Services\DigiflazzService;
use Illuminate\Support\Facades\Log;

class CheckDigiflazzOrderStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $transaction;
    public $tries = 5;
    
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }
    
    public function handle()
    {
        Log::info('Checking Digiflazz Order Status', [
            'transaction_code' => $this->transaction->transaction_code,
        ]);
        
        try {
            $digiflazzService = new DigiflazzService();
            
            $customerNo = $digiflazzService->formatCustomerNumber(
                $this->transaction->customer_data,
                $this->transaction->product->type
            );
            
            // Check status (same request as create transaction)
            $result = $digiflazzService->checkTransactionStatus(
                $this->transaction->product_code,
                $customerNo,
                $this->transaction->transaction_code
            );
            
            $data = $result['data'];
            
            if ($data['rc'] === '00') {
                // SUCCESS - Process same as ProcessDigiflazzOrder
                $processJob = new ProcessDigiflazzOrder($this->transaction);
                $processJob->handleSuccess($data);
                
            } elseif ($data['rc'] === '01') {
                // Still PENDING - Check again in 2 minutes
                if ($this->attempts() < $this->tries) {
                    $this->release(120);
                } else {
                    // Max retries reached - mark as failed
                    $processJob = new ProcessDigiflazzOrder($this->transaction);
                    $processJob->handleFailed([
                        'message' => 'Order timeout - still pending after multiple checks',
                        'rc' => '999',
                    ]);
                }
                
            } else {
                // FAILED
                $processJob = new ProcessDigiflazzOrder($this->transaction);
                $processJob->handleFailed($data);
            }
            
        } catch (\Exception $e) {
            Log::error('Check Digiflazz Order Status Error', [
                'transaction_code' => $this->transaction->transaction_code,
                'error' => $e->getMessage(),
            ]);
            
            if ($this->attempts() < $this->tries) {
                $this->release(120);
            }
        }
    }
}
```

---

## 🔄 COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Bayar via Tripay                                │
└─────────────────────────────────────────────────────────────┘
Customer scan QRIS / transfer ke VA
Tripay callback → transactions.payment_status = 'paid'


┌─────────────────────────────────────────────────────────────┐
│ 2. Dispatch Job ke Queue                                    │
└─────────────────────────────────────────────────────────────┘
ProcessDigiflazzOrder::dispatch($transaction)


┌─────────────────────────────────────────────────────────────┐
│ 3. Job Executed (Background)                                │
└─────────────────────────────────────────────────────────────┘
Update: transactions.status = 'processing'

POST https://api.digiflazz.com/v1/transaction
{
  "username": "your_username",
  "buyer_sku_code": "ML86",
  "customer_no": "12345678-1234",
  "ref_id": "TRX-20260131-ABC123",
  "sign": "abc123def456..."
}


┌─────────────────────────────────────────────────────────────┐
│ 4A. Response: SUCCESS (rc = "00")                           │
└─────────────────────────────────────────────────────────────┘
Response: {
  "rc": "00",
  "status": "Sukses",
  "sn": "1234-5678-9012-3456",
  "message": "SUKSES"
}

Update Database:
├─ transactions.status = 'success'
├─ transactions.digiflazz_serial_number = '1234-5678-9012-3456'
├─ transactions.completed_at = NOW()
└─ Create notification for user

User lihat kode voucher di halaman result ✅


┌─────────────────────────────────────────────────────────────┐
│ 4B. Response: PENDING (rc = "01")                           │
└─────────────────────────────────────────────────────────────┘
Response: {
  "rc": "01",
  "status": "Pending",
  "message": "PENDING"
}

Update Database:
└─ transactions.status = 'processing' (tetap)

Dispatch CheckDigiflazzOrderStatus (delay 2 menit)
└─ Job akan cek ulang status setiap 2 menit (max 5x)


┌─────────────────────────────────────────────────────────────┐
│ 4C. Response: FAILED (rc = "201", "202", dll)              │
└─────────────────────────────────────────────────────────────┘
Response: {
  "rc": "201",
  "status": "Gagal",
  "message": "INVALID USER ID"
}

Update Database:
├─ transactions.status = 'failed'
├─ transactions.failed_at = NOW()
└─ Refund balance (jika payment_type = 'balance')

Create notification: "Transaksi gagal" ❌
```

---

## 📊 RESPONSE CODE MAPPING

| RC | Status | Arti | Action |
|----|--------|------|--------|
| `00` | Sukses | Transaksi berhasil | Mark as success ✅ |
| `01` | Pending | Sedang diproses | Check status lagi ⏳ |
| `02` | Invalid | Request invalid | Mark as failed ❌ |
| `03` | Insufficient | Saldo tidak cukup | Mark as failed, notify admin 💰 |
| `201` | Gagal | Customer number invalid | Mark as failed ❌ |
| `202` | Gagal | Produk tidak tersedia | Mark as failed ❌ |
| `999` | Error | System error / timeout | Mark as failed ❌ |

---

## 🎯 CUSTOMER NUMBER FORMAT

### Berdasarkan Jenis Produk:

**1. Game (Mobile Legends, Free Fire, PUBG)**
```
Format: user_id atau user_id-zone_id

Contoh:
- Mobile Legends: "12345678-1234" (User ID - Zone ID)
- Free Fire: "123456789" (User ID saja)
- PUBG Mobile: "5123456789" (User ID saja)
```

**2. Pulsa & Paket Data**
```
Format: phone_number

Contoh:
- "081234567890"
- "08123456789"
```

**3. PLN Token**
```
Format: meter_number

Contoh:
- "12345678901" (11 digit)
```

**4. E-Money (GoPay, OVO, DANA)**
```
Format: phone_number

Contoh:
- "081234567890"
```

---

## 🔐 SECURITY BEST PRACTICES

### 1. Signature Validation

```php
// Always validate signature
$sign = md5($username . $apiKey . $refId);
```

### 2. Unique ref_id

```php
// PENTING: ref_id harus UNIQUE per transaksi
// Gunakan transaction_code dari database kita
$refId = $transaction->transaction_code; // TRX-20260131-ABC123
```

### 3. Error Handling

```php
try {
    $result = $digiflazzService->createTransaction(...);
} catch (\Exception $e) {
    // Log error
    Log::error('Digiflazz Error: ' . $e->getMessage());
    
    // Retry or mark as failed
    if ($retryCount < 3) {
        // Retry
    } else {
        // Mark as failed + refund
    }
}
```

---

## ✅ TESTING CHECKLIST

### Development:
- [ ] Test cek saldo
- [ ] Test get price list
- [ ] Test create transaction (success)
- [ ] Test create transaction (failed - invalid user)
- [ ] Test create transaction (pending)
- [ ] Test check status
- [ ] Test refund mechanism
- [ ] Test job queue processing
- [ ] Test notification creation

### Production:
- [ ] Monitor saldo Digiflazz
- [ ] Setup alert untuk low balance
- [ ] Monitor failed transactions
- [ ] Check logs regularly
- [ ] Setup scheduler untuk sync products

---

## 📝 ARTISAN COMMANDS SUMMARY

```bash
# Sync products from Digiflazz
php artisan digiflazz:sync-products

# Check Digiflazz balance
php artisan digiflazz:check-balance

# Process queue (run workers)
php artisan queue:work --tries=3

# Monitor queue
php artisan queue:listen

# Retry failed jobs
php artisan queue:retry all
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "Insufficient Balance"
```
Solution: Top up saldo di dashboard Digiflazz
Alert: Setup monitoring untuk saldo < Rp 100.000
```

### Issue 2: "Invalid Customer Number"
```
Solution: Validate format sebelum kirim ke Digiflazz
- ML: harus format user_id-zone_id
- FF: harus user_id saja
- Pulsa: harus 08xxxxxxxxxx
```

### Issue 3: "Product Not Available"
```
Solution: Sync products dari Digiflazz
Command: php artisan digiflazz:sync-products
```

### Issue 4: "Pending Too Long"
```
Solution: Check status manual via API
Jika stuck > 30 menit: contact Digiflazz support
```

---

**Digiflazz Integration Complete! 🚀**

Sekarang backend kita bisa:
- ✅ Sync products dari Digiflazz
- ✅ Process orders otomatis
- ✅ Handle pending/success/failed
- ✅ Refund jika gagal
- ✅ Send notifications
