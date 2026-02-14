# 💰 Fitur Refund - Enstore

**Tanggal Implementasi:** 14 Februari 2026  
**Status:** ✅ Implemented

---

## 📋 Ringkasan

Fitur refund memungkinkan pengembalian dana ke saldo pengguna ketika transaksi gagal atau perlu dibatalkan. Refund didukung untuk **semua metode pembayaran** — baik saldo maupun payment gateway (QRIS, Bank Transfer, e-wallet via Tripay).

> **Catatan Penting:** Untuk pembayaran via payment gateway, dana dikembalikan ke **saldo akun Enstore** pengguna (bukan ke metode bayar asli), karena Tripay tidak mendukung API refund langsung untuk transaksi yang sudah gagal.

---

## 🔄 Alur Refund

### Refund Otomatis (Auto-Refund)

```
Transaksi Gagal di Digiflazz
    ↓
handleFailed() dipanggil di Job
(ProcessDigiflazzOrder / CheckDigiflazzOrderStatus)
    ↓
Cek: user_id ada?
    ├── Ya → TransactionService->refundTransaction()
    │         ├── 1. BalanceService->addBalance()
    │         │      (dana masuk ke saldo user)
    │         ├── 2. Transaction status → 'refunded'
    │         │      set refunded_at = now()
    │         ├── 3. TransactionLog dicatat
    │         │      (type: 'refunded', detail refund)
    │         └── 4. Notification dibuat
    │              ("Dana Rp X dikembalikan ke saldo")
    │
    └── Tidak (guest) → Tidak bisa auto-refund
                         (perlu manual oleh admin)
```

### Refund Manual (Admin)

```
Admin membuka halaman transaksi
    ↓
Pilih transaksi yang gagal/bermasalah
    ↓
Klik "Refund" dan isi alasan
    ↓
POST /api/admin/transactions/{id}/refund
Body: { "reason": "Alasan refund" }
    ↓
TransactionService->refundTransaction() dipanggil
    ↓
Dana dikembalikan ke saldo user
```

---

## 🏗️ Arsitektur & File yang Terlibat

### Backend

| File | Peran | Perubahan |
|------|-------|-----------|
| `app/Services/TransactionService.php` | **Pusat logic refund** | ➕ Method `refundTransaction()` — centralized refund yang handle validasi, pengembalian saldo, logging, notifikasi |
| `app/Services/BalanceService.php` | Manajemen saldo user | Tidak diubah — sudah ada `addBalance()` yang digunakan oleh refund |
| `app/Jobs/ProcessDigiflazzOrder.php` | Proses order Digiflazz | 🔨 Hapus buggy `refundBalance()`, ganti dengan `TransactionService->refundTransaction()`. Sekarang refund **semua** jenis pembayaran |
| `app/Jobs/CheckDigiflazzOrderStatus.php` | Cek status order | 🔨 Sama — hapus buggy `refundBalance()`, ganti dengan centralized refund |
| `app/Models/Transaction.php` | Model transaksi | ➕ Method `isRefunded()` dan scope `scopeRefunded` |
| `app/Http/Controllers/Api/Admin/TransactionController.php` | Admin API | ➕ Endpoint `refund()` untuk refund manual oleh admin |
| `app/Http/Controllers/Api/Public/PublicTransactionController.php` | Public API | ➕ Data refund di response `checkStatus()` |
| `routes/api.php` | Routing | ➕ Route `POST /admin/transactions/{id}/refund` |

### Frontend

| File | Peran | Perubahan |
|------|-------|-----------|
| `src/lib/api/transactions.ts` | Type definitions | ➕ Field `refund` di interface `TransactionStatus` |
| `src/app/track-order/page.tsx` | Halaman lacak pesanan | ➕ Stepper dinamis (step "Refunded" amber), banner info refund |
| `src/components/services/PaymentResult.tsx` | Hasil pembayaran | ➕ Support status `"refunded"` |

---

## 📡 API Endpoints

### 1. Cek Status Transaksi (Public)

