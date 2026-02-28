# Integrasi Mobile Flutter (Enstore)

Dokumen ini menjelaskan cara kerja aplikasi Flutter Enstore dalam berkomunikasi dengan backend Laravel.

---

## Konfigurasi Dasar

| Kondisi            | Base URL                              |
| ------------------ | ------------------------------------- |
| Android Emulator   | `http://10.0.2.2:8000/api`            |
| Device Fisik / LAN | `http://{ip-lokal}:8000/api`          |
| Production         | Diset via `--dart-define=API_URL=...` |

Konfigurasi URL diatur melalui `dart-define` saat build, dan dibaca di `ApiEndpoints.baseUrl`.

---

## Autentikasi

Aplikasi menggunakan **Laravel Sanctum (Bearer Token)**.

1. Token diperoleh dari respons login (`POST /api/auth/login`)
2. Token disimpan di `SharedPreferences` dengan key `auth_token`
3. `ApiClient` secara **otomatis** menambahkan header `Authorization: Bearer {token}` pada **setiap request** jika token tersedia

> [!IMPORTANT]
> Karena `ApiClient` selalu menempelkan token, beberapa endpoint **publik** pun bisa menerima token dan merespons secara berbeda:
>
> - `GET /api/products/slug/{slug}` → jika token valid, `price` di setiap item akan berisi harga sesuai tipe akun (retail/reseller)
> - `POST /api/transactions/purchase` → **tidak terpengaruh oleh token**, selalu menggunakan harga retail

---

## Alur Checkout (Sangat Penting!)

Ini adalah bagian yang paling kritis dan penyebab utama bug harga jika salah implementasi.

### Guest (Tidak Login)

```
PulsaScreen / GameDetailScreen
  → CheckoutScreen (widget.item.price = retail_price)
  → _startTransaction() → transactionService.guestPurchase()
  → POST /api/transactions/purchase (publik, retail_price)
  → PaymentScreen
```

### Customer / Reseller (Sudah Login)

```
PulsaScreen / GameDetailScreen
  → CheckoutScreen (widget.item.price = reseller_price, karena ApiClient kirim token)
  → _startTransaction() → cek AuthService.isLoggedIn()
      → jika login: transactionService.customerPurchase()
          → POST /api/customer/transactions/purchase (authenticated, reseller_price) ✅
      → jika tidak login: transactionService.guestPurchase()
          → POST /api/transactions/purchase (publik, retail_price) ✅
```

> [!WARNING]
> **Jangan pernah hardcode `guestPurchase()`** untuk semua kondisi.
> Ini menyebabkan harga yang ditampilkan di "Konfirmasi Pesanan" (menggunakan `widget.item.price` yang sudah benar sesuai tipe akun) **tidak sama** dengan harga yang diproses backend (yang selalu menggunakan retail).
>
> Akibatnya: user reseller melihat total Rp 11.323 di dialog, tapi Tripay memproses Rp 12.331.

---

## Struktur Layanan Utama

| File                                     | Fungsi                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| `core/network/api_client.dart`           | HTTP client (Dio), attach token otomatis                       |
| `core/services/auth_service.dart`        | Login, logout, cek status auth (`isLoggedIn()`)                |
| `core/services/transaction_service.dart` | `guestPurchase`, `customerPurchase`, `customerBalancePurchase` |
| `core/constants/api_endpoints.dart`      | Semua URL endpoint terpusat                                    |
| `core/models/product_item.dart`          | Model item produk, field `price` adalah harga yang sesuai akun |

---

## Konfigurasi Aplikasi (Splash Screen)

**Endpoint:** `GET /api/app-config`  
Digunakan saat pertama kali dibuka untuk mengecek status maintenance dan versi minimum.

### Respon:

```json
{
  "success": true,
  "data": {
    "app_name": "Enstore",
    "version": { "latest": "1.0.0", "min_required": "1.0.0" },
    "features": { "topup_balance": true, "guest_checkout": true },
    "maintenance": { "active": false, "message": "" }
  }
}
```

---

## Registrasi Device (Push Notification)

**Endpoint:** `POST /api/customer/devices/register`  
**Header:** `Authorization: Bearer {token}`

### Body:

```json
{
  "device_id": "unique-uuid-per-hp",
  "fcm_token": "token-dari-firebase-messaging",
  "device_name": "Samsung S21",
  "platform": "android"
}
```

Platform yang didukung: `android`, `ios`, `web`, `other`

**Hapus Device (saat logout):** `DELETE /api/customer/devices/{device_id}`  
Panggil ini saat user logout agar tidak menerima notifikasi di device yang ditinggalkan.

---

## Deteksi Provider Lokal

Deteksi operator (XL, Telkomsel, Indosat, dll.) dari nomor telepon **tidak lagi menggunakan API**.  
Dilakukan secara lokal via `PhoneHelper` menggunakan pemetaan prefix nomor HP.  
Ini memastikan deteksi provider berjalan **instan** tanpa delay network.
