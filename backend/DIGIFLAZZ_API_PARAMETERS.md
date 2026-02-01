# Digiflazz API Parameters Documentation

## 📋 Overview

Dokumentasi lengkap parameter yang didukung oleh Digiflazz API untuk transaksi prepaid dan postpaid.

---

## 🔑 **Required Parameters (Wajib)**

| Parameter | Deskripsi | Tipe Data | Contoh |
|-----------|-----------|-----------|--------|
| **username** | Username dari pengaturan koneksi API | String | `lefapaDLpVXD` |
| **buyer_sku_code** | Kode produk (SKU) | String | `ml100`, `pln`, `pdam` |
| **customer_no** | Nomor pelanggan/User ID | String | `1234567891234` |
| **ref_id** | Reference ID unik untuk transaksi | String | `TRX-20260201-001` |
| **sign** | Signature: `md5(username + apiKey + ref_id)` | String | `abc123...` |

---

## ⚙️ **Optional Parameters (Opsional)**

| Parameter | Deskripsi | Tipe Data | Default | Contoh |
|-----------|-----------|-----------|---------|--------|
| **testing** | Mode development/testing | Boolean | `false` | `true` |
| **max_price** | Limit harga maksimal | Integer | - | `30000` |
| **cb_url** | Callback URL untuk notifikasi | String | - | `https://example.com/callback` |
| **allow_dot** | Izinkan titik (.) di `customer_no` | Boolean | `false` | `true` |

---

## ⚙️ **Optional Parameters by Endpoint**

| Parameter | Prepaid | Inquiry Postpaid | Pay Postpaid |
|-----------|---------|------------------|--------------|
| **testing** | ✅ Yes | ❌ No | ✅ Yes |
| **max_price** | ✅ Yes | ✅ Yes | ❌ No |
| **cb_url** | ✅ Yes | ❌ No | ❌ No |
| **allow_dot** | ✅ Yes | ✅ Yes | ❌ No |

**Catatan:**
- **Prepaid** mendukung semua optional parameters
- **Inquiry Postpaid** hanya `max_price` dan `allow_dot`
- **Pay Postpaid** hanya `testing`

---

## 📝 **Parameter Details**


### **1. testing**
**Tipe:** `Boolean`  
**Wajib:** Tidak  
**Default:** `false`

Gunakan `true` untuk mode development/testing. Transaksi tidak akan diproses secara real.

```php
// Development
$digiflazzService->createTransaction('ml100', '1234567891234', 'TRX-001', [
    'testing' => true
]);

// Production
$digiflazzService->createTransaction('ml100', '1234567891234', 'TRX-001');
```

**Config:**
```php
// config/services.php
'digiflazz' => [
    'testing' => env('DIGIFLAZZ_TESTING', true),
],
```

---

### **2. max_price**
**Tipe:** `Integer`  
**Wajib:** Tidak  
**Default:** Tidak ada limit

Limit harga maksimal untuk transaksi. Jika harga produk melebihi limit, transaksi akan ditolak.

```php
$digiflazzService->createTransaction('ml100', '1234567891234', 'TRX-001', [
    'max_price' => 30000  // Maksimal Rp 30.000
]);
```

**Use Case:**
- Proteksi dari perubahan harga mendadak
- Kontrol budget per transaksi
- Hindari transaksi dengan harga tidak wajar

---

### **3. cb_url**
**Tipe:** `String`  
**Wajib:** Tidak  
**Default:** Tidak ada callback

URL untuk menerima notifikasi callback dari Digiflazz ketika status transaksi berubah.

```php
$digiflazzService->createTransaction('ml100', '1234567891234', 'TRX-001', [
    'cb_url' => 'https://yourdomain.com/api/webhooks/digiflazz'
]);
```

**Callback Format:**
```json
{
  "ref_id": "TRX-001",
  "status": "Sukses",
  "rc": "00",
  "sn": "1234-5678-9012",
  "message": "TRANSAKSI SUKSES"
}
```

**Use Case:**
- Real-time update status transaksi
- Notifikasi otomatis ke sistem
- Sinkronisasi status dengan Digiflazz

---

### **4. allow_dot**
**Tipe:** `Boolean`  
**Wajib:** Tidak  
**Default:** `false`

Izinkan karakter titik (`.`) di parameter `customer_no`. Optimal untuk seller dengan koneksi selain Jabber.

```php
// Customer no dengan titik
$digiflazzService->createTransaction('steam', 'user@example.com', 'TRX-001', [
    'allow_dot' => true
]);
```

**Use Case:**
- Email sebagai customer_no (voucher)
- Format khusus dengan titik
- Koneksi non-Jabber

