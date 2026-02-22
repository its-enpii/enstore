# Referensi API

## 🔐 Autentikasi

**Path Dasar:** `/api/auth`  
[**→ Payload Permintaan/Respon**](api/auth.md)

| Metode | Endpoint           | Deskripsi                   |
| ------ | ------------------ | --------------------------- |
| POST   | `/register`        | Daftar pengguna baru        |
| POST   | `/login`           | Login (mengembalikan token) |
| POST   | `/logout`          | Cabut token saat ini        |
| GET    | `/profile`         | Ambil data profil pengguna  |
| POST   | `/forgot-password` | Minta link reset password   |

---

## 🛍️ API Publik & Produk

**Path Dasar:** `/api/products`  
[**→ Payload Permintaan/Respon**](api/products.md)

| Metode | Endpoint                      | Deskripsi                    |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/`                           | Daftar produk (cari/filter)  |
| GET    | `/{id}`                       | Detail produk (term. varian) |
| GET    | `/categories`                 | Daftar semua kategori        |
| POST   | `/transactions/purchase`      | Checkout Guest (tanpa login) |
| GET    | `/transactions/status/{code}` | Cek status pesanan           |

---

## 👤 API Customer (Terautentikasi)

**Path Dasar:** `/api/customer`  
[**→ Payload Permintaan/Respon**](api/customer.md)

| Metode | Endpoint                         | Deskripsi                |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/transactions`                  | Riwayat pesanan          |
| POST   | `/transactions/purchase-balance` | Bayar menggunakan saldo  |
| POST   | `/transactions/topup`            | Isi ulang (top up) saldo |
| GET    | `/balance`                       | Saldo saat ini & mutasi  |
| GET    | `/notifications`                 | Notifikasi belum dibaca  |

---

## 🛡️ API Admin (Terbatas)

**Path Dasar:** `/api/admin`  
[**→ Payload Permintaan/Respon**](api/admin.md)

| Metode   | Endpoint         | Deskripsi                       |
| -------- | ---------------- | ------------------------------- |
| GET      | `/dashboard`     | Statistik Penjualan & Pengguna  |
| GET/POST | `/products`      | Kelola produk & sync Digiflazz  |
| GET/PUT  | `/transactions`  | Kelola pesanan & update status  |
| GET/POST | `/users`         | Kelola user & penyesuaian saldo |
| GET/PUT  | `/settings`      | Konfigurasi sistem              |
| GET      | `/reports/sales` | Buat laporan keuangan           |
| GET/PUT  | `/vouchers`      | Kelola voucher diskon           |
| GET/PUT  | `/withdrawals`   | Kelola penarikan saldo reseller |
| GET/POST | `/banners`       | Kelola banner & konten visual   |

---

## 📱 Integrasi Mobile/Flutter

Aplikasi mobile menggunakan `dio` untuk terhubung ke endpoint ini.

- **Base URL Emulator:** `http://10.0.2.2:8000/api`
- **Base URL Web/Fisik:** `http://ip-anda:8000/api`

Lihat kode layanan Flutter internal untuk detail implementasi `Dio`.
