# 🔄 TRANSACTION FLOW - Retail vs Reseller Customer

## 📊 Customer Type Comparison

| Aspek | Retail Customer | Reseller Customer |
|-------|----------------|-------------------|
| **Saldo** | Tidak ada | Ada (deposit) |
| **Pembayaran** | Langsung per transaksi | Potong dari saldo |
| **Harga** | Harga normal | Harga reseller (lebih murah) |
| **Top Up** | Tidak bisa | Bisa top up saldo |
| **Min. Order** | Tidak ada | Bisa diatur |
| **Use Case** | Beli sekali-kali | Beli untuk dijual lagi |

---

## 🗄️ DATABASE ADJUSTMENT

### 1. Modifikasi Tabel `users`

```sql
ALTER TABLE users 
ADD COLUMN customer_type ENUM('retail', 'reseller') DEFAULT 'retail' AFTER role,
ADD COLUMN auto_approve BOOLEAN DEFAULT TRUE COMMENT 'Auto approve untuk retail, manual untuk reseller';

ALTER TABLE users ADD INDEX idx_customer_type (customer_type);
```

### 2. Modifikasi Tabel `products`

Tambahkan harga berbeda untuk retail dan reseller:

```sql
ALTER TABLE products 
ADD COLUMN retail_price DECIMAL(15, 2) NOT NULL AFTER selling_price,
ADD COLUMN reseller_price DECIMAL(15, 2) NOT NULL AFTER retail_price;

-- Update existing data
UPDATE products 
SET retail_price = selling_price,
    reseller_price = selling_price - 500; -- Contoh: reseller lebih murah 500
```

**Penjelasan:**
- `retail_price`: Harga untuk customer biasa
- `reseller_price`: Harga untuk reseller (lebih murah)
- `selling_price`: Bisa dijadikan reference atau dihapus

### 3. Modifikasi Tabel `transactions`

```sql
ALTER TABLE transactions 
ADD COLUMN customer_type ENUM('retail', 'reseller') NOT NULL AFTER user_id,
ADD COLUMN payment_type ENUM('gateway', 'balance') NOT NULL DEFAULT 'gateway' AFTER payment_method;
```

**Penjelasan:**
- `customer_type`: Snapshot tipe customer saat transaksi
- `payment_type`: 
  - `gateway` = bayar via Tripay (retail)
  - `balance` = potong saldo (reseller)

---

## 🔄 FLOW 1: RETAIL CUSTOMER (Bayar Langsung)

### Step-by-Step Process

```
1. Customer pilih produk
   ├─ SELECT * FROM products WHERE is_active = 1
   └─ Tampilkan retail_price

2. Customer isi data (User ID, Zone ID, dll)
   └─ Validasi input sesuai product.input_fields

3. Create Transaction
   ├─ INSERT INTO transactions
   │   ├─ customer_type = 'retail'
   │   ├─ payment_type = 'gateway'
   │   ├─ product_price = retail_price
   │   ├─ status = 'pending'
   │   └─ payment_status = 'pending'
   └─ Transaction Code: TRX-20260131-00001

4. Create Payment (Tripay)
   ├─ Request ke Tripay API
   ├─ INSERT INTO payments
   │   ├─ payment_reference = dari Tripay
   │   ├─ payment_code = VA Number / QRIS
   │   ├─ amount = product_price + admin_fee
   │   └─ expired_at = +2 jam
   └─ Return payment instructions ke customer

5. Customer Bayar
   ├─ Transfer ke VA / Scan QRIS
   └─ Menunggu konfirmasi...

6. Tripay Callback (Webhook)
   ├─ POST /api/payment/callback
   ├─ Validate signature
   ├─ INSERT INTO payment_callbacks
   ├─ UPDATE payments SET status = 'paid'
   └─ UPDATE transactions SET payment_status = 'paid'

7. Process Transaction (After Payment Success)
   ├─ UPDATE transactions SET status = 'processing'
   ├─ INSERT INTO transaction_logs
   │   └─ 'Payment confirmed, processing order'
   │
   ├─ Send to Digiflazz
   │   ├─ POST /v1/transaction
   │   └─ {buyer_sku_code, customer_no, ref_id}
   │
   └─ Wait for response...

8. Digiflazz Response
   ├─ IF SUCCESS:
   │   ├─ UPDATE transactions
   │   │   ├─ status = 'success'
   │   │   ├─ digiflazz_trx_id = xxx
   │   │   ├─ digiflazz_serial_number = voucher code
   │   │   └─ completed_at = NOW()
   │   ├─ INSERT INTO transaction_logs
   │   │   └─ 'Order completed successfully'
   │   └─ INSERT INTO notifications
   │       └─ 'Order berhasil! Kode voucher: XXX'
   │
   └─ IF FAILED:
       ├─ UPDATE transactions SET status = 'failed'
       ├─ INSERT INTO transaction_logs
       ├─ Refund to customer (create refund payment)
       └─ INSERT INTO notifications
           └─ 'Order gagal, dana dikembalikan'

9. Send Result to Customer
   ├─ Email notification
   ├─ WhatsApp (optional)
   └─ Push notification
```

