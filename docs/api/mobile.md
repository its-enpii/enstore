# Integrasi Mobile Enstore

Dokumen ini menjelaskan endpoint khusus yang diperlukan untuk pengembangan aplikasi mobile (Flutter).

## 1. Konfigurasi Aplikasi (Public)

Endpoint ini digunakan saat aplikasi pertama kali dibuka (splash screen) untuk mengecek status sistem dan versi.

**Endpoint:** `GET /api/app-config`

### Respon Sukses (200):

```json
{
  "success": true,
  "data": {
    "app_name": "Enstore",
    "version": {
      "latest": "1.0.0",
      "min_required": "1.0.0"
    },
    "features": {
      "topup_balance": true,
      "guest_checkout": true
    },
    "maintenance": {
      "active": false,
      "message": "..."
    },
    "links": {
      "whatsapp_support": "..."
    }
  }
}
```

---

## 2. Registrasi Device (Push Notification)

Digunakan untuk mendaftarkan token FCM ke sistem agar user bisa menerima notifikasi di HP.

**Endpoint:** `POST /api/customer/devices/register`
**Header:** `Authorization: Bearer {token}`

### Body Permintaan:

```json
{
  "device_id": "unique-uuid-per-hp",
  "fcm_token": "token-dari-firebase-messaging",
  "device_name": "Samsung S21",
  "platform": "android"
}
```

_Platform yang didukung: `android`, `ios`, `web`, `other`_

---

## 3. Menghapus Device (Logout)

Disarankan untuk memanggil endpoint ini saat user logout agar tidak menerima notifikasi di device tersebut jika orang lain login menggunakan device yang sama.

**Endpoint:** `DELETE /api/customer/devices/{device_id}`
**Header:** `Authorization: Bearer {token}`

### 3. Utility - Lookup Provider

Mendeteksi nama provider (operator) berdasarkan prefix nomor telepon (HLR). Berguna untuk otomatisasi pilihan produk pulsa/kuota.

- **Endpoint**: `/api/utility/lookup-provider`
- **Method**: `GET`
- **Query Params**:
  - `phone`: Nomor telepon (misal: `085812345678`)

**Response Sukses**:

```json
{
  "success": true,
  "message": "Provider ditemukan",
  "data": {
    "phone": "085812345678",
    "prefix": "0858",
    "provider_name": "Indosat",
    "provider_code": "indosat"
  }
}
```

---

## Tip Pengembangan Flutter:

1. **Base URL:** Gunakan IP lokal mesin dev Anda jika menjalankan via emulator, contoh: `http://10.0.2.2:8000/api`.
2. **Auth:** Mobile menggunakan Laravel Sanctum. Simpan token di `SecureStorage` setelah login berhasil.
3. **Notifikasi:** Gunakan paket `firebase_messaging`. Panggil API register device setiap kali token FCM di-_refresh_ oleh Firebase.
