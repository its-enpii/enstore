# Cara Menentukan Prepaid vs Postpaid

## 📋 Overview

Sistem otomatis mendeteksi apakah suatu produk adalah **Prepaid** atau **Postpaid** berdasarkan data dari Digiflazz API saat sync produk.

---

## 🔍 **Metode Deteksi**

### **1. Otomatis via Sync Command**

Ketika menjalankan `php artisan digiflazz:sync-products`, sistem akan otomatis mendeteksi `payment_type` berdasarkan:

#### **A. Field `type` dari Digiflazz**
```json
{
  "buyer_sku_code": "pln",
  "product_name": "PLN Pascabayar",
  "type": "Pascabayar",  // ← Jika mengandung "pasca" = postpaid
  ...
}
```

#### **B. Product Name**
```json
{
  "product_name": "PLN Pascabayar",  // ← Mengandung "pascabayar" = postpaid
  ...
}
```

#### **C. Category Name**
```json
{
  "category": "PDAM",  // ← Category PDAM = postpaid
  ...
}
```

---

## 🎯 **Kategori Postpaid**

Produk akan otomatis di-set sebagai **postpaid** jika category atau product name mengandung:

```php
$postpaidCategories = [
    'pln pascabayar',
    'pdam',
    'telkom',
    'speedy',
    'indihome',
    'tv kabel',
    'internet',
    'multifinance',
    'bpjs',
];
```

### **Contoh Produk Postpaid:**
- ✅ PLN Pascabayar
- ✅ PDAM (semua wilayah)
- ✅ Telkom/Indihome
- ✅ TV Kabel (Transvision, Indovision, dll)
- ✅ Internet (Speedy, dll)
- ✅ Multifinance (Leasing)
- ✅ BPJS Kesehatan

---

## 💳 **Kategori Prepaid**

Semua produk lainnya adalah **prepaid** (default):

### **Contoh Produk Prepaid:**
- ✅ Mobile Legends
- ✅ Free Fire
- ✅ PUBG Mobile
- ✅ Pulsa (Telkomsel, Indosat, XL, dll)
- ✅ Paket Data
- ✅ E-Wallet (GoPay, OVO, DANA, dll)
- ✅ PLN Token (Prepaid)
- ✅ Voucher Game (Steam, Google Play, dll)

---

## 🔧 **Logic Detection di Code**

### **File: `app/Console/Commands/SyncDigiflazzProducts.php`**

```php
private function detectPaymentType($product)
{
    $category = strtolower($product['category']);
    $productName = strtolower($product['product_name']);
    $type = strtolower($product['type'] ?? '');

    // 1. Check field 'type' dari Digiflazz
    if (str_contains($type, 'pasca') || str_contains($productName, 'pascabayar')) {
        return 'postpaid';
    }

    // 2. Check category
    $postpaidCategories = [
        'pln pascabayar',
        'pdam',
        'telkom',
        'speedy',
        'indihome',
        'tv kabel',
        'internet',
        'multifinance',
        'bpjs',
    ];

    foreach ($postpaidCategories as $postpaidCat) {
        if (str_contains($category, $postpaidCat) || 
            str_contains($productName, $postpaidCat)) {
            return 'postpaid';
        }
    }

    // 3. Default = prepaid
    return 'prepaid';
}
```

---

## 📊 **Contoh Data dari Digiflazz**

### **Prepaid Product:**
```json
{
  "buyer_sku_code": "ml100",
  "product_name": "Mobile Legends 100 Diamond",
  "category": "Games",
  "brand": "MOONTON",
  "type": "Umum",
  "price": 25000,
  "buyer_product_status": true,
  "seller_product_status": true
}
```
**Result:** `payment_type = 'prepaid'`

---

### **Postpaid Product:**
```json
{
  "buyer_sku_code": "pln",
  "product_name": "PLN Pascabayar",
  "category": "PLN",
  "brand": "PLN",
  "type": "Pascabayar",
  "price": 0,
  "buyer_product_status": true,
  "seller_product_status": true
}
```
**Result:** `payment_type = 'postpaid'`

---

## 🛠️ **Manual Override**

Jika ada produk yang salah terdeteksi, Anda bisa manual update di database:

### **Via Tinker:**
```bash
php artisan tinker
```

```php
// Update single product
$product = Product::where('digiflazz_code', 'pln')->first();
$product->payment_type = 'postpaid';
$product->save();

// Update multiple products by category
Product::where('category_id', $categoryId)
    ->update(['payment_type' => 'postpaid']);

// Update by brand
Product::where('brand', 'PDAM')
    ->update(['payment_type' => 'postpaid']);
```

### **Via SQL:**
```sql
-- Update specific product
UPDATE products 
SET payment_type = 'postpaid' 
WHERE digiflazz_code = 'pln';

-- Update by category
UPDATE products 
SET payment_type = 'postpaid' 
WHERE category_id IN (
    SELECT id FROM product_categories 
    WHERE name LIKE '%PDAM%'
);
```

---

## 📝 **Cara Cek Payment Type**

### **1. Via Database:**
```sql
-- Lihat semua produk postpaid
SELECT id, name, brand, payment_type 
FROM products 
WHERE payment_type = 'postpaid';

-- Count prepaid vs postpaid
SELECT payment_type, COUNT(*) as total 
FROM products 
GROUP BY payment_type;
```

### **2. Via Tinker:**
```php
// Get all postpaid products
Product::postpaid()->get();

// Get all prepaid products
Product::prepaid()->get();

// Count
Product::postpaid()->count();
Product::prepaid()->count();
```

### **3. Via API:**
```bash
# Get postpaid products
GET /api/customer/products?payment_type=postpaid

# Get prepaid products
GET /api/customer/products?payment_type=prepaid
```

---

## ✅ **Checklist Setelah Sync**

Setelah run `php artisan digiflazz:sync-products`, cek:

1. **Cek jumlah produk:**
```bash
php artisan tinker
```
```php
Product::prepaid()->count();  // Harus banyak (game, pulsa, dll)
Product::postpaid()->count(); // Lebih sedikit (PLN, PDAM, dll)
```

2. **Cek produk postpaid:**
```php
Product::postpaid()->get(['name', 'brand', 'payment_type']);
```

3. **Cek jika ada yang salah:**
```php
// Produk yang seharusnya postpaid tapi prepaid
Product::where('name', 'LIKE', '%PDAM%')
    ->where('payment_type', 'prepaid')
    ->get();
```

---

## 🎯 **Summary**

**Otomatis Detection:**
- ✅ Saat sync via `digiflazz:sync-products`
- ✅ Berdasarkan `type`, `category`, dan `product_name`
- ✅ Default = prepaid

**Postpaid Keywords:**
- `pascabayar`, `pdam`, `telkom`, `indihome`, `tv kabel`, `bpjs`, dll

**Manual Override:**
- Via Tinker atau SQL jika ada yang salah

**Verification:**
- Cek via database query atau Tinker
- Pastikan produk PPOB (PLN, PDAM, dll) = postpaid
- Pastikan game, pulsa, voucher = prepaid

Apakah sudah jelas? 🤔