### Code Example (Laravel Controller)

```php
// Customer create order
public function createOrder(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'customer_data' => 'required|array',
        'payment_method' => 'required|string',
    ]);
    
    $product = Product::findOrFail($validated['product_id']);
    $user = auth()->user();
    
    // Check customer type
    $price = ($user->customer_type === 'reseller') 
        ? $product->reseller_price 
        : $product->retail_price;
    
    DB::beginTransaction();
    try {
        // Create transaction
        $transaction = Transaction::create([
            'transaction_code' => $this->generateTrxCode(),
            'user_id' => $user->id,
            'product_id' => $product->id,
            'customer_type' => $user->customer_type,
            'payment_type' => 'gateway', // Retail always via gateway
            'product_name' => $product->name,
            'product_code' => $product->digiflazz_code,
            'product_price' => $price,
            'admin_fee' => 1500,
            'total_price' => $price + 1500,
            'customer_data' => $validated['customer_data'],
            'status' => 'pending',
            'payment_status' => 'pending',
            'expired_at' => now()->addHours(2),
        ]);
        
        // Create payment via Tripay
        $tripayService = new TripayService();
        $payment = $tripayService->createPayment([
            'method' => $validated['payment_method'],
            'merchant_ref' => $transaction->transaction_code,
            'amount' => $transaction->total_price,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone,
            'order_items' => [[
                'name' => $product->name,
                'price' => $price,
                'quantity' => 1,
            ]],
            'expired_time' => now()->addHours(2)->timestamp,
        ]);
        
        // Save payment data
        Payment::create([
            'transaction_id' => $transaction->id,
            'payment_reference' => $payment['reference'],
            'payment_method' => $payment['payment_method'],
            'payment_channel' => $payment['payment_name'],
            'payment_code' => $payment['pay_code'] ?? null,
            'amount' => $transaction->total_price,
            'fee' => $payment['total_fee']['customer'] ?? 0,
            'total_amount' => $payment['amount_received'],
            'qr_url' => $payment['qr_url'] ?? null,
            'checkout_url' => $payment['checkout_url'] ?? null,
            'payment_instructions' => $payment['instructions'] ?? null,
            'expired_at' => $payment['expired_time'],
        ]);
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'data' => [
                'transaction' => $transaction,
                'payment' => $payment,
            ],
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
}
```

---

## 🔄 FLOW 2: RESELLER CUSTOMER (Potong Saldo)

### Step-by-Step Process

```
1. Customer pilih produk
   ├─ SELECT * FROM products WHERE is_active = 1
   └─ Tampilkan reseller_price (lebih murah)

2. Customer isi data (User ID, Zone ID, dll)
   └─ Validasi input

3. Check Balance
   ├─ SELECT balance FROM balances WHERE user_id = ?
   ├─ IF balance < product_price:
   │   └─ Return error: "Saldo tidak cukup"
   └─ ELSE: Continue...

4. Create Transaction & Deduct Balance
   ├─ BEGIN TRANSACTION
   │
   ├─ INSERT INTO transactions
   │   ├─ customer_type = 'reseller'
   │   ├─ payment_type = 'balance'
   │   ├─ product_price = reseller_price
   │   ├─ status = 'pending'
   │   ├─ payment_status = 'paid' (langsung paid)
   │   └─ paid_at = NOW()
   │
   ├─ UPDATE balances
   │   └─ balance = balance - product_price
   │
   ├─ INSERT INTO balance_mutations
   │   ├─ type = 'debit'
   │   ├─ amount = product_price
   │   ├─ balance_before = old_balance
   │   ├─ balance_after = new_balance
   │   ├─ description = 'Pembelian: Product Name'
   │   ├─ reference_type = 'purchase'
   │   └─ reference_id = transaction.id
   │
   └─ COMMIT

5. Process Transaction (Langsung, tanpa tunggu payment)
   ├─ UPDATE transactions SET status = 'processing'
   ├─ Send to Digiflazz
   └─ (sama seperti retail customer setelah payment)

6. Digiflazz Response
   ├─ IF SUCCESS:
   │   └─ (sama seperti retail)
   │
   └─ IF FAILED:
       ├─ UPDATE transactions SET status = 'failed'
       ├─ REFUND BALANCE:
       │   ├─ UPDATE balances (balance += product_price)
       │   └─ INSERT INTO balance_mutations (type = 'credit')
       └─ Notify customer
```

### Code Example (Laravel Controller)

