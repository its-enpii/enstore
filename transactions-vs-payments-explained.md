# 🔄 PENJELASAN LENGKAP: TRANSACTIONS vs PAYMENTS

## 🤔 Kenapa Perlu 2 Tabel Terpisah?

Bayangkan seperti ini:
- **transactions** = Pesanan kamu (apa yang kamu beli)
- **payments** = Cara pembayaran pesanan itu

**Analogi Sederhana:**
```
Kamu pesan Gojek:
├─ transactions = Data perjalananmu (dari mana, ke mana, berapa)
└─ payments = Bayarnya pakai OVO/GoPay/Cash
```

---

## 📊 TABEL TRANSACTIONS

### Ini Isinya Apa?

**transactions** menyimpan informasi tentang **APA yang dibeli customer**

```sql
transactions {
    id: 1
    transaction_code: "TRX-20260131-ABC123"
    user_id: 5
    product_id: 10
    
    -- Ini yang dibeli
    product_name: "Mobile Legends 86 Diamonds"
    product_price: 24000
    admin_fee: 1500
    total_price: 25500
    
    -- Data customer (User ID game, Zone ID)
    customer_data: {"user_id": "12345", "zone_id": "6789"}
    
    -- Status pembelian
    status: "pending" → "processing" → "success"
    payment_status: "pending" → "paid"
}
```

### Field-field Penting:

| Field | Penjelasan | Contoh |
|-------|------------|--------|
| `transaction_code` | Kode unik transaksi | TRX-20260131-ABC123 |
| `customer_type` | Tipe customer | retail / reseller |
| `payment_type` | Cara bayar | gateway (Tripay) / balance (saldo) |
| `transaction_type` | Jenis transaksi | purchase (beli) / topup (isi saldo) |
| `status` | Status pemrosesan | pending → processing → success |
| `payment_status` | Status pembayaran | pending → paid → expired |
| `digiflazz_serial_number` | Kode voucher hasil | 1234-5678-9012 |

---

## 💳 TABEL PAYMENTS

### Ini Isinya Apa?

**payments** menyimpan informasi tentang **BAGAIMANA customer bayar**

```sql
payments {
    id: 1
    transaction_id: 1  -- Link ke transactions
    
    -- Cara bayar
    payment_method: "QRIS"
    payment_channel: "QRIS (All Payment)"
    payment_code: "ID123456789"
    
    -- Nominal
    amount: 25500
    fee: 0
    total_amount: 25500
    
    -- Info dari Tripay
    payment_reference: "T12345"
    qr_url: "https://tripay.co.id/qr/xxx"
    checkout_url: "https://tripay.co.id/checkout/xxx"
    
    -- Status
    status: "pending" → "paid"
}
```

### Field-field Penting:

| Field | Penjelasan | Contoh |
|-------|------------|--------|
| `payment_reference` | Reference dari Tripay | T12345ABCDE |
| `payment_method` | Metode pembayaran | QRIS, BRIVA, BCAVA |
| `payment_code` | Nomor VA / kode bayar | 8123456789012 (VA BCA) |
| `qr_url` | URL QR Code | https://tripay.co.id/qr/... |
| `checkout_url` | URL halaman bayar | https://tripay.co.id/checkout/... |
| `status` | Status pembayaran | pending → paid |
| `expired_at` | Kapan kadaluarsa | 2026-01-31 14:00:00 |

---

## 🔄 KENAPA DIPISAH?

### Alasan 1: Satu Transaksi Bisa Punya Banyak Payment Attempts

**Contoh Kasus:**
```
Customer buat transaksi → payment_status: pending
├─ Attempt 1: Bayar pakai QRIS → expired (customer lupa bayar)
├─ Attempt 2: Bayar pakai BCA VA → expired (salah transfer)
└─ Attempt 3: Bayar pakai OVO → success ✅
```

**Dengan 2 tabel terpisah:**
```
transactions (1 row)
├─ id: 1
└─ payment_status: "paid"

payments (3 rows untuk 1 transaksi)
├─ id: 1, transaction_id: 1, method: QRIS, status: expired
├─ id: 2, transaction_id: 1, method: BRIVA, status: expired
└─ id: 3, transaction_id: 1, method: OVO, status: paid ✅
```

