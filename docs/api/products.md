# Spesifikasi API Publik & Produk

## 1. Daftar Produk & Filter

**Endpoint:** `GET /api/products`

### Query Parameters (Opsional):

| Parameter    | Tipe   | Contoh      | Keterangan                                             |
| ------------ | ------ | ----------- | ------------------------------------------------------ |
| `search`     | string | `"legends"` | Pencarian berdasarkan nama produk                      |
| `category`   | string | `"games"`   | Filter berdasarkan slug atau nama kategori             |
| `brand`      | string | `"XL"`      | Filter berdasarkan brand/operator                      |
| `sort_by`    | string | `"name"`    | Kolom pengurutan: `created_at`, `name`, `sort_order`   |
| `sort_order` | string | `"asc"`     | Arah urutan: `asc` atau `desc`                         |
| `page`       | int    | `2`         | Nomor halaman untuk paginasi (default: 20 per halaman) |

### Respon Sukses (200):

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Mobile Legends",
        "slug": "mobile-legends",
        "brand": "Moonton",
        "image": "path/to/image.jpg",
        "category": { "id": 1, "name": "Games", "slug": "games" }
      }
    ],
    "last_page": 5,
    "total": 50
  }
}
```

---

## 2. Detail Produk Berdasarkan ID

**Endpoint:** `GET /api/products/{id}`

Mengembalikan detail produk beserta seluruh item/varian aktif dan field input dinamis.

### Respon Sukses (200):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mobile Legends",
    "slug": "mobile-legends",
    "brand": "Moonton",
    "description": "Topup Diamond MLBB",
    "input_fields": [
      { "key": "user_id", "label": "User ID", "type": "text" },
      { "key": "zone_id", "label": "Zone ID", "type": "text" }
    ],
    "items": [
      {
        "id": 101,
        "name": "5 Diamonds",
        "price": 1500,
        "retail_price": 1500,
        "reseller_price": 1300,
        "stock_status": "available",
        "is_active": true
      }
    ]
  }
}
```

> [!IMPORTANT]
> **Field `price` bersifat dinamis!** Dibuat oleh accessor `getPriceAttribute()` di model `ProductItem`.
>
> - Request dengan Bearer token **reseller** → `price = reseller_price`
> - Request tanpa token (guest) atau token **retail** → `price = retail_price`
>
> Ini bekerja karena Laravel Sanctum tetap me-resolve user dari header `Authorization` meskipun route tidak dilindungi middleware `auth:sanctum`.

---

## 3. Detail Produk Berdasarkan Slug

**Endpoint:** `GET /api/products/slug/{slug}`

Fungsional identik dengan `GET /api/products/{id}`, hanya identifier yang berbeda.  
Digunakan oleh Next.js frontend dan Flutter App untuk mendapatkan detail produk dari URL yang ramah SEO.

---

## 4. Daftar Kategori Produk

**Endpoint:** `GET /api/products/categories`

Mengambil semua kategori aktif beserta sub-kategori untuk ditampilkan di menu/filter.

### Respon Sukses (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Games",
      "slug": "games",
      "image": "path/to/icon.png"
    },
    {
      "id": 2,
      "name": "Pulsa & Data",
      "slug": "pulsa"
    }
  ]
}
```

---

## 5. Checkout Guest (Pembelian Tanpa Login)

**Endpoint:** `POST /api/transactions/purchase`

Dapat diakses tanpa autentikasi. Harga yang digunakan selalu `retail_price`.

> [!WARNING]
> Endpoint ini **tidak membaca Bearer token** untuk menentukan harga. Meskipun request disertai token reseller, harga yang digunakan tetap `retail_price`. Untuk mendapatkan harga sesuai tipe akun, gunakan `/api/customer/transactions/purchase`.

### Body Permintaan:

```json
{
  "product_item_id": 101,
  "payment_method": "QRIS",
  "customer_data": {
    "user_id": "12345678",
    "zone_id": "1234"
  },
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "081234567890"
}
```

### Respon Sukses (201):

```json
{
  "success": true,
  "data": {
    "transaction": {
      "transaction_code": "TRX-12345ABC",
      "product_price": 1500,
      "admin_fee": 800,
      "total_price": 2300
    },
    "payment": {
      "payment_url": "https://tripay.co.id/...",
      "qr_url": null,
      "payment_code": "1234567890",
      "instructions": [{ "title": "Transfer via ATM", "steps": ["..."] }]
    }
  }
}
```

---

## 6. Cek Status Pesanan

**Endpoint:** `GET /api/transactions/status/{code}`

Dapat diakses tanpa login. Gunakan ini untuk polling status pembayaran di halaman payment.

### Respon Sukses (200):

```json
{
  "success": true,
  "data": {
    "transaction_code": "TRX-12345ABC",
    "status": "success",
    "payment_status": "paid",
    "product_name": "Mobile Legends - 5 Diamonds",
    "total_price": 2300,
    "serial_number": "SN123456",
    "paid_at": "2025-01-01T10:00:00.000000Z"
  }
}
```

---

## 7. Metode Pembayaran

**Endpoint:** `GET /api/transactions/payment-channels`

Mengambil daftar channel pembayaran aktif dari Tripay.

### Respon Sukses (200):

```json
{
  "success": true,
  "data": [
    {
      "code": "QRIS",
      "name": "QRIS",
      "group": "Dompet Digital",
      "fee_flat": 0,
      "fee_percent": 0.7,
      "total_fee": 105
    }
  ]
}
```
