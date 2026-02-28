# Fitur & Alur Khusus

## 💰 Sistem Harga Bertingkat (Pricing Tier)

Sistem mendukung dua tier harga untuk produk yang sama:

| Tier         | Siapa              | Field Sumber     | Keterangan                               |
| ------------ | ------------------ | ---------------- | ---------------------------------------- |
| **Retail**   | Guest / User biasa | `retail_price`   | Harga standar dengan margin penuh        |
| **Reseller** | User reseller      | `reseller_price` | Harga lebih murah untuk pembelian volume |

### Bagaimana Harga Disampaikan ke Client

Model `ProductItem` menggunakan accessor `getPriceAttribute()` yang menambahkan field `price` secara **dinamis** pada setiap respons JSON:

```php
// app/Models/ProductItem.php
public function getPriceAttribute()
{
    $customerType = auth()->check() ? auth()->user()->customer_type : 'retail';
    return $this->getPriceForCustomer($customerType);
}
```

Dengan demikian:

- Jika request dikirim dengan Bearer token reseller → `price = reseller_price`
- Jika request dikirim tanpa token (guest) → `price = retail_price`
- **Admin dapat mengoverride** harga item tertentu secara manual tanpa mengikuti rumus margin global

> [!WARNING]
> Endpoint publik `/api/transactions/purchase` **tidak membaca token** untuk menentukan harga transaksi. Endpoint ini selalu menggunakan `retail_price`. Endpoint yang membaca token untuk harga adalah `/api/customer/transactions/purchase`.

---

## 🛒 Alur Checkout Guest

Pengguna dapat membeli tanpa akun penuh.

1. Pilih produk → isi detail target (User ID, Nomor HP, dll.)
2. Pilih metode pembayaran
3. Konfirmasi → API `POST /api/transactions/purchase` dipanggil
4. Tripay membuat tagihan → User diarahkan ke halaman/URL pembayaran
5. Setelah bayar → Callback Tripay masuk → Proses pesanan ke Digiflazz

---

## 👥 Alur Checkout Customer Login

Alur ini berlaku untuk user yang sudah login, baik retail maupun reseller.

1. Pilih produk → `price` yang ditampilkan sudah disesuaikan dengan tipe akun
2. Pilih metode pembayaran
3. Konfirmasi → API `POST /api/customer/transactions/purchase` dipanggil
   - Backend membaca `customer_type` dari token → menentukan harga yang tepat
4. Tripay membuat tagihan → User diarahkan ke halaman pembayaran
5. Setelah bayar → Callback Tripay → Proses ke Digiflazz → Notifikasi ke user

> [!IMPORTANT]
> Untuk aplikasi Flutter: `checkout_screen.dart` harus mengecek `AuthService.isLoggedIn()` dan memanggil `customerPurchase()` jika user login. Jangan hardcode `guestPurchase()` untuk semua kondisi — ini akan menyebabkan harga yang ditampilkan berbeda dengan yang diproses backend.

---

## 💳 Bayar via Saldo Dompet

Khusus untuk user reseller yang punya saldo di dompet sistem.

1. Pilih produk → Konfirmasi
2. API `POST /api/customer/transactions/balance-purchase` dipanggil
3. Saldo dipotong langsung (tidak redirect ke Tripay)
4. Pesanan langsung masuk ke antrian Digiflazz

---

## 💵 Sistem Refund

Diterapkan untuk pesanan Digiflazz yang gagal setelah pembayaran berhasil.

- **Pemicu**: Status pesanan `failed` DAN `payment_status = paid`
- **Mekanisme**: Dana dikembalikan ke `balance` (saldo) pengguna
- **Audit**: Tercatat di `balance_mutations` (type: credit) dan `activity_logs`

---

## 🔔 Sistem Notifikasi

Notifikasi real-time untuk update status pesanan.

| Tipe               | Keterangan                               |
| ------------------ | ---------------------------------------- |
| `payment_success`  | Pembayaran berhasil dikonfirmasi         |
| `order_completed`  | Produk berhasil dikirim (ada SN)         |
| `order_failed`     | Produk gagal dikirim, saldo dikembalikan |
| `refund_processed` | Refund berhasil ke saldo                 |
| `topup_success`    | Top up saldo berhasil                    |

Pengiriman menggunakan notifikasi database Laravel, dapat diperluas ke FCM (push notification mobile) melalui endpoint device register.

---

## 🛡️ Rate Limiting

| Kategori       | Batas               |
| -------------- | ------------------- |
| Endpoint Auth  | 5 request / menit   |
| API Umum       | 300 request / menit |
| Status Polling | 600 request / menit |
