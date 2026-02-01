# Customer Number Format - Digiflazz Integration

## 📋 Overview

Field `customer_no` di Digiflazz digunakan untuk mengirim informasi target/tujuan top up. Format berbeda-beda tergantung jenis produk.

---

## 🎮 Format `customer_no` Berdasarkan Jenis Produk

### **1. Game (Mobile Legends, Free Fire, PUBG, dll)**

**Format:** `{user_id}{zone_id}` (digabung tanpa separator)

**Contoh Mobile Legends:**
```json
{
  "buyer_sku_code": "ml100",
  "customer_no": "1234567891234"
}
```

**Breakdown:**
- User ID: `123456789` (9-10 digit)
- Zone ID: `1234` (4 digit)
- `customer_no`: `1234567891234` (digabung langsung)

**Cara Digiflazz Memproses:**
1. Digiflazz menerima `customer_no`: `1234567891234`
2. Digiflazz tahu bahwa `ml100` adalah produk Mobile Legends
3. Untuk ML, format adalah: User ID (9-10 digit) + Zone ID (sisanya)
4. Digiflazz parse: User ID = `123456789`, Zone ID = `1234`
5. Digiflazz kirim diamond ke akun ML dengan User ID `123456789` di Server `1234`

**Implementasi di Kode:**
```php
// customer_data dari frontend
$customerData = [
    'user_id' => '123456789',
    'zone_id' => '1234',
];

// Format untuk Digiflazz
$customerNo = $customerData['user_id'] . $customerData['zone_id'];
// Result: "1234567891234"
```

---

### **2. Pulsa & Paket Data**

**Format:** `{nomor_hp}` (langsung nomor HP)

**Contoh:**
```json
{
  "buyer_sku_code": "telkomsel10",
  "customer_no": "08123456789"
}
```

**Cara Digiflazz Memproses:**
1. Digiflazz menerima `customer_no`: `08123456789`
2. Digiflazz tahu bahwa `telkomsel10` adalah pulsa Telkomsel
3. Digiflazz kirim pulsa 10rb ke nomor `08123456789`

**Implementasi:**
```php
$customerData = [
    'phone' => '08123456789',
];

$customerNo = $customerData['phone'];
// Result: "08123456789"
```

---

### **3. PLN Token**

**Format:** `{nomor_meter}` atau `{id_pelanggan}`

**Contoh:**
```json
{
  "buyer_sku_code": "plntoken20",
  "customer_no": "12345678901"
}
```

**Cara Digiflazz Memproses:**
1. Digiflazz menerima `customer_no`: `12345678901`
2. Digiflazz tahu bahwa `plntoken20` adalah token PLN 20rb
3. Digiflazz generate token PLN untuk meter `12345678901`
4. Token dikirim via serial number

**Implementasi:**
```php
$customerData = [
    'meter_number' => '12345678901',
];

$customerNo = $customerData['meter_number'];
// Result: "12345678901"
```

---

### **4. E-Wallet (GoPay, OVO, Dana, ShopeePay)**

**Format:** `{nomor_hp}` (nomor HP yang terdaftar di e-wallet)

**Contoh:**
```json
{
  "buyer_sku_code": "gopay10",
  "customer_no": "08123456789"
}
```

**Cara Digiflazz Memproses:**
1. Digiflazz menerima `customer_no`: `08123456789`
2. Digiflazz tahu bahwa `gopay10` adalah top up GoPay 10rb
3. Digiflazz kirim saldo ke akun GoPay dengan nomor `08123456789`

**Implementasi:**
```php
$customerData = [
    'phone' => '08123456789',
];

$customerNo = $customerData['phone'];
// Result: "08123456789"
```

---

### **5. Voucher Game (Garena, Steam, Google Play, iTunes)**

**Format:** `{email}` atau kosong (voucher code dikirim via serial number)

**Contoh:**
```json
{
  "buyer_sku_code": "garena100",
  "customer_no": "customer@example.com"
}
```

**Cara Digiflazz Memproses:**
1. Digiflazz menerima `customer_no`: `customer@example.com` (opsional)
2. Digiflazz tahu bahwa `garena100` adalah voucher Garena 100rb
3. Digiflazz generate voucher code
4. Voucher code dikirim via `serial_number` (SN)

**Implementasi:**
```php
$customerData = [
    'email' => 'customer@example.com',
];

$customerNo = $customerData['email'] ?? '';
// Result: "customer@example.com" atau ""
```

---

### **6. Pascabayar (Tagihan PLN, PDAM, Telkom, dll)**

**Format:** `{nomor_pelanggan}` atau `{id_pelanggan}`

**Contoh:**
```json
{
  "commands": "pay-pasca",  // ← Berbeda! Bukan "prepaid"
  "buyer_sku_code": "pln",
  "customer_no": "530000000003",
  "ref_id": "some1d",
  "sign": "740b00a1b8784e028cc8078edf66d12b"
}
```

**Perbedaan Pascabayar:**
- `commands`: `"pay-pasca"` (bukan `"prepaid"`)
- Perlu inquiry dulu untuk cek tagihan
- Baru bayar setelah customer konfirmasi

**Cara Digiflazz Memproses:**
1. **Inquiry** - Cek tagihan
   ```json
   {
     "commands": "inq-pasca",
     "buyer_sku_code": "pln",
     "customer_no": "530000000003"
   }
   ```
   Response: `{"tagihan": 150000, "nama": "John Doe"}`

