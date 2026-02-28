# Integrasi Pihak Ketiga

## 💳 Tripay (Payment Gateway)

Tripay menangani semua pembayaran digital: QRIS, Virtual Account (VA), dan E-Wallet.

### Alur Pembayaran

```
1. Backend panggil TripayService::createPayment()
   → Tripay mengembalikan checkout_url, instruksi, dan reference
2. User melakukan pembayaran di halaman Tripay
3. Tripay kirim callback ke POST /api/webhooks/tripay
4. Backend validasi signature → update status transaksi
```

### Validasi Callback (Security)

Callback Tripay diamankan dengan signature HMAC SHA256.

- **Header yang diterima:** `X-Callback-Signature`
- **Cara validasi:** `hash_hmac('sha256', $raw_json_body, $private_key)`
- **Penting:** Gunakan **raw JSON body** (bukan parsed array) sebagai payload HMAC

### Pemetaan Status

| Status Tripay | Status Transaksi | Tindakan                             |
| ------------- | ---------------- | ------------------------------------ |
| `PAID`        | → `processing`   | Dispatch job `ProcessDigiflazzOrder` |
| `EXPIRED`     | → `expired`      | Batalkan transaksi                   |
| `FAILED`      | → `failed`       | Tandai sebagai gagal                 |

### Biaya Admin Tripay

Biaya gateway Tripay **tidak dihitung di awal** oleh backend. Alurnya:

1. Backend kirim `amount = product_price` ke Tripay (tanpa biaya awal)
2. Tripay mengembalikan `total_fee` (biaya aktual)
3. Backend update `transactions.admin_fee = total_fee` dan `total_price = product_price + total_fee`

Ini memastikan biaya admin yang tersimpan di database selalu akurat sesuai respons Tripay.

---

## ⚡ Digiflazz (Penyedia Produk)

Digiflazz menyediakan produk digital (Diamond, Pulsa, Kuota, Token Listrik, dll.).

### Sinkronisasi Produk

```bash
# Jalankan manual atau via scheduler
php artisan digiflazz:sync-products
```

Perintah ini:

1. Mengambil daftar produk aktif dari Digiflazz API
2. Menghitung harga jual: `harga_jual = base_price + (base_price × margin%)`
3. Update/insert ke tabel `product_items`

### Alur Pemesanan

1. Pembayaran dikonfirmasi (status `PAID` dari Tripay)
2. Job `ProcessDigiflazzOrder` didispatch ke antrian Redis
3. Queue Worker memanggil API Digiflazz dengan `digiflazz_code`
4. Digiflazz memproses pesanan dan mengirimkan callback dengan Serial Number (SN)
5. Backend update status transaksi → notifikasi ke user

### Konfigurasi (`.env`)

```
DIGIFLAZZ_USERNAME=username_anda
DIGIFLAZZ_API_KEY=api_key_anda
DIGIFLAZZ_WEBHOOK_SECRET=secret_untuk_validasi_callback
```

---

## 📧 Social Login (OAuth2)

Integrasi dengan Google dan Facebook menggunakan **Laravel Socialite**.

### Alur

1. Redirect via: `GET /api/auth/social/{provider}/redirect` (`google` atau `facebook`)
2. Setelah user memberi izin, callback diterima di: `GET /api/auth/social/{provider}/callback`
3. Backend:
   - Jika email sudah terdaftar → tautkan akun sosial dan login
   - Jika belum ada → buat akun baru otomatis (customer_type: retail)
4. Token Sanctum dikembalikan → frontend simpan dan gunakan untuk request berikutnya

### Konfigurasi (`.env`)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=${APP_URL}/api/auth/social/google/callback

FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
FACEBOOK_REDIRECT_URI=${APP_URL}/api/auth/social/facebook/callback
```
