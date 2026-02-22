# Spesifikasi API Publik & Produk

## 1. Daftar Produk & Filter

**Endpoint:** `GET /api/products`

### Query Parameters (Opsional):
- `search`: Kata kunci pencarian nama produk (string)
- `category`: Filter berdasarkan nama/slug kategori (contoh: "games", "pulsa")
- `sort_by`: Kolom pengurutan (contoh: "created_at", "name", "sort_order", "rating")
- `sort_order`: Arah pengurutan ("asc" atau "desc")
- `page`: Nomor halaman untuk paginasi

### ResponSukses:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Mobile Legends",
        "publisher": "Moonton",
        "image": "path/image.jpg",
        "category": {
           "id": 1,
           "name": "Games"
        }
      }
    ],
    "last_page": 5,
    "total": 50
  }
}
```

---

## 2. Detail Produk & Item Varian

**Endpoint:** `GET /api/products/{id}`

- Mengembalikan rincian lengkap sebuah produk beserta daftar item (varian denom) pendukung layanannya.

### ResponSukses:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mobile Legends",
    "description": "Topup Diamond MLBB",
    "items": [
      {
        "id": 101,
        "name": "5 Diamonds",
        "price": 1500,
        "is_active": true
      },
      {
        "id": 102,
        "name": "10 Diamonds",
        "price": 2800,
        "is_active": true
      }
    ]
  }
}
```

---

## 3. Daftar Kategori Produk

**Endpoint:** `GET /api/products/categories`

- Mengambil semua kategori induk untuk ditampilkan di filter sisi pengguna, misal: Games, PPOB, E-Money, dll.

---

## 4. Checkout Guest (Pembelian Tanpa Login)

**Endpoint:** `POST /api/products/transactions/purchase`

API ini serupa dengan purchase milik customer, namun dapat diakses oleh siapa saja (publik) dan membutuhkan parameter kontak.

### Body Permintaan:
```json
{
  "product_item_id": 101,
  "payment_method": "QRISC",
  "customer_data": {
    "user_id": "12345678",
    "zone_id": "1234"
  },
  "customer_contact": "08123456789" // Nomor WhatsApp / Email pembeli
}
```

### ResponSukses:
```json
{
    "success": true,
    "data": {
        "transaction": { 
             "transaction_code": "TRX-12345ABC", 
             "total_price": 1500 
        },
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

## 5. Cek Status Pesanan Guest

**Endpoint:** `GET /api/products/transactions/status/{code}`

- Memeriksa detail dan status suatu pesanan/transaksi. Karena publik, tidak perlu mengirim otorisasi token pengguna.

### ResponSukses:
```json
{
  "success": true,
  "data": {
    "transaction_code": "TRX-12345ABC",
    "status": "PAID",
    "total_price": 1500,
    "product_item": {
       "name": "5 Diamonds"
    }
  }
}
```
