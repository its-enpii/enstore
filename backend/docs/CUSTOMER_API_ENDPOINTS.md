# Customer & Public API Endpoints ✅

## 🚀 Guest Checkout (Public)

Fitur ini memungkinkan pembeli melakukan transaksi tanpa harus login/register (Walk-in Customer).

### 1. Purchase Product (Guest)

**Endpoint:** `POST /api/transactions/purchase`

**Request Body:**

```json
{
    "product_item_id": 16,
    "payment_method": "QRIS",
    "customer_data": {
        "zone_id": "1234",
        "user_id": "123456789"
    },
    "customer_name": "Anto Walkin",
    "customer_email": "anto@gmail.com",
    "customer_phone": "08123456789"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Transaction created successfully",
    "data": {
        "transaction": {
            "transaction_code": "TRX-20260201-GUEST1",
            "total_price": 25000,
            "status": "pending",
            "payment_status": "pending"
        },
        "payment": {
            "payment_method": "QRIS",
            "payment_url": "https://tripay.co.id/checkout/...",
            "qr_code_url": "https://..."
        }
    }
}
```

### 2. Check Transaction Status

**Endpoint:** `GET /api/transactions/status/{transactionCode}`

**Response:**

```json
{
    "success": true,
    "data": {
        "transaction_code": "TRX-20260201-GUEST1",
        "status": "success",
        "payment_status": "paid",
        "product_name": "Mobile Legends 86 Diamond",
        "payment": {
            "payment_method": "QRIS",
            "paid_at": "2026-02-01T10:05:00Z"
        }
    }
}
```

### 3. Get Payment Channels

**Endpoint:** `GET /api/transactions/payment-channels`

---

## 🛍️ Public Catalog API (No Login Required)

### 1. Get Product List (with Filters)

**Controller:** `app/Http/Controllers/Api/Customer/ProductController.php`

> **Note:** Endpoint ini **PUBLIC**. Bisa diakses Guest. Jika mengakses dengan Token, harga akan otomatis menyesuaikan tipe user (Reseller/Retail). Jika tanpa token, harga default Retail.

**Endpoint:** `GET /api/products`

**Query Parameters:**

- `page`: Page number
- `per_page`: products per page (default: 20)
- `search`: **Flexible Search**. Mencari berdasarkan Nama Produk, Brand, Nama Category, Nama Item, atau Kode SKU.
- **Dynamic Filters**:
    - Filter by **ANY** column in `products` table (e.g. `type=game`, `featured=true`).
    - Filter by **Relationship** (e.g. `category.slug=games`, `items.digiflazz_code=ML5`).
      _Note: API also supports underscore notation (e.g. `category_slug=games`) if needed._
- `sort_by`: Sort column (price, name, etc.)
- `sort_order`: asc/desc

**Features:**
✅ Filter by category  
✅ Filter by price range  
✅ Search functionality  
✅ Featured products  
✅ Customer-specific pricing (retail/reseller)  
✅ Pagination  
✅ Caching

**Example Request:**

```bash
GET /api/products?category=games&min_price=10000&max_price=50000&search=mobile&per_page=20
Authorization: Bearer {optional_token}
```

**Example Response:**

```json
{
    "success": true,
    "data": {
        "products": [
            {
                "id": 1,
                "name": "Mobile Legends",
                "brand": "MOBILE LEGENDS",
                "category": {
                    "id": 1,
                    "name": "Games",
                    "slug": "games"
                },
                "description": "Top up Mobile Legends",
                "is_featured": true,
                "image_url": "https://...",
                "input_fields": [
                    {
                        "name": "user_id",
                        "label": "User ID",
                        "type": "text",
                        "required": true
                    },
                    {
                        "name": "zone_id",
                        "label": "Zone ID",
                        "type": "text",
                        "required": true
                    }
                ],
                "price_range": {
                    "min": 1500,
                    "max": 1000000
                }
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 20,
            "total": 150,
            "last_page": 8
        }
    }
}
```

### 2. Get Product Detail

**Endpoint:** `GET /api/products/{id}` OR `GET /api/products/slug/{slug}`

**Features:**
✅ Product details  
✅ Availability check  
✅ Customer-specific pricing  
✅ Stock information

**Example Request:**

```bash
GET /api/products/1
Authorization: Bearer {optional_token}
```