### Alasan 2: Transaksi Reseller Tidak Perlu Payment

**Reseller (pakai saldo):**
```
transactions
├─ payment_type: "balance"  -- Tidak pakai Tripay
└─ payment_status: "paid"   -- Langsung paid

payments
└─ (KOSONG - tidak ada record)
```

### Alasan 3: Audit Trail yang Jelas

Kita bisa tracking:
- Kapan customer pilih metode bayar apa
- Berapa lama customer bayar
- Berapa kali customer ganti metode
- Fee dari payment gateway

---

## 📋 FLOW LENGKAP: RETAIL CUSTOMER

### Scenario: Customer Beli Diamond Mobile Legends

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Customer Pilih Produk                               │
└─────────────────────────────────────────────────────────────┘

Customer klik: "Mobile Legends 86 Diamonds - Rp 24,000"
Customer isi form:
├─ Email: john@email.com
├─ WhatsApp: 081234567890
├─ User ID: 12345678
└─ Zone ID: 1234

Customer pilih metode bayar: QRIS


┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Proses Request                              │
└─────────────────────────────────────────────────────────────┘

Backend:
1. Get or create guest user (email: john@email.com)
2. Generate transaction code: TRX-20260131-ABC123


┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Insert ke Tabel TRANSACTIONS                        │
└─────────────────────────────────────────────────────────────┘

INSERT INTO transactions:
{
    transaction_code: "TRX-20260131-ABC123",
    user_id: 5,
    product_id: 10,
    customer_type: "retail",
    payment_type: "gateway",
    transaction_type: "purchase",
    product_name: "Mobile Legends 86 Diamonds",
    product_code: "ML86",
    product_price: 24000,
    admin_fee: 1500,
    total_price: 25500,
    customer_data: {"user_id": "12345678", "zone_id": "1234"},
    status: "pending",           ← Masih pending
    payment_status: "pending",   ← Belum dibayar
    expired_at: "2026-01-31 14:00:00"
}

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Request ke Tripay API                               │
└─────────────────────────────────────────────────────────────┘

POST https://tripay.co.id/api/transaction/create
{
    method: "QRIS",
    merchant_ref: "TRX-20260131-ABC123",
    amount: 25500,
    customer_name: "Guest User",
    customer_email: "john@email.com"
}

Response dari Tripay:
{
    reference: "T12345ABCDE",
    payment_method: "QRIS",
    payment_name: "QRIS (All Payment)",
    pay_code: null,
    qr_url: "https://tripay.co.id/qr/xxxxx",
    checkout_url: "https://tripay.co.id/checkout/xxxxx",
    amount_received: 25500,
    expired_time: 1738329600
}


┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Insert ke Tabel PAYMENTS                            │
└─────────────────────────────────────────────────────────────┘

INSERT INTO payments:
{
    transaction_id: 1,
    payment_reference: "T12345ABCDE",
    payment_method: "QRIS",
    payment_channel: "QRIS (All Payment)",
    payment_code: null,
    amount: 25500,
    fee: 0,
    total_amount: 25500,
    qr_url: "https://tripay.co.id/qr/xxxxx",
    checkout_url: "https://tripay.co.id/checkout/xxxxx",
    status: "pending",           ← Belum dibayar
    expired_at: "2026-01-31 14:00:00"
}


┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Return ke Frontend                                  │
└─────────────────────────────────────────────────────────────┘

Response ke customer:
{
    transaction_code: "TRX-20260131-ABC123",
    payment: {
        method: "QRIS (All Payment)",
        qr_url: "https://tripay.co.id/qr/xxxxx",
        amount: 25500,
        expired_at: "2026-01-31 14:00:00"
    }
}

Customer scan QR Code dan bayar


┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Customer Bayar (via QRIS)                           │
└─────────────────────────────────────────────────────────────┘

Customer scan QR → Bayar pakai Dana/OVO/GoPay
Tripay detect pembayaran berhasil
Tripay kirim callback ke server kita


┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Tripay Callback (Webhook)                           │
└─────────────────────────────────────────────────────────────┘

POST /api/payment/callback
{
    reference: "T12345ABCDE",
    merchant_ref: "TRX-20260131-ABC123",
    status: "PAID",
    paid_at: 1738326000
}

Backend validate signature ✅


┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Update Database (Payment Success)                   │
└─────────────────────────────────────────────────────────────┘

UPDATE payments WHERE payment_reference = "T12345ABCDE":
{
    status: "paid",              ← Changed!
    paid_at: "2026-01-31 12:30:00"
}

UPDATE transactions WHERE transaction_code = "TRX-20260131-ABC123":
{
    payment_status: "paid",      ← Changed!
    paid_at: "2026-01-31 12:30:00"
}

INSERT INTO payment_callbacks:
{
    payment_id: 1,
    callback_data: {...},
    is_valid: TRUE,
    processed: TRUE
}


┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Process ke Digiflazz                               │
└─────────────────────────────────────────────────────────────┘

UPDATE transactions:
{
    status: "processing"         ← Changed!
}

POST https://api.digiflazz.com/v1/transaction
{
    username: "your_username",
    buyer_sku_code: "ML86",
    customer_no: "12345678-1234",
    ref_id: "TRX-20260131-ABC123"
}

Response dari Digiflazz:
{
    status: "Sukses",
    sn: "1234-5678-9012-3456"  ← Kode voucher!
}


┌─────────────────────────────────────────────────────────────┐
│ STEP 11: Update Transaksi Success                           │
└─────────────────────────────────────────────────────────────┘

UPDATE transactions:
{
    status: "success",           ← Changed!
    digiflazz_trx_id: "DGF123456",
    digiflazz_serial_number: "1234-5678-9012-3456",
    digiflazz_status: "Sukses",
    completed_at: "2026-01-31 12:31:00"
}

INSERT INTO transaction_logs:
{
    transaction_id: 1,
    status_from: "processing",
    status_to: "success",
    message: "Order completed successfully"
}

INSERT INTO notifications:
{
    user_id: 5,
    title: "Transaksi Berhasil!",
    message: "Kode voucher: 1234-5678-9012-3456"
}


┌─────────────────────────────────────────────────────────────┐
│ STEP 12: Kirim Notifikasi ke Customer                       │
└─────────────────────────────────────────────────────────────┘

Send Email to: john@email.com
Subject: Transaksi Berhasil - TRX-20260131-ABC123
Body:
  Terima kasih sudah berbelanja!
  
  Produk: Mobile Legends 86 Diamonds
  Kode Voucher: 1234-5678-9012-3456
  
  Cara input:
  1. Buka Mobile Legends
  2. Pilih Recharge
  3. Masukkan kode di atas

Send WhatsApp to: 081234567890 (optional)
```

---

## 📊 VISUALISASI DATABASE (Saat Setiap Step)

### After STEP 3 (Create Transaction)

```
┌─ transactions ──────────────────────────────────┐
│ id: 1                                           │
│ transaction_code: TRX-20260131-ABC123           │
│ status: pending                                 │
│ payment_status: pending                         │
│ total_price: 25500                              │
└─────────────────────────────────────────────────┘

┌─ payments ──────────────────────────────────────┐
│ (belum ada record)                              │
└─────────────────────────────────────────────────┘
```

### After STEP 5 (Create Payment)

```
┌─ transactions ──────────────────────────────────┐
│ id: 1                                           │
│ transaction_code: TRX-20260131-ABC123           │
│ status: pending              ← Masih pending    │
│ payment_status: pending      ← Masih pending    │
│ total_price: 25500                              │
└─────────────────────────────────────────────────┘
                    ↓ has one payment
