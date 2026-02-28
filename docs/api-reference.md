# Referensi API

## 🔐 Autentikasi

**Path Dasar:** `/api/auth`  
[**→ Payload Permintaan/Respon**](api/auth.md)

| Metode | Endpoint                      | Deskripsi                                   |
| ------ | ----------------------------- | ------------------------------------------- |
| POST   | `/register`                   | Daftar pengguna baru (tipe default: retail) |
| POST   | `/login`                      | Login (mengembalikan token Sanctum)         |
| POST   | `/logout`                     | Cabut token saat ini                        |
| GET    | `/profile`                    | Ambil data profil pengguna                  |
| POST   | `/forgot-password`            | Minta link reset password via email         |
| POST   | `/reset-password`             | Reset password dengan token dari email      |
| GET    | `/social/{provider}/redirect` | OAuth2 redirect (google, facebook)          |
| GET    | `/social/{provider}/callback` | OAuth2 callback handler                     |

---

## 🛍️ Produk & Publik

**Path Dasar:** `/api/products`  
[**→ Payload Permintaan/Respon**](api/products.md)

| Metode | Endpoint       | Deskripsi                                      |
| ------ | -------------- | ---------------------------------------------- |
| GET    | `/`            | Daftar produk (filter: category, search, sort) |
| GET    | `/categories`  | Daftar semua kategori                          |
| GET    | `/{id}`        | Detail produk beserta varian harga             |
| GET    | `/slug/{slug}` | Detail produk berdasarkan slug                 |

> [!NOTE]
> Field `price` pada setiap item varian bersifat **dinamis** berdasarkan autentikasi.
> Jika request disertai Bearer token dan user bertipe `reseller`, maka `price` akan berisi `reseller_price`.
> Jika request tanpa token (guest), `price` akan berisi `retail_price`.

---

## 🛒 Transaksi Publik (Guest)

**Path Dasar:** `/api/transactions`

| Metode | Endpoint            | Deskripsi                             |
| ------ | ------------------- | ------------------------------------- |
| POST   | `/purchase`         | Checkout tanpa login (harga retail)   |
| GET    | `/status/{code}`    | Cek status pesanan berdasarkan kode   |
| GET    | `/payment-channels` | Daftar metode pembayaran Tripay       |
| POST   | `/{code}/cancel`    | Batalkan transaksi yang masih pending |

> [!IMPORTANT]
> Endpoint `/transactions/purchase` selalu menggunakan **harga retail**, meskipun request disertai Bearer token. Endpoint ini tidak menggunakan middleware `auth:sanctum`.
> Untuk pengguna yang sudah login sebagai reseller, gunakan endpoint `/customer/transactions/purchase` agar mendapatkan harga reseller yang tepat.

---

## 👤 Customer (Terautentikasi)

**Path Dasar:** `/api/customer`  
**Header Wajib:** `Authorization: Bearer {token}`  
[**→ Payload Permintaan/Respon**](api/customer.md)

| Metode | Endpoint                         | Deskripsi                                   |
| ------ | -------------------------------- | ------------------------------------------- |
| POST   | `/transactions/purchase`         | **Checkout utama** (harga sesuai tipe akun) |
| POST   | `/transactions/balance-purchase` | Bayar menggunakan saldo dompet              |
| POST   | `/transactions/topup`            | Isi ulang (top up) saldo                    |
| GET    | `/transactions`                  | Riwayat pesanan dengan filter               |
| GET    | `/transactions/{code}`           | Detail pesanan berdasarkan kode             |
| GET    | `/balance`                       | Saldo saat ini                              |
| GET    | `/balance/mutations`             | Riwayat mutasi saldo                        |
| GET    | `/withdrawals`                   | Riwayat penarikan saldo (reseller)          |
| GET    | `/notifications`                 | Notifikasi belum dibaca                     |
| GET    | `/notifications/count`           | Jumlah notifikasi belum dibaca              |
| POST   | `/notifications/read/{id}`       | Tandai notifikasi sebagai dibaca            |
| POST   | `/notifications/read-all`        | Tandai semua notifikasi sebagai dibaca      |
| GET    | `/profile`                       | Ambil profil lengkap                        |
| PUT    | `/profile`                       | Update profil                               |
| POST   | `/profile/change-password`       | Ganti password                              |
| POST   | `/devices/register`              | Daftarkan device untuk push notification    |
| DELETE | `/devices/{device_id}`           | Hapus device (saat logout)                  |

---

## 🛡️ Admin (Terbatas)

**Path Dasar:** `/api/admin`  
**Header Wajib:** `Authorization: Bearer {token}` (role: admin)  
[**→ Payload Permintaan/Respon**](api/admin.md)

| Metode   | Endpoint                       | Deskripsi                       |
| -------- | ------------------------------ | ------------------------------- |
| GET      | `/dashboard`                   | Statistik penjualan & pengguna  |
| GET/POST | `/products`                    | Kelola produk & sync Digiflazz  |
| POST     | `/products/bulk-update-prices` | Update harga massal             |
| GET/PUT  | `/transactions`                | Kelola pesanan & update status  |
| GET/POST | `/users`                       | Kelola user & sesuaian saldo    |
| GET/PUT  | `/settings`                    | Konfigurasi sistem              |
| POST     | `/settings/bulk-update`        | Update banyak setting sekaligus |
| GET      | `/reports/sales`               | Laporan keuangan                |
| GET      | `/reports/export/transactions` | Ekspor CSV                      |
| GET/PUT  | `/vouchers`                    | Kelola voucher diskon           |
| GET/PUT  | `/withdrawals`                 | Kelola penarikan saldo reseller |
| GET/POST | `/banners`                     | Kelola banner & konten visual   |
| POST     | `/banners/update-order`        | Atur urutan tampilan banner     |

---

## 🔧 Utility

| Metode | Endpoint                   | Deskripsi                                              |
| ------ | -------------------------- | ------------------------------------------------------ |
| GET    | `/utility/lookup-provider` | Deteksi provider (operator) dari nomor HP (deprecated) |
| GET    | `/app-config`              | Konfigurasi aplikasi: versi, fitur, maintenance        |
| GET    | `/banners`                 | Daftar banner aktif (publik)                           |
| POST   | `/webhooks/tripay`         | Callback webhook dari Tripay (internal)                |

> [!NOTE]
> `lookup-provider` saat ini tidak lagi dipakai di Flutter App karena deteksi provider sudah dilakukan secara lokal menggunakan `PhoneHelper` tanpa perlu API call.