**Endpoint:** `GET /api/public/transactions/{transactionCode}/status`

**Response (dengan refund):**
```json
{
  "success": true,
  "data": {
    "transaction_code": "ENS/2026...",
    "status": "refunded",
    "payment_status": "paid",
    "product_name": "100 Diamond Mobile Legends",
    "total_price": 25000,
    "product": { ... },
    "pricing": { ... },
    "payment": { ... },
    "refund": {
      "is_refunded": true,
      "refunded_at": "2026-02-14T12:00:00.000Z",
      "refund_amount": 25000,
      "refund_method": "balance"
    },
    "sn": null,
    "note": "Provider gagal memproses"
  }
}
```

### 2. Admin Refund Manual

**Endpoint:** `POST /api/admin/transactions/{id}/refund`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Customer request refund - transaksi gagal"
}
```

**Response (sukses):**
```json
{
  "success": true,
  "message": "Transaction refunded successfully. Amount credited to user balance.",
  "data": {
    "id": 123,
    "transaction_code": "ENS/2026...",
    "status": "refunded",
    "refunded_at": "2026-02-14T19:00:00.000Z",
    "total_price": 25000,
    "user": { ... },
    "payment": { ... }
  }
}
```

**Response (gagal):**
```json
{
  "success": false,
  "message": "Transaction has already been refunded"
}
```

### 3. Admin Update Status (Updated)

**Endpoint:** `PUT /api/admin/transactions/{id}/status`

**Allowed status values:** `pending`, `processing`, `success`, `failed`, `cancelled`, `refunded`

---

## 🔐 Validasi Refund

Method `refundTransaction()` memiliki validasi ketat:

| Validasi | Keterangan |
|----------|------------|
| **Status transaksi** | Hanya bisa refund transaksi dengan status `failed`, `processing`, atau `success` |
| **Belum pernah refund** | Jika `refunded_at` sudah terisi, refund ditolak (mencegah double refund) |
| **Harus ada user** | Transaksi guest (`user_id = null`) tidak bisa di-auto-refund — harus manual |

---

## 📊 Database Changes

### Tabel `transactions`

Field yang digunakan saat refund:

| Column | Type | Keterangan |
|--------|------|------------|
| `status` | enum | Diubah ke `'refunded'` |
| `refunded_at` | timestamp(nullable) | Diisi waktu refund dilakukan |

> Kolom `status` sudah mendukung value `'refunded'` sejak migration awal: `create_transactions_table.php`

### Tabel `balances`

| Column | Type | Keterangan |
|--------|------|------------|
| `balance` | decimal | Di-increment sebesar `total_price` transaksi |

### Tabel `balance_mutations` (record baru)

| Column | Value |
|--------|-------|
| `type` | `'credit'` |
| `amount` | Sama dengan `total_price` transaksi |
| `description` | `'Refund: ENS/2026... - Alasan refund'` |
| `transaction_id` | ID transaksi yang di-refund |

### Tabel `transaction_logs` (record baru)

| Column | Value |
|--------|-------|
| `status` | `'refunded'` |
| `description` | `'Transaction refunded: Alasan refund'` |
| `meta_data` | `{"refund_amount": 25000, "refund_method": "balance", "original_payment_method": "tripay"}` |

### Tabel `notifications` (record baru)

| Column | Value |
|--------|-------|
| `title` | `'Refund Berhasil'` |
| `message` | `'Dana sebesar Rp 25.000 telah dikembalikan ke saldo Anda untuk transaksi ENS/2026...'` |
| `type` | `'success'` |

---

## 🎨 Frontend UI

### Track Order Page — Status Refunded

Ketika transaksi berstatus `refunded`, halaman Track Order menampilkan:

1. **Stepper** — step terakhir berubah dari ✅ "Success" menjadi 🔄 "Refunded" dengan warna **amber/kuning**
2. **Banner Refund** — panel informasi di bawah stepper yang berisi:
   - 🏦 Ikon wallet
   - Judul: "Dana Telah Dikembalikan"
   - Pesan: "Transaksi ini telah di-refund. Dana telah dikreditkan ke saldo akun Anda."
   - **Jumlah Refund**: Rp 25.000
   - **Metode Refund**: Saldo Akun
   - **Tanggal Refund**: 14 Februari 2026, 19:00

### Warna Stepper per Status

| Status | Warna | Icon Step 3 |
|--------|-------|-------------|
| `pending` | Ocean/blue | PaymentsRounded |
| `processing` | Ocean/blue | AutorenewRounded |
| `success` | Ocean/blue | CheckCircleRounded |
| `failed` | Red | ErrorRounded |
| `expired` | Red | ErrorRounded |
| `refunded` | Amber/yellow | ReplayRounded |

---

## 🐛 Bug yang Diperbaiki

### Bug #1: Field Name Salah di `refundBalance()`

**Sebelum (Buggy):**
```php
// ❌ 'total_amount' tidak ada di model Transaction
$balance->increment('amount', $this->transaction->total_amount);