---

## 🎯 **Implementation Examples**

### **Prepaid Transaction (Basic)**
```php
$result = $digiflazzService->createTransaction(
    'ml100',              // buyer_sku_code
    '1234567891234',      // customer_no
    'TRX-20260201-001'    // ref_id
);
```

### **Prepaid Transaction (With Options)**
```php
$result = $digiflazzService->createTransaction(
    'ml100',
    '1234567891234',
    'TRX-20260201-001',
    [
        'max_price' => 30000,
        'cb_url' => 'https://yourdomain.com/api/webhooks/digiflazz',
        'allow_dot' => false,
    ]
);
```

### **Postpaid Inquiry (Basic)**
```php
$result = $digiflazzService->inquiryPostpaid(
    'pln',                // buyer_sku_code
    '530000000003',       // customer_no
    'INQ-20260201-001'    // ref_id
);
```

### **Postpaid Inquiry (With Options)**
```php
$result = $digiflazzService->inquiryPostpaid(
    'pln',
    '530000000003',
    'INQ-20260201-001',
    [
        'max_price' => 500000,  // Max tagihan Rp 500.000
        'allow_dot' => false,
    ]
);
```

### **Postpaid Payment (With Options)**
```php
$result = $digiflazzService->payPostpaid(
    'pln',
    '530000000003',
    'TRX-20260201-001',
    [
        'testing' => true,  // Hanya testing yang didukung
    ]
);
```

**Note:** Pay Postpaid hanya mendukung parameter `testing`, tidak ada `max_price`, `cb_url`, atau `allow_dot`.

---

## 🔐 **Signature Generation**

Formula: `md5(username + apiKey + ref_id)`

```php
private function generateSign($refId)
{
    return md5($this->username . $this->apiKey . $refId);
}
```

**Example:**
```php
username = "lefapaDLpVXD"
apiKey = "dev-abc123xyz"
ref_id = "TRX-20260201-001"

sign = md5("lefapaDLpVXDdev-abc123xyzTRX-20260201-001")
     = "a1b2c3d4e5f6..."
```

---

## 📊 **Complete Request Example**

### **Prepaid Request:**
```json
{
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "ml100",
  "customer_no": "1234567891234",
  "ref_id": "TRX-20260201-001",
  "sign": "a1b2c3d4e5f6...",
  "testing": true,
  "max_price": 30000,
  "cb_url": "https://yourdomain.com/api/webhooks/digiflazz",
  "allow_dot": false
}
```

### **Postpaid Inquiry Request:**
```json
{
  "commands": "inq-pasca",
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "pln",
  "customer_no": "530000000003",
  "ref_id": "INQ-20260201-001",
  "sign": "a1b2c3d4e5f6...",
  "max_price": 500000,
  "allow_dot": false
}
```

### **Postpaid Payment Request:**
```json
{
  "commands": "pay-pasca",
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "pln",
  "customer_no": "530000000003",
  "ref_id": "TRX-20260201-001",
  "sign": "a1b2c3d4e5f6...",
  "testing": true
}
```

**Note:** Hanya `testing` yang optional untuk pay-pasca.

---

## ✅ **Best Practices**

1. **Testing Mode:**
   - Selalu gunakan `testing: true` saat development
   - Set `DIGIFLAZZ_TESTING=false` di production

2. **Max Price:**
   - Set `max_price` untuk proteksi dari perubahan harga
   - Gunakan harga produk + buffer (misal: +10%)

3. **Callback URL:**
   - Gunakan HTTPS untuk keamanan
   - Validasi signature di callback endpoint
   - Log semua callback untuk audit

4. **Allow Dot:**
   - Hanya aktifkan jika benar-benar diperlukan
   - Biasanya untuk voucher dengan email

5. **Ref ID:**
   - Harus unik per transaksi
   - Format: `TRX-{date}-{random}`
   - Simpan di database untuk tracking

---

## 🔍 **Troubleshooting**

### **Error: Invalid Signature**
```
Solusi: Pastikan formula md5(username + apiKey + ref_id) benar
```

### **Error: Max Price Exceeded**
```
Solusi: Naikkan max_price atau hapus parameter
```

### **Error: Invalid Customer No**
```
Solusi: 
- Cek format customer_no sesuai product type
- Aktifkan allow_dot jika ada titik
```

### **Error: Duplicate Ref ID**
```
Solusi: Gunakan ref_id yang unik
```

---

## 📚 **Reference**

- **Digiflazz API Docs:** https://developer.digiflazz.com
- **Support:** support@digiflazz.com
- **Testing Mode:** Gunakan untuk development tanpa charge real

**Updated:** 2026-02-01
