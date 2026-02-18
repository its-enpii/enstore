# Integrasi Pihak Ketiga

## 💳 Tripay (Payment Gateway)

Tripay menangani semua pembayaran digital (QRIS, VA, E-Wallet).

### Alur Logika

1. Pengguna membuat transaksi → Aplikasi memanggil `TripayService::createPayment()`.
2. Tripay mengembalikan `checkout_url` dan instruksi pembayaran.
3. Callback diterima di `POST /api/webhooks/tripay`.
4. Aplikasi memvalidasi tanda tangan dan memperbarui status pesanan.

### 🔐 Teknis: Validasi Callback

Callback Tripay diamankan dengan tanda tangan HMAC SHA256.

- **Header:** `X-Callback-Signature`
- **Logika:** `hash_hmac('sha256', $json_payload_body, $private_key)`
- **Validasi:** Gunakan raw JSON body yang diterima dari Tripay sebagai payload untuk fungsi HMAC.

### Pemetaan Status

| Status Tripay | Status Aplikasi | Tindakan                   |
| ------------- | --------------- | -------------------------- |
| `PAID`        | `paid`          | Proses pesanan (Digiflazz) |
| `EXPIRED`     | `expired`       | Batalkan transaksi         |
| `FAILED`      | `failed`        | Tandai sebagai error       |

---

## ⚡ Digiflazz (Penyedia Produk)

Digiflazz menyediakan produk digital yang sesungguhnya (Diamond, Pulsa, UC).

### Detail Integrasi

- **Sinkronisasi**: Produk disinkronkan melalui `php artisan digiflazz:sync-products`.
- **Pemesanan**: Dipicu segera setelah pembayaran dikonfirmasi.
- **Callback**: Digiflazz memberi tahu perubahan status (misalnya, Sukses dengan SN).

### Layanan Inti

`App\Services\DigiflazzService` menangani semua komunikasi API menggunakan kredensial yang dikonfigurasi.

---

## 📧 Login Sosial (OAuth2)

Integrasi dengan Google dan Facebook menggunakan Laravel Socialite.

### Alur

1. Redirect ke `/api/auth/social/{provider}/redirect`.
2. Callback ditangani di `/api/auth/social/{provider}/callback`.
3. Akun otomatis ditautkan berdasarkan email atau akun baru dibuat.