**Example Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Mobile Legends",
        "brand": "MOBILE LEGENDS",
        "category": {
            "id": 1,
            "name": "Games",
            "slug": "games"
        },
        "description": "Top up Mobile Legends instantly",
        "is_featured": true,
        "is_active": true,
        "image_url": "https://...",
        "input_fields": [
            {
                "name": "user_id",
                "label": "User ID",
                "type": "text",
                "required": true
            },
            {
                "name": "zone_id",
                "label": "Zone ID",
                "type": "text",
                "required": true
            }
        ],
        "items": [
            {
                "id": 101,
                "name": "86 Diamond",
                "price": 25000,
                "stock_status": "available"
            },
            {
                "id": 102,
                "name": "172 Diamond",
                "price": 48000,
                "stock_status": "available"
            }
        ],
        "instructions": "Enter your User ID and Zone ID"
    }
}
```

### 3. Get Categories

**Endpoint:** `GET /api/products/categories`

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Games",
            "slug": "games",
            "icon": "gamepad",
            "products_count": 50
        }
    ]
}
```

---

## 👤 Registered Customer API

### 3. Create Order/Transaction

#### 3.1 Purchase via Payment Gateway

**Endpoint:** `POST /api/customer/transactions/purchase`

**Request Body:**

```json
{
    "product_item_id": 16,
    "payment_method": "QRIS",
    "customer_data": {
        "user_id": "123456789",
        "zone_id": "1234"
    }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": 1,
      "transaction_code": "TRX-20260201-ABC123",
      "product_name": "Mobile Legends 86 Diamond",
      "total_price": 25000,
      "status": "pending",
      "payment_status": "pending",
      "expired_at": "2026-02-01T12:00:00Z"
    },
    "payment": {
      "payment_code": "T1234567890ABCDE",
      "payment_method": "QRIS",
      "payment_channel": "QRIS (All Banks)",
      "amount": 25000,
      "payment_url": "https://tripay.co.id/checkout/...",
      "qr_code_url": "https://...",
      "va_number": null,
      "expired_at": "2026-02-01T12:00:00Z",
      "instructions": [...]
    }
  }
}
```

#### 3.2 Purchase via Balance

**Endpoint:** `POST /api/customer/transactions/purchase-balance`

**Request Body:**

```json
{
    "product_item_id": 16,
    "customer_data": {
        "user_id": "123456789",
        "zone_id": "1234"
    }
}
```

**Response:**

```json
{
    "success": true,
    "message": "Transaction created successfully. Your order is being processed.",
    "data": {
        "id": 1,
        "transaction_code": "TRX-20260201-ABC123",
        "product_name": "Mobile Legends 86 Diamond",
        "total_price": 23000,
        "status": "processing",
        "payment_status": "paid"
    }
}
```

---

### 4. Get Transaction History

**Endpoint:** `GET /api/customer/transactions`

**Query Parameters:**

- `type`: Filter by transaction type (purchase, topup)
- `status`: Filter by status (pending, success, failed)
- `search`: Search by Transaction Code or Product Name
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `per_page`: Items per page (default: 20)

**Features:**
✅ Pagination  
✅ Filter by type  
✅ Filter by status  
✅ Date range filter

**Example Request:**

```bash
GET /api/customer/transactions?type=purchase&status=success&per_page=20
Authorization: Bearer {token}
```

