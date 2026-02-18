# Spesifikasi API Admin

## 1. Statistik Dashboard

**Endpoint:** `GET /api/admin/dashboard`
**Params:** `period` (today, week, month, year)

- **Mengembalikan:** Pertumbuhan pendapatan, success rate, pertumbuhan user, dan data grafik produk teratas.

---

## 2. Manajemen Produk

### Daftar Produk

**Endpoint:** `GET /api/admin/products`

- **Pencarian Lanjut:** Mencari nama, brand, kategori, varian, atau SKU.
- **Filter Dinamis:** `category.slug=...`, `type=...`, `is_active=...`.

### Update Harga Massal

**Endpoint:** `POST /api/admin/products/bulk-update-prices`
**Body:**

```json
{
  "items": [
    { "id": 101, "retail_price": 25000, "retail_profit": 2000 },
    { "id": 102, "reseller_price": 23000, "reseller_profit": 1000 }
  ]
}
```

---

## 3. Manajemen Pengguna

- **Penyesuaian Saldo:** `POST /api/admin/users/{id}/adjust-balance`
- **Body:** `type` (add/deduct), `amount`, `description`.
- **Statistik:** `GET /api/admin/users/statistics`.

---

## 4. Pembuatan Laporan

- **Penjualan:** `GET /api/admin/reports/sales?group_by=day`
- **Ekspor:** `GET /api/admin/reports/export/transactions` (Mengembalikan CSV).

---

## 5. Pengaturan Sistem

**Endpoint:** `POST /api/admin/settings/bulk-update`
**Body:**

```json
{
  "settings": [
    { "key": "app.name", "value": "Nama Baru" },
    { "key": "retail_margin", "value": "10" }
  ]
}
```