┌─ payments ──────────────────────────────────────┐
│ id: 1                                           │
│ transaction_id: 1                               │
│ payment_reference: T12345ABCDE                  │
│ payment_method: QRIS                            │
│ status: pending              ← Belum dibayar    │
│ qr_url: https://...                             │
└─────────────────────────────────────────────────┘
```

### After STEP 9 (Payment Success)

```
┌─ transactions ──────────────────────────────────┐
│ id: 1                                           │
│ transaction_code: TRX-20260131-ABC123           │
│ status: pending              ← Masih pending    │
│ payment_status: paid         ← ✅ CHANGED!      │
│ paid_at: 2026-01-31 12:30    ← ✅ NEW!          │
│ total_price: 25500                              │
└─────────────────────────────────────────────────┘
                    ↓ has one payment
┌─ payments ──────────────────────────────────────┐
│ id: 1                                           │
│ transaction_id: 1                               │
│ payment_reference: T12345ABCDE                  │
│ payment_method: QRIS                            │
│ status: paid                 ← ✅ CHANGED!      │
│ paid_at: 2026-01-31 12:30    ← ✅ NEW!          │
│ qr_url: https://...                             │
└─────────────────────────────────────────────────┘
```

### After STEP 11 (Order Complete)

```
┌─ transactions ──────────────────────────────────┐
│ id: 1                                           │
│ transaction_code: TRX-20260131-ABC123           │
│ status: success              ← ✅ CHANGED!      │
│ payment_status: paid                            │
│ digiflazz_serial_number:     ← ✅ NEW!          │
│   "1234-5678-9012-3456"                         │
│ completed_at: 2026-01-31     ← ✅ NEW!          │
│ total_price: 25500                              │
└─────────────────────────────────────────────────┘
                    ↓ has one payment
┌─ payments ──────────────────────────────────────┐
│ id: 1                                           │
│ transaction_id: 1                               │
│ payment_reference: T12345ABCDE                  │
│ payment_method: QRIS                            │
│ status: paid                                    │
│ paid_at: 2026-01-31 12:30                       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 FLOW PENDEK: RESELLER (Pakai Saldo)

```
┌─────────────────────────────────────────────────────────────┐
│ Reseller Beli Produk (Pakai Saldo)                          │
└─────────────────────────────────────────────────────────────┘

1. Check balance
   └─ Balance: Rp 100,000 ✅ (cukup)

2. INSERT INTO transactions:
   {
       payment_type: "balance",     ← Pakai saldo
       payment_status: "paid",      ← Langsung paid!
       status: "pending"
   }

3. Update balance:
   └─ Balance: Rp 100,000 - Rp 21,500 = Rp 78,500

4. INSERT INTO balance_mutations:
   {
       type: "debit",
       amount: 21500,
       balance_before: 100000,
       balance_after: 78500
   }

5. Process ke Digiflazz (langsung, tanpa tunggu payment!)

6. UPDATE transactions:
   {
       status: "success",
       digiflazz_serial_number: "1234-5678-9012"
   }
```

**PERHATIKAN:**
```
┌─ transactions ──────────────────────────────────┐
│ id: 2                                           │
│ payment_type: balance        ← Pakai saldo      │
│ payment_status: paid         ← Langsung paid    │
└─────────────────────────────────────────────────┘

┌─ payments ──────────────────────────────────────┐
│ (TIDAK ADA RECORD)           ← Tidak perlu!     │
└─────────────────────────────────────────────────┘
```

---

## 🎯 PERBEDAAN STATUS

### payment_status (Di tabel transactions)

Status pembayaran dari payment gateway:

| Status | Arti | Kapan? |
|--------|------|--------|
| `pending` | Belum dibayar | Baru create transaksi |
| `paid` | Sudah dibayar | Setelah customer bayar |
| `expired` | Kadaluarsa | Lewat batas waktu (2 jam) |
| `failed` | Gagal | Payment gateway error |

### status (Di tabel transactions)

Status pemrosesan pesanan ke Digiflazz:

| Status | Arti | Kapan? |
|--------|------|--------|
| `pending` | Menunggu pembayaran | Awal transaksi |
| `processing` | Sedang diproses ke Digiflazz | Setelah payment_status = paid |
| `success` | Berhasil | Dapat kode voucher dari Digiflazz |
| `failed` | Gagal | Digiflazz return error |
| `refunded` | Dikembalikan | Refund karena gagal |