**Example Response:**

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "transaction_code": "TRX-20260201-ABC123",
                "transaction_type": "purchase",
                "product_name": "Mobile Legends 86 Diamond",
                "total_price": 25000,
                "status": "success",
                "payment_status": "paid",
                "created_at": "2026-02-01T10:00:00Z",
                "product": {
                    "id": 1,
                    "name": "Mobile Legends 86 Diamond"
                },
                "payment": {
                    "payment_method": "QRIS",
                    "payment_channel": "QRIS (All Banks)"
                }
            }
        ],
        "total": 50,
        "per_page": 20,
        "last_page": 3
    }
}
```

---

### 5. Get Transaction Detail

**Endpoint:** `GET /api/customer/transactions/{transactionCode}`

**Features:**
✅ Complete transaction details  
✅ Payment information  
✅ Product details  
✅ Transaction logs  
✅ Customer data

**Example Request:**

```bash
GET /api/customer/transactions/TRX-20260201-ABC123
Authorization: Bearer {token}
```

**Example Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "transaction_code": "TRX-20260201-ABC123",
        "transaction_type": "purchase",
        "product_name": "Mobile Legends 86 Diamond",
        "product_code": "ML86",
        "product_price": 23000,
        "admin_fee": 2000,
        "total_price": 25000,
        "customer_data": {
            "user_id": "123456789",
            "zone_id": "1234"
        },
        "payment_method": "QRIS",
        "status": "success",
        "payment_status": "paid",
        "created_at": "2026-02-01T10:00:00Z",
        "paid_at": "2026-02-01T10:05:00Z",
        "completed_at": "2026-02-01T10:06:00Z",
        "product": {
            "id": 1,
            "name": "Mobile Legends 86 Diamond",
            "image_url": "https://..."
        },
        "payment": {
            "payment_code": "T1234567890ABCDE",
            "payment_method": "QRIS",
            "payment_channel": "QRIS (All Banks)",
            "amount": 25000,
            "status": "paid"
        },
        "logs": [
            {
                "action": "created",
                "description": "Transaction created",
                "created_at": "2026-02-01T10:00:00Z"
            },
            {
                "action": "payment_success",
                "description": "Payment successful",
                "created_at": "2026-02-01T10:05:00Z"
            }
        ]
    }
}
```

---

### 6. Check Balance

**Endpoint:** `GET /api/customer/balance`

**Features:**
✅ Current balance  
✅ Hold amount  
✅ Available balance

**Example Request:**

```bash
GET /api/customer/balance
Authorization: Bearer {token}
```

**Example Response:**

```json
{
    "success": true,
    "data": {
        "balance": 150000,
        "hold_amount": 0,
        "available_balance": 150000
    }
}
```

**Get Balance Mutations:**
**Endpoint:** `GET /api/customer/balance/mutations`

**Query Parameters:**

- `limit` - Number of records (default: 50)

**Example Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "type": "credit",
            "amount": 50000,
            "balance_before": 100000,
            "balance_after": 150000,
            "description": "Top up via QRIS",
            "created_at": "2026-02-01T10:00:00Z",
            "transaction": {
                "transaction_code": "TRX-20260201-ABC123"
            }
        },
        {
            "id": 2,
            "type": "debit",
            "amount": 25000,
            "balance_before": 150000,
            "balance_after": 125000,
            "description": "Purchase: Mobile Legends 86 Diamond",
            "created_at": "2026-02-01T11:00:00Z"
        }
    ]
}
```

---

### 7. Profile Management

#### 7.1 Get Profile

**Endpoint:** `GET /api/customer/profile`

**Example Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "081234567890",
        "role": "customer",
        "customer_type": "retail",
        "status": "active",
        "avatar": "https://...",
        "created_at": "2026-01-01T00:00:00Z",
        "balance": {
            "amount": 150000,
            "hold_amount": 0
        }
    }
}
```

#### 7.2 Update Profile

**Endpoint:** `PUT /api/customer/profile`

**Request Body:**

```json
{
    "name": "John Doe Updated",
    "email": "john.new@example.com",
    "phone": "081234567891",
    "avatar": "https://..."
}
```

