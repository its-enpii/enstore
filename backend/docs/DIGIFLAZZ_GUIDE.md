# Digiflazz Integration Guide

Dokumentasi lengkap integrasi Digiflazz API untuk prepaid dan postpaid (PPOB) transactions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Parameters](#api-parameters)
3. [Customer Number Format](#customer-number-format)
4. [Prepaid vs Postpaid](#prepaid-vs-postpaid)
5. [Postpaid (PPOB) Flow](#postpaid-ppob-flow)
6. [Implementation Examples](#implementation-examples)

---

## 1. Overview

### Supported Products
- ✅ **Prepaid**: Game vouchers, Pulsa, Data, E-Wallet, PLN Token, Vouchers
- ✅ **Postpaid (PPOB)**: PLN Pascabayar, PDAM, Telkom/Indihome, TV Kabel, BPJS

### API Endpoints
- **Prepaid**: `/transaction` (single step)
- **Postpaid Inquiry**: `/transaction` with `commands: "inq-pasca"`
- **Postpaid Payment**: `/transaction` with `commands: "pay-pasca"`

---

## 2. API Parameters

### Required Parameters (All Endpoints)

| Parameter | Description | Example |
|-----------|-------------|---------|
| `username` | API username | `lefapaDLpVXD` |
| `buyer_sku_code` | Product SKU | `ml100`, `pln` |
| `customer_no` | Customer ID/number | `1234567891234` |
| `ref_id` | Unique transaction ID | `TRX-20260201-001` |
| `sign` | MD5 signature | `md5(username + apiKey + ref_id)` |

### Optional Parameters by Endpoint

| Parameter | Prepaid | Inquiry Postpaid | Pay Postpaid |
|-----------|---------|------------------|--------------|
| `testing` | ✅ Yes | ❌ No | ✅ Yes |
| `max_price` | ✅ Yes | ✅ Yes | ❌ No |
| `cb_url` | ✅ Yes | ❌ No | ❌ No |
| `allow_dot` | ✅ Yes | ✅ Yes | ❌ No |

### Parameter Details

**`testing`** - Development mode (no real transaction)
```php
['testing' => true]
```

**`max_price`** - Maximum price limit (in Rupiah)
```php
['max_price' => 30000]  // Max Rp 30.000
```

**`cb_url`** - Callback URL for status updates
```php
['cb_url' => 'https://yourdomain.com/api/webhooks/digiflazz']
```

**`allow_dot`** - Allow dot (.) in customer_no (for email, special formats)
```php
['allow_dot' => true]  // For: user@gmail.com, 12.34.56.78
```

---

## 3. Customer Number Format

### Format by Product Type

| Product Type | Format | Example | Fields |
|--------------|--------|---------|--------|
| **Game** | `{user_id}{zone_id}` | `1234567891234` | user_id, zone_id |
| **Pulsa/Data** | `{phone}` | `08123456789` | phone |
| **E-Wallet** | `{phone}` | `08123456789` | phone |
| **PLN Token** | `{meter_no}` | `12345678901` | meter_no |
| **Voucher** | `{email}` or empty | `user@example.com` | email (optional) |
| **Postpaid** | `{customer_id}` | `530000000003` | customer_id |

### Game Format (IMPORTANT!)

**⚠️ User ID and Zone ID are concatenated WITHOUT separator**

```php
// ✅ CORRECT
$customerNo = $userId . $zoneId;  // "1234567891234"

// ❌ WRONG
$customerNo = $userId . '-' . $zoneId;  // "123456789-1234"
```

**Examples:**

| Game | User ID | Zone ID | customer_no |
|------|---------|---------|-------------|
| Mobile Legends | `123456789` | `1234` | `1234567891234` |
| PUBG Mobile | `5123456789` | `0123` | `51234567890123` |
| Free Fire | `123456789` | - | `123456789` |

---

## 4. Prepaid vs Postpaid

### Auto-Detection (During Product Sync)

System automatically detects `payment_type` based on:

1. **Field `type` from Digiflazz** - If contains "pasca" → postpaid
2. **Product name** - If contains "pascabayar" → postpaid
3. **Category** - If matches postpaid categories → postpaid

**Postpaid Categories:**
```php
[
    'pln pascabayar',
    'pdam',
    'telkom',
    'indihome',
    'tv kabel',
    'bpjs',
    'multifinance',
]
```

### Database Schema

**Products Table:**
```sql
type VARCHAR(50) DEFAULT 'other'  -- game, pulsa, data, pln, voucher
payment_type ENUM('prepaid', 'postpaid') DEFAULT 'prepaid'
```

**Transactions Table:**
```sql
payment_method_type ENUM('gateway', 'balance') DEFAULT 'gateway'
prepaid_postpaid_type ENUM('prepaid', 'postpaid') DEFAULT 'prepaid'
inquiry_ref VARCHAR(100) NULL  -- For postpaid
bill_data JSON NULL  -- For postpaid
```

---

## 5. Postpaid (PPOB) Flow

### 2-Step Process

```
1. Inquiry (Check Bill)
   ↓
2. Payment (Pay Bill)
```

### Step 1: Inquiry

**Request:**
```php
$result = $digiflazzService->inquiryPostpaid(
    'pln',              // buyer_sku_code
    '530000000003',     // customer_no
    'INQ-20260201-001', // ref_id
    ['max_price' => 500000]  // optional
);
```

**Response:**
```json
{
  "data": {
    "ref_id": "INQ-20260201-001",
    "customer_name": "JOHN DOE",
    "period": "JAN 2026",
    "nominal": 150000,
    "admin": 2500,
    "total_bayar": 152500,
    "rc": "00"
  }
}
```

**Backend Process:**
1. Save inquiry data to cache (30 minutes)
2. Return `inquiry_ref` to frontend
3. Show bill details to customer

### Step 2: Payment

**Request:**
```php
$result = $digiflazzService->payPostpaid(
    'pln',              // buyer_sku_code
    '530000000003',     // customer_no
    'TRX-20260201-001', // ref_id (same as inquiry)
    ['testing' => true] // optional
);
```

**Backend Process:**
1. Get inquiry data from cache
2. Create transaction (postpaid)
3. Create payment via Tripay
4. After payment success → dispatch `ProcessPostpaidPayment` job
5. Job calls Digiflazz `pay-pasca`
6. Update transaction status

---

## 6. Implementation Examples

### Prepaid Transaction

```php
// Mobile Legends 100 Diamond
$result = $digiflazzService->createTransaction(
    'ml100',
    '1234567891234',  // user_id + zone_id
    'TRX-001',
    [
        'max_price' => 30000,
        'cb_url' => 'https://yourdomain.com/webhook',
    ]
);
```

### Postpaid Transaction

```php
// 1. Inquiry
$inquiry = $digiflazzService->inquiryPostpaid(
    'pln',
    '530000000003',
    'INQ-001',
    ['max_price' => 500000]
);

// 2. Save to cache
Cache::put('INQ-001', $inquiry['data'], 1800); // 30 min

// 3. Show to customer, wait for confirmation

// 4. After customer confirms, create payment
$payment = $digiflazzService->payPostpaid(
    'pln',
    '530000000003',
    'TRX-001'  // Use transaction_code as ref_id
);
```

### API Routes

```php
// Prepaid
POST /api/customer/transactions/purchase
POST /api/customer/transactions/purchase-balance

// Postpaid
POST /api/customer/postpaid/inquiry
POST /api/customer/postpaid/pay
```

---

## Quick Reference

### Signature Generation
```php
$sign = md5($username . $apiKey . $refId);
```

### Response Codes
- `00` - Success
- `01` - Pending
- `06` - Product not available
- `07` - Invalid customer number
- `13` - Duplicate ref_id
- `17` - Insufficient balance
- `39` - Product inactive

### Testing Mode
```php
// .env
DIGIFLAZZ_TESTING=true  // Development
DIGIFLAZZ_TESTING=false // Production
```

### Sync Products
```bash
php artisan digiflazz:sync-products
php artisan digiflazz:sync-products --category=Games
```

---

## Support

- **Digiflazz Docs**: https://developer.digiflazz.com
- **Support**: support@digiflazz.com

**Last Updated**: 2026-02-01