```php
// Reseller create order
public function createOrderReseller(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'customer_data' => 'required|array',
    ]);
    
    $product = Product::findOrFail($validated['product_id']);
    $user = auth()->user();
    
    // Verify user is reseller
    if ($user->customer_type !== 'reseller') {
        return response()->json([
            'success' => false,
            'message' => 'This endpoint is only for reseller',
        ], 403);
    }
    
    $balance = Balance::where('user_id', $user->id)->first();
    $price = $product->reseller_price;
    
    // Check balance
    if ($balance->balance < $price) {
        return response()->json([
            'success' => false,
            'message' => 'Saldo tidak cukup. Silakan top up terlebih dahulu.',
        ], 400);
    }
    
    DB::beginTransaction();
    try {
        // Create transaction
        $transaction = Transaction::create([
            'transaction_code' => $this->generateTrxCode(),
            'user_id' => $user->id,
            'product_id' => $product->id,
            'customer_type' => 'reseller',
            'payment_type' => 'balance',
            'product_name' => $product->name,
            'product_code' => $product->digiflazz_code,
            'product_price' => $price,
            'admin_fee' => 0, // Reseller no admin fee
            'total_price' => $price,
            'customer_data' => $validated['customer_data'],
            'status' => 'pending',
            'payment_status' => 'paid', // Langsung paid
            'paid_at' => now(),
        ]);
        
        // Deduct balance
        $oldBalance = $balance->balance;
        $balance->decrement('balance', $price);
        $newBalance = $balance->fresh()->balance;
        
        // Record balance mutation
        BalanceMutation::create([
            'user_id' => $user->id,
            'transaction_id' => $transaction->id,
            'type' => 'debit',
            'amount' => $price,
            'balance_before' => $oldBalance,
            'balance_after' => $newBalance,
            'description' => "Pembelian: {$product->name}",
            'reference_type' => 'purchase',
            'reference_id' => $transaction->id,
        ]);
        
        // Log
        TransactionLog::create([
            'transaction_id' => $transaction->id,
            'status_from' => null,
            'status_to' => 'pending',
            'message' => 'Transaction created, balance deducted',
        ]);
        
        DB::commit();
        
        // Process to Digiflazz (background job)
        ProcessDigiflazzOrder::dispatch($transaction);
        
        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
}
```

---

## 🎯 RESELLER TOP UP FLOW

```
1. Reseller request top up
   └─ Amount: 100,000

2. Create Top Up Transaction
   ├─ INSERT INTO transactions
   │   ├─ type: 'topup' (perlu tambah field ini)
   │   ├─ amount: 100,000
   │   ├─ status: 'pending'
   │   └─ payment_status: 'pending'
   │
   └─ Create Payment via Tripay (sama seperti retail)

3. After Payment Success (Callback)
   ├─ UPDATE transactions (payment_status = 'paid')
   │
   ├─ UPDATE balances
   │   └─ balance = balance + 100,000
   │
   └─ INSERT INTO balance_mutations
       ├─ type = 'credit'
       ├─ amount = 100,000
       ├─ description = 'Top Up Saldo'
       └─ reference_type = 'topup'
```

---

## 💡 BUSINESS LOGIC SUMMARY

### Retail Customer
✅ Tidak perlu registrasi (bisa guest checkout)
✅ Harga lebih mahal (retail price)
✅ Bayar langsung per transaksi
✅ Cocok untuk end user yang beli sekali-kali
✅ Lebih mudah untuk customer, tapi margin lebih besar

### Reseller Customer
✅ Harus registrasi & approval (optional)
✅ Harga lebih murah (reseller price)
✅ Pakai sistem deposit/saldo
✅ Cocok untuk yang mau jual lagi
✅ Bisa set minimum order
✅ Margin lebih kecil tapi volume lebih besar

---

## 📊 PRICING EXAMPLE

| Product | Base (Digiflazz) | Retail Price | Reseller Price | Margin Retail | Margin Reseller |
|---------|------------------|--------------|----------------|---------------|-----------------|
| ML 86 Diamonds | Rp 20,000 | Rp 24,000 | Rp 21,500 | Rp 4,000 | Rp 1,500 |
| PUBG 60 UC | Rp 15,000 | Rp 18,000 | Rp 16,000 | Rp 3,000 | Rp 1,000 |
| Telkomsel 10K | Rp 10,000 | Rp 12,000 | Rp 10,500 | Rp 2,000 | Rp 500 |

---

## 🔧 ADDITIONAL FEATURES

### 1. Auto Upgrade to Reseller
Jika retail customer sering beli (>10x/bulan), bisa auto suggest upgrade ke reseller.

### 2. Tiered Reseller
- Silver Reseller: Harga level 1
- Gold Reseller: Harga level 2 (lebih murah)
- Platinum Reseller: Harga level 3 (paling murah)

### 3. Reseller Dashboard
- Total penjualan
- Profit per bulan
- History transaksi
- Download invoice
- Top up history

---

**Pilih model yang sesuai dengan target market Anda! 🚀**