**Response:**

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": 1,
        "name": "John Doe Updated",
        "email": "john.new@example.com",
        "phone": "081234567891"
    }
}
```

#### 7.3 Change Password

**Endpoint:** `POST /api/customer/profile/change-password`

**Request Body:**

```json
{
    "current_password": "oldpassword123",
    "new_password": "newpassword123",
    "new_password_confirmation": "newpassword123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

#### 7.4 Delete Account

**Endpoint:** `DELETE /api/customer/profile`

**Request Body:**

```json
{
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Account deleted successfully"
}
```

---

### 8. Top Up Balance (via Tripay)

**Endpoint:** `POST /api/customer/transactions/topup`

**Request Body:**

```json
{
    "amount": 50000,
    "payment_method": "QRIS"
}
```

**Validation:**

- Minimum: Rp 10.000
- Maximum: Rp 10.000.000

**Response:**

```json
{
    "success": true,
    "message": "Topup transaction created successfully",
    "data": {
        "transaction": {
            "id": 1,
            "transaction_code": "TRX-20260201-ABC123",
            "transaction_type": "topup",
            "product_name": "Top Up Saldo",
            "product_price": 50000,
            "admin_fee": 0,
            "total_price": 50000,
            "status": "pending",
            "payment_status": "pending",
            "expired_at": "2026-02-01T12:00:00Z"
        },
        "payment": {
            "payment_code": "T1234567890ABCDE",
            "payment_method": "QRIS",
            "payment_channel": "QRIS (All Banks)",
            "amount": 50000,
            "payment_url": "https://tripay.co.id/checkout/...",
            "qr_code_url": "https://...",
            "expired_at": "2026-02-01T12:00:00Z"
        }
    }
}
```

**Get Payment Channels:**
**Endpoint:** `GET /api/customer/transactions/payment-channels`

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "code": "QRIS",
            "name": "QRIS (All Banks)",
            "group": "QRIS",
            "fee_merchant": {
                "flat": 0,
                "percent": 0.7
            },
            "fee_customer": {
                "flat": 0,
                "percent": 0
            },
            "icon_url": "https://...",
            "active": true
        },
        {
            "code": "BRIVA",
            "name": "BRI Virtual Account",
            "group": "Virtual Account",
            "fee_merchant": {
                "flat": 4000,
                "percent": 0
            },
            "active": true
        }
    ]
}
```

---

### 9. Postpaid Transaction (PPOB)

#### 9.1 Inquiry Tagihan (Cek Tagihan)

**Endpoint:** `POST /api/customer/postpaid/inquiry`

**Request Body:**

```json
{
    "product_item_id": 105,
    "customer_no": "512345678901"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Berhasil cek tagihan",
    "data": {
        "inquiry_ref": "INQ-20260205120000-1234",
        "product_name": "PLN Pascabayar - PLN Postpaid",
        "customer_no": "512345678901",
        "customer_name": "BUDI SANTOSO",
        "period": "202602",
        "tagihan": 150000,
        "admin": 2500,
        "total": 152500
    }
}
```

#### 9.2 Pay Tagihan (Bayar Tagihan)

**Endpoint:** `POST /api/customer/postpaid/pay`

**Request Body:**

```json
{
    "inquiry_ref": "INQ-20260205120000-1234",
    "payment_method": "QRIS"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Transaksi berhasil dibuat",
    "data": {
        "transaction_code": "TRX-20260205-PPOB123",
        "payment": {
            "payment_method": "QRIS",
            "payment_url": "https://tripay.co.id/checkout/...",
            "qr_code_url": "https://...",
            "amount": 152500
        }
    }
}
```

---

## Files Created/Modified

### Controllers (4 files)

1. ✅ `app/Http/Controllers/Api/Customer/ProductController.php` - Product browsing
2. ✅ `app/Http/Controllers/Api/Customer/TransactionController.php` - Order & topup
3. ✅ `app/Http/Controllers/Api/Customer/BalanceController.php` - Balance check
4. ✅ `app/Http/Controllers/Api/Customer/ProfileController.php` - Profile management

### Public Controller

5. ✅ `app/Http/Controllers/Api/Public/PublicTransactionController.php` - Guest checkout

### Routes

6. ✅ `routes/api.php` - Customer & Public routes added

---

## API Routes Summary

### Public / Guest (6 endpoints)

```
POST   /api/transactions/purchase                # Guest purchase
GET    /api/transactions/status/{code}           # Check status
GET    /api/transactions/payment-channels        # List channels
GET    /api/products                    # List products
GET    /api/products/categories         # Categories
GET    /api/products/{id}               # Product detail
```

### Registered Customer (14 endpoints)

```
GET    /api/customer/transactions                # Transaction history
GET    /api/customer/transactions/payment-channels # Authenticated payment channels
GET    /api/customer/transactions/{code}         # Transaction detail
POST   /api/customer/transactions/purchase       # Purchase with Payment Gateway
POST   /api/customer/transactions/purchase-balance # Purchase with Balance
POST   /api/customer/transactions/topup          # Topup Balance
GET    /api/customer/balance                     # Check Balance
GET    /api/customer/balance/mutations           # Balance History
POST   /api/customer/postpaid/inquiry            # Postpaid Inquiry (PLN/PDAM)
POST   /api/customer/postpaid/pay                # Postpaid Payment
GET    /api/customer/profile                     # Get Profile
PUT    /api/customer/profile                     # Update Profile
POST   /api/customer/profile/change-password     # Change Password
DELETE /api/customer/profile                     # Delete Account
```

**Total: 20 Customer Facing Endpoints** 🎉
