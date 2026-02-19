# Spesifikasi API Customer

## 1. Pembelian Produk

**Endpoint:** `POST /api/customer/transactions/purchase` (Gateway Pembayaran)
**Endpoint:** `POST /api/customer/transactions/purchase-balance` (Saldo Dompet)

### Body Permintaan (Gateway):

```json
{
  "product_item_id": 123,
  "payment_method": "QRIS", // pilihan dari API payment-channels
  "customer_data": {
    "user_id": "123456789",
    "zone_id": "1234"
  }
}
```

### Respon (dengan Data Tripay):

```json
{
    "success": true,
    "data": {
        "transaction": { "transaction_code": "TRX-...", "total_price": 25000 },
        "payment": {
            "payment_url": "...",
            "qr_code_url": "...",
            "va_number": "...",
            "instructions": [ { "title": "...", "steps": [...] } ]
        }
    }
}
```

---

## 2. Dompet & Mutasi

- **Ambil Saldo:** `GET /api/customer/balance` → Mengembalikan `balance`, `hold_amount`.
- **Topup:** `POST /api/customer/transactions/topup` (Body: `amount`, `payment_method`).
- **Riwayat:** `GET /api/customer/balance/mutations` → Daftar pergerakan `credit`/`debit`.

---

## 3. Riwayat Transaksi

**Endpoint:** `GET /api/customer/transactions`

### Filter:

- `type`: purchase (pembelian), topup (isi saldo)
- `status`: pending, success, failed
- `start_date` / `end_date`: YYYY-MM-DD
- `per_page` (default 20)

---

## 4. Inkuiri Pascabayar (PPOB)

**Endpoint:** `POST /api/customer/postpaid/inquiry`

- **Body:** `product_item_id`, `customer_no`.
- **Respon:** Mengembalikan `billing_name`, `amount`, `admin_fee`, `total`.

---

## 5. Banner & Promosi

**Endpoint:** `GET /api/banners`

- **Deskripsi:** Mengambil daftar banner aktif untuk ditampilkan di carousel/slider aplikasi.
- **Respon:** Array objects berisi `title`, `subtitle` (deskripsi singkat), `image`, `link`, dan `description`.
