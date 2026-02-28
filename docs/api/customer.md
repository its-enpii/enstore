# Spesifikasi API Customer

> [!IMPORTANT]
> Semua endpoint di bagian ini memerlukan header `Authorization: Bearer {token}`.  
> Token diperoleh dari respons `POST /api/auth/login` atau `POST /api/auth/register`.

---

## 1. Pembelian Produk via Payment Gateway

**Endpoint:** `POST /api/customer/transactions/purchase`

Ini adalah endpoint **utama** untuk checkout pengguna yang sudah login.
Berbeda dengan endpoint publik, endpoint ini menggunakan `customer_type` dari akun yang login untuk menentukan harga:

- User `retail` → harga = `retail_price`
- User `reseller` → harga = `reseller_price`

### Body Permintaan:

```json
{
  "product_item_id": 101,
  "payment_method": "QRIS",
  "customer_data": {
    "user_id": "12345678",
    "zone_id": "1234"
  },
  "voucher_code": "DISKON10"
}
```

### Respon Sukses (201):

```json
{
  "success": true,
  "data": {
    "transaction": {
      "transaction_code": "TRX-12345ABC",
      "customer_type": "reseller",
      "product_price": 10500,
      "admin_fee": 823,
      "discount_amount": 0,
      "total_price": 11323
    },
    "payment": {
      "payment_url": "https://tripay.co.id/...",
      "qr_url": "https://...",
      "payment_code": null,
      "instructions": [{ "title": "...", "steps": ["..."] }]
    }
  }
}
```

---

## 2. Pembelian via Saldo Dompet

**Endpoint:** `POST /api/customer/transactions/balance-purchase`

Memotong saldo dompet secara langsung. Tidak memerlukan payment gateway.  
Tidak ada biaya admin (admin_fee = 0).

### Body Permintaan:

```json
{
  "product_item_id": 101,
  "customer_data": {
    "user_id": "12345678",
    "zone_id": "1234"
  },
  "voucher_code": "OPTIONAL"
}
```

---

## 3. Top Up Saldo

**Endpoint:** `POST /api/customer/transactions/topup`

### Body Permintaan:

```json
{
  "amount": 100000,
  "payment_method": "QRIS"
}
```

---

## 4. Dompet & Mutasi Saldo

- **Cek Saldo:** `GET /api/customer/balance`  
  Respons: `{ "balance": 150000, "hold_amount": 0 }`
- **Riwayat Mutasi:** `GET /api/customer/balance/mutations`  
  Filter: `type` (credit/debit), `start_date`, `end_date`, `per_page`

---

## 5. Riwayat Transaksi

**Endpoint:** `GET /api/customer/transactions`

### Query Filter Tersedia:

| Parameter    | Nilai                                        |
| ------------ | -------------------------------------------- |
| `type`       | `purchase`, `topup`                          |
| `status`     | `pending`, `processing`, `success`, `failed` |
| `start_date` | `YYYY-MM-DD`                                 |
| `end_date`   | `YYYY-MM-DD`                                 |
| `search`     | Kode transaksi atau nama produk              |
| `per_page`   | Jumlah item per halaman (default: 20)        |

**Detail Transaksi:** `GET /api/customer/transactions/{code}`

---

## 6. Penarikan Saldo (Reseller)

**Endpoint:** `GET /api/customer/withdrawals`  
Riwayat pengajuan penarikan saldo untuk akun reseller.

---

## 7. Notifikasi

| Metode | Endpoint                   | Deskripsi                              |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/notifications`           | Daftar notifikasi (terbaru di atas)    |
| GET    | `/notifications/count`     | Jumlah notifikasi belum dibaca         |
| POST   | `/notifications/read/{id}` | Tandai satu notifikasi sebagai dibaca  |
| POST   | `/notifications/read-all`  | Tandai semua notifikasi sebagai dibaca |

---

## 8. Profil

| Metode | Endpoint                   | Deskripsi         |
| ------ | -------------------------- | ----------------- |
| GET    | `/profile`                 | Ambil data profil |
| PUT    | `/profile`                 | Update profil     |
| POST   | `/profile/change-password` | Ganti password    |

---

## 9. Pascabayar (PPOB) — Cek Tagihan

**Endpoint:** `POST /api/customer/postpaid/inquiry`

Melakukan pengecekan tagihan ke Digiflazz. Hasilnya disimpan di cache Redis selama **30 menit** menggunakan `inquiry_ref` sebagai kunci. `inquiry_ref` hanya bisa digunakan oleh user yang sama yang membuatnya.

### Body Permintaan:

```json
{
  "product_item_id": 201,
  "customer_no": "123456789"
}
```

### Respon Sukses (200):

```json
{
  "success": true,
  "message": "Berhasil cek tagihan",
  "data": {
    "inquiry_ref": "INQ-20250101120000-1234",
    "product_name": "PLN Postpaid - 10A",
    "customer_no": "123456789",
    "customer_name": "JOHN DOE",
    "period": "DES 2024",
    "tagihan": 150000,
    "admin": 2500,
    "total": 152500
  }
}
```

> [!NOTE]
> Field `admin` sudah mencakup biaya admin Digiflazz + profit. Simpan `inquiry_ref`, karena diperlukan di step bayar.

---

## 10. Pascabayar (PPOB) — Bayar Tagihan

**Endpoint:** `POST /api/customer/postpaid/pay`

Mengambil data dari cache inquiry, membuat transaksi, dan membuat tagihan pembayaran via Tripay.

> [!WARNING]
> Cache `inquiry_ref` akan dihapus setelah berhasil. Jika gagal, user harus inquiry ulang.

### Body Permintaan:

```json
{
  "inquiry_ref": "INQ-20250101120000-1234",
  "payment_method": "QRIS"
}
```

### Respon Sukses (201):

```json
{
  "success": true,
  "message": "Transaksi berhasil dibuat",
  "data": {
    "transaction": {
      "transaction_code": "TRX-XXXXXABC",
      "product_name": "PLN Postpaid - 10A",
      "product_price": 152500,
      "admin_fee": 800,
      "total_price": 153300,
      "prepaid_postpaid_type": "postpaid"
    },
    "payment": {
      "checkout_url": "https://tripay.co.id/...",
      "qr_url": null,
      "payment_code": null,
      "status": "pending"
    }
  }
}
```