### Timeline Status:

```
RETAIL (Gateway):
payment_status: pending → paid → (tetap paid)
status:         pending → (tunggu paid) → processing → success

RESELLER (Balance):
payment_status: paid (langsung)
status:         pending → processing → success
```

---

## 💡 KENAPA PERLU payment_callbacks?

**Untuk audit trail dan debugging!**

```sql
payment_callbacks {
    id: 1,
    payment_id: 1,
    callback_data: {
        "reference": "T12345ABCDE",
        "merchant_ref": "TRX-20260131-ABC123",
        "status": "PAID",
        "amount": 25500,
        "paid_at": 1738326000
    },
    signature: "abc123def456...",
    ip_address: "103.127.96.10",  ← IP Tripay
    is_valid: TRUE,                ← Signature valid?
    processed: TRUE,               ← Sudah diproses?
    created_at: "2026-01-31 12:30:00"
}
```

**Kegunaan:**
- ✅ Bisa re-process jika ada yang gagal
- ✅ Detect duplikat callback
- ✅ Detect fake callback (IP tidak valid)
- ✅ Debugging saat ada masalah
- ✅ Compliance & audit

---

## 📝 QUERY EXAMPLES

### 1. Get Transaksi dengan Payment Info

```sql
SELECT 
    t.transaction_code,
    t.product_name,
    t.total_price,
    t.status AS transaction_status,
    t.payment_status,
    p.payment_method,
    p.payment_code,
    p.status AS payment_status_detail,
    t.digiflazz_serial_number
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
WHERE t.user_id = 5
ORDER BY t.created_at DESC;
```

### 2. Get Pending Payments (Belum Dibayar)

```sql
SELECT 
    t.transaction_code,
    t.product_name,
    t.total_price,
    p.payment_method,
    p.payment_code,
    p.qr_url,
    p.expired_at,
    TIMESTAMPDIFF(MINUTE, NOW(), p.expired_at) AS minutes_left
FROM transactions t
JOIN payments p ON p.transaction_id = t.id
WHERE t.payment_status = 'pending'
  AND p.status = 'pending'
  AND p.expired_at > NOW()
ORDER BY p.expired_at ASC;
```

### 3. Success Transactions (Sudah Dapat Voucher)

```sql
SELECT 
    t.transaction_code,
    t.product_name,
    t.customer_data,
    t.digiflazz_serial_number,
    t.completed_at,
    u.email
FROM transactions t
JOIN users u ON u.id = t.user_id
WHERE t.status = 'success'
  AND t.digiflazz_serial_number IS NOT NULL
ORDER BY t.completed_at DESC;
```

### 4. Failed Payments yang Perlu Refund

```sql
SELECT 
    t.transaction_code,
    t.total_price,
    t.customer_type,
    p.payment_method,
    u.email,
    u.phone
FROM transactions t
JOIN payments p ON p.transaction_id = t.id
JOIN users u ON u.id = t.user_id
WHERE t.status = 'failed'
  AND t.payment_status = 'paid'
  AND t.refunded_at IS NULL;
```

---

## ✅ SUMMARY

### transactions Table:
- ✅ Menyimpan **APA** yang dibeli
- ✅ Product info, customer data, voucher code
- ✅ Ada untuk **semua transaksi** (retail & reseller)
- ✅ Status: pending → processing → success

### payments Table:
- ✅ Menyimpan **BAGAIMANA** customer bayar
- ✅ Payment method, VA number, QR code
- ✅ **HANYA ada** untuk transaksi via gateway (Tripay)
- ✅ **TIDAK ada** untuk reseller yang pakai saldo
- ✅ Status: pending → paid

### Relationship:
```
transactions (1) ----< (0..1) payments

Artinya:
- 1 transaction bisa punya 0 atau 1 payment
- 0 payment = reseller pakai balance
- 1 payment = retail/reseller bayar via Tripay
```

---

**Sudah jelas? 🚀**

Intinya:
- **transactions** = Data pembelian (ALWAYS exist)
- **payments** = Data pembayaran (ONLY exist kalau bayar via Tripay)