BalanceMutation::create([
    'amount' => $this->transaction->total_amount,
    // ...
]);
```

**Sesudah (Fixed — sekarang terpusat di TransactionService):**
```php
// ✅ Menggunakan BalanceService->addBalance() yang sudah benar
$this->balanceService->addBalance(
    $user,
    $transaction->total_price, // ← field yang benar
    'Refund: ' . $transaction->transaction_code,
    $transaction
);
```

### Bug #2: Status `refunded` Tidak Pernah Di-set

**Sebelum:** Meskipun ada enum `'refunded'` di migration dan field `refunded_at` di model, tidak ada kode yang mengatur status ini.

**Sesudah:** `refundTransaction()` mengatur keduanya:
```php
$transaction->update([
    'status' => 'refunded',
    'refunded_at' => now(),
]);
```

### Bug #3: Hanya Balance Payment yang Di-refund

**Sebelum:** Hanya pembayaran via saldo yang di-refund. Pembayaran via gateway (QRIS, transfer) **tidak** dikembalikan jika transaksi gagal.

**Sesudah:** Semua jenis pembayaran di-refund ke saldo user:
```php
// Sebelum: hanya jika balance
if ($this->transaction->payment_method_type === 'balance') {
    $this->refundBalance();
}

// Sesudah: semua user mendapat refund
if ($this->transaction->user_id) {
    $transactionService->refundTransaction($this->transaction, '...');
}
```

---

## 🔮 Roadmap / Perbaikan di Masa Depan

- [ ] **Admin Dashboard UI** — Tombol refund di halaman detail transaksi admin
- [ ] **Guest Refund** — Mekanisme refund untuk transaksi guest (email notifikasi + link klaim saldo)
- [ ] **Partial Refund** — Support refund sebagian (bukan seluruh total_price)
- [ ] **Refund Policy** — Konfigurasi batas waktu refund otomatis
- [ ] **Refund Report** — Laporan refund untuk admin (jumlah, frekuensi, alasan)
- [ ] **Tripay Direct Refund** — Jika di masa depan Tripay mendukung API refund langsung, integrasikan

---

## ⚙️ Konfigurasi & Catatan Teknis

### Dependency Injection

`TransactionService` depend pada `BalanceService`:
```php
class TransactionService {
    protected $balanceService;
    
    public function __construct(BalanceService $balanceService) {
        $this->balanceService = $balanceService;
    }
}
```

### Di dalam Job (resolve via container)

Karena Job tidak dapat langsung inject service, kita mengambilnya dari container:
```php
$transactionService = app(TransactionService::class);
$transactionService->refundTransaction($this->transaction, 'reason');
```

### Transaction Safety

`refundTransaction()` menggunakan `DB::beginTransaction()` dan `DB::rollBack()` untuk memastikan atomicity — jika ada satu langkah yang gagal, semua perubahan dibatalkan.

---

**Dokumentasi ini terakhir diperbarui: 14 Februari 2026**