2. **Payment** - Bayar tagihan
   ```json
   {
     "commands": "pay-pasca",
     "buyer_sku_code": "pln",
     "customer_no": "530000000003"
   }
   ```

**Implementasi:**
```php
// Step 1: Inquiry
$customerData = [
    'customer_id' => '530000000003',
];

$customerNo = $customerData['customer_id'];

// Step 2: Payment (setelah customer konfirmasi)
$result = $digiflazzService->payPostpaid('pln', $customerNo, $refId);
```

---

## 🔧 Implementasi di Sistem Kita

### **Method: `formatCustomerNumber()`**

```php
// DigiflazzService.php
public function formatCustomerNumber(array $customerData, string $productType): string
{
    switch ($productType) {
        case 'game':
            // Format: {user_id}{zone_id}
            $userId = $customerData['user_id'] ?? '';
            $zoneId = $customerData['zone_id'] ?? '';
            return $userId . $zoneId;
            
        case 'pulsa':
        case 'data':
        case 'ewallet':
            // Format: {phone}
            return $customerData['phone'] ?? '';
            
        case 'pln':
            // Format: {meter_number} atau {customer_id}
            return $customerData['meter_number'] ?? $customerData['customer_id'] ?? '';
            
        case 'voucher':
            // Format: {email} atau kosong
            return $customerData['email'] ?? '';
            
        case 'pascabayar':
            // Format: {customer_id}
            return $customerData['customer_id'] ?? '';
            
        default:
            // Default: ambil field pertama yang ada
            return $customerData['user_id'] 
                ?? $customerData['phone'] 
                ?? $customerData['customer_id'] 
                ?? '';
    }
}
```

---

## 📊 Mapping Product Type → Customer No Format

| Product Type | customer_no Format | Example | Field Required |
|--------------|-------------------|---------|----------------|
| **Game** | `{user_id}{zone_id}` | `1234567891234` | `user_id`, `zone_id` |
| **Pulsa** | `{phone}` | `08123456789` | `phone` |
| **Data** | `{phone}` | `08123456789` | `phone` |
| **E-Wallet** | `{phone}` | `08123456789` | `phone` |
| **PLN Token** | `{meter_number}` | `12345678901` | `meter_number` |
| **Voucher** | `{email}` atau kosong | `user@example.com` | `email` (optional) |
| **Pascabayar** | `{customer_id}` | `530000000003` | `customer_id` |

---

## 🎯 Contoh Request ke Digiflazz

### **Mobile Legends (100 Diamond)**

```json
{
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "ml100",
  "customer_no": "1234567891234",
  "ref_id": "TRX-20260201-001",
  "sign": "e1b1c739f0cbb72c92b28a244aad3b4a",
  "testing": true
}
```

**Response Success:**
```json
{
  "data": {
    "ref_id": "TRX-20260201-001",
    "status": "Sukses",
    "sn": "100 Diamond telah dikirim ke 123456789 (1234)",
    "buyer_sku_code": "ml100",
    "customer_no": "1234567891234",
    "price": 24500,
    "message": "SUKSES",
    "rc": "00"
  }
}
```

---

### **Pulsa Telkomsel 10rb**

```json
{
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "telkomsel10",
  "customer_no": "08123456789",
  "ref_id": "TRX-20260201-002",
  "sign": "abc123...",
  "testing": true
}
```

**Response Success:**
```json
{
  "data": {
    "ref_id": "TRX-20260201-002",
    "status": "Sukses",
    "sn": "Pulsa 10.000 telah terkirim ke 08123456789",
    "buyer_sku_code": "telkomsel10",
    "customer_no": "08123456789",
    "price": 10500,
    "message": "SUKSES",
    "rc": "00"
  }
}
```

---

### **PLN Token 20rb**

```json
{
  "username": "lefapaDLpVXD",
  "buyer_sku_code": "plntoken20",
  "customer_no": "12345678901",
  "ref_id": "TRX-20260201-003",
  "sign": "def456...",
  "testing": true
}
```

**Response Success:**
```json
{
  "data": {
    "ref_id": "TRX-20260201-003",
    "status": "Sukses",
    "sn": "1234-5678-9012-3456-7890",  // ← Token PLN
    "buyer_sku_code": "plntoken20",
    "customer_no": "12345678901",
    "price": 20500,
    "message": "SUKSES",
    "rc": "00"
  }
}
```

---

## ✅ Summary

**Cara Digiflazz Tahu Target:**
1. ✅ Dari field `customer_no` yang kita kirim
2. ✅ Format `customer_no` berbeda per jenis produk
3. ✅ Digiflazz parse `customer_no` berdasarkan `buyer_sku_code`
4. ✅ Untuk game: `customer_no` = `{user_id}{zone_id}` (digabung)
5. ✅ Untuk pulsa/data: `customer_no` = `{phone}`
6. ✅ Untuk PLN: `customer_no` = `{meter_number}`
7. ✅ Untuk voucher: `customer_no` = `{email}` atau kosong

**Pascabayar (pay-pasca):**
- ✅ Berbeda dengan prepaid
- ✅ Perlu 2 step: inquiry → payment
- ✅ `commands`: `"inq-pasca"` atau `"pay-pasca"`

Apakah penjelasan ini sudah jelas? 🤔
