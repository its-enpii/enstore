# 🗄️ FINAL DATABASE STRUCTURE - Top Up Game & PPOB

## 📊 COMPLETE ERD

```
users (1) ----< (N) transactions
users (1) ----< (1) balances
users (1) ----< (N) balance_mutations
users (1) ----< (N) notifications
users (1) ----< (N) voucher_usages

product_categories (1) ----< (N) products
products (1) ----< (N) transactions

transactions (1) ----< (1) payments
transactions (1) ----< (N) transaction_logs

payments (1) ----< (N) payment_callbacks

vouchers (1) ----< (N) voucher_usages
```

---

## 📋 COMPLETE TABLE STRUCTURES

### 1. **users** - Data Semua User (Guest, Retail, Reseller, Admin)

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NULL COMMENT 'NULL untuk guest yang belum set password',
    
    -- Role & Type
    role ENUM('admin', 'customer') DEFAULT 'customer',
    customer_type ENUM('retail', 'reseller') DEFAULT 'retail',
    is_guest BOOLEAN DEFAULT FALSE COMMENT 'TRUE = guest user, FALSE = registered member',
    
    -- Status
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    
    -- Profile
    avatar VARCHAR(255) NULL,
    
    -- Referral System (Optional)
    referral_code VARCHAR(20) UNIQUE NULL,
    referred_by BIGINT UNSIGNED NULL,
    
    -- Tracking
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    
    -- Laravel Auth
    remember_token VARCHAR(100) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role),
    INDEX idx_customer_type (customer_type),
    INDEX idx_is_guest (is_guest),
    INDEX idx_status (status),
    INDEX idx_referral_code (referral_code),
    INDEX idx_email_guest (email, is_guest)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**User Types:**
- **Guest Retail**: `is_guest=TRUE`, `customer_type=retail`, `password=NULL`
- **Registered Retail**: `is_guest=FALSE`, `customer_type=retail`, `password!=NULL`
- **Reseller**: `is_guest=FALSE`, `customer_type=reseller`, `password!=NULL`
- **Admin**: `role=admin`

---

### 2. **balances** - Saldo User (Untuk Reseller)

```sql
CREATE TABLE balances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Balance
    balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Saldo utama (withdrawable)',
    bonus_balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Saldo bonus (non-withdrawable)',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique Constraint
    UNIQUE KEY unique_user_balance (user_id),
    
    -- Indexes
    INDEX idx_user_id (user_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Note:** 
- Retail/Guest: balance selalu 0 (tidak dipakai)
- Reseller: balance > 0 (pakai deposit system)

---

### 3. **balance_mutations** - History Mutasi Saldo

```sql
CREATE TABLE balance_mutations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    transaction_id BIGINT UNSIGNED NULL,
    
    -- Mutation Info
    type ENUM('credit', 'debit') NOT NULL COMMENT 'credit=masuk, debit=keluar',
    amount DECIMAL(15, 2) NOT NULL,
    
    -- Balance Snapshot (Audit Trail)
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    
    -- Description
    description VARCHAR(255) NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50) NULL COMMENT 'topup, purchase, refund, bonus, withdrawal, adjustment',
    reference_id BIGINT UNSIGNED NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_type (type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_date (user_id, created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Reference Types:**
- `topup` - Top up saldo
- `purchase` - Pembelian produk (potong saldo)
- `refund` - Pengembalian dana (transaksi gagal)
- `bonus` - Bonus/cashback
- `withdrawal` - Penarikan saldo
- `adjustment` - Penyesuaian manual oleh admin

---

### 4. **product_categories** - Kategori Produk

```sql
CREATE TABLE product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Category Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    
    -- Visual
    icon VARCHAR(255) NULL COMMENT 'Icon URL/path',
    image VARCHAR(255) NULL COMMENT 'Category image',
    
    -- Type
    type ENUM('game', 'pulsa', 'data', 'pln', 'emoney', 'voucher', 'streaming', 'other') NOT NULL,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_slug (slug),
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. **products** - Produk dari Digiflazz

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    
    -- Product Info
    digiflazz_code VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKU dari Digiflazz',
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    brand VARCHAR(100) NULL COMMENT 'Mobile Legends, Free Fire, dll',
    
    -- Type
    type ENUM('game', 'pulsa', 'data', 'pln', 'emoney', 'voucher', 'streaming', 'other') NOT NULL,
    
    -- Pricing
    base_price DECIMAL(15, 2) NOT NULL COMMENT 'Harga modal dari Digiflazz',
    retail_price DECIMAL(15, 2) NOT NULL COMMENT 'Harga untuk retail/guest customer',
    reseller_price DECIMAL(15, 2) NOT NULL COMMENT 'Harga untuk reseller (lebih murah)',
    admin_fee DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Biaya admin (opsional)',
    
    -- Profit (Auto calculated atau manual)
    retail_profit DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'retail_price - base_price',
    reseller_profit DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'reseller_price - base_price',
    
    -- Stock & Status
    stock_status ENUM('available', 'empty', 'maintenance') DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Featured di homepage',
    
    -- Additional Data (JSON)
    server_options JSON NULL COMMENT 'Server game: ["1001", "1002"]',
    input_fields JSON NULL COMMENT 'Fields yang diperlukan customer',
    
    -- Metadata
    total_sold INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    sort_order INT DEFAULT 0,
    
    -- Sync Info
    last_synced_at TIMESTAMP NULL COMMENT 'Last sync dengan Digiflazz',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_category_id (category_id),
    INDEX idx_digiflazz_code (digiflazz_code),
    INDEX idx_type (type),
    INDEX idx_stock_status (stock_status),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    INDEX idx_retail_price (retail_price),
    INDEX idx_reseller_price (reseller_price),
    INDEX idx_category_active (category_id, is_active, retail_price)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Pricing Logic:**
- `base_price`: Modal dari Digiflazz (misal: Rp 20,000)
- `retail_price`: Jual ke customer biasa (misal: Rp 24,000) → Profit Rp 4,000
- `reseller_price`: Jual ke reseller (misal: Rp 21,500) → Profit Rp 1,500

---

### 6. **transactions** - Transaksi Pembelian & Top Up

```sql
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Transaction Info
    transaction_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'TRX-20260131-XXXXX',
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL COMMENT 'NULL untuk top up saldo',
    
    -- Customer Type & Payment Type
    customer_type ENUM('retail', 'reseller') NOT NULL,
    payment_type ENUM('gateway', 'balance') NOT NULL DEFAULT 'gateway' COMMENT 'gateway=Tripay, balance=potong saldo',
    transaction_type ENUM('purchase', 'topup') DEFAULT 'purchase' COMMENT 'purchase=beli produk, topup=isi saldo',
    
    -- Product Info Snapshot (saat transaksi)
    product_name VARCHAR(255) NULL,
    product_code VARCHAR(100) NULL COMMENT 'Digiflazz SKU',
    product_price DECIMAL(15, 2) DEFAULT 0.00,
    admin_fee DECIMAL(15, 2) DEFAULT 0.00,
    total_price DECIMAL(15, 2) NOT NULL,
    
    -- Customer Input Data
    customer_data JSON NULL COMMENT 'user_id, zone_id, phone number, dll',
    customer_note TEXT NULL,
    
    -- Payment Info
    payment_method VARCHAR(50) NULL COMMENT 'QRIS, BCA VA, dll',
    payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT 'pending',
    
    -- Transaction Status
    status ENUM('pending', 'processing', 'success', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Digiflazz Response Data
    digiflazz_trx_id VARCHAR(100) NULL,
    digiflazz_serial_number TEXT NULL COMMENT 'Kode voucher/serial number',
    digiflazz_message TEXT NULL,
    digiflazz_status VARCHAR(50) NULL,
    
    -- Timestamps
    paid_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    expired_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_transaction_code (transaction_code),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_customer_type (customer_type),
    INDEX idx_payment_type (payment_type),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_payment_status (payment_status),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_status (user_id, status, created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Transaction Types:**
- **Purchase (Beli Produk)**: `transaction_type=purchase`, `product_id!=NULL`
- **Top Up Saldo**: `transaction_type=topup`, `product_id=NULL`

**Payment Flow:**
- **Retail/Guest**: `payment_type=gateway` (bayar via Tripay)
- **Reseller**: `payment_type=balance` (potong saldo) ATAU `payment_type=gateway` (untuk top up)

---

### 7. **payments** - Detail Pembayaran

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT UNSIGNED NOT NULL,
    
    -- Payment Reference
    payment_reference VARCHAR(100) UNIQUE NOT NULL COMMENT 'Reference dari Tripay',
    
    -- Payment Method
    payment_method VARCHAR(50) NOT NULL COMMENT 'QRIS, BRIVA, BCAVA, dll',
    payment_channel VARCHAR(50) NOT NULL COMMENT 'Nama channel dari Tripay',
    payment_code VARCHAR(100) NULL COMMENT 'VA number, QRIS code, dll',
    
    -- Amount
    amount DECIMAL(15, 2) NOT NULL,
    fee DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Fee dari payment gateway',
    total_amount DECIMAL(15, 2) NOT NULL COMMENT 'Amount yang harus dibayar customer',
    
    -- Status
    status ENUM('pending', 'paid', 'expired', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Tripay Data
    tripay_merchant_ref VARCHAR(100) NULL,
    tripay_customer_name VARCHAR(255) NULL,
    tripay_customer_email VARCHAR(255) NULL,
    tripay_customer_phone VARCHAR(20) NULL,
    
    -- Payment Info
    qr_url VARCHAR(255) NULL COMMENT 'URL QRIS code',
    checkout_url VARCHAR(255) NULL COMMENT 'Tripay checkout URL',
    
    -- Instructions (JSON)
    payment_instructions JSON NULL COMMENT 'Instruksi pembayaran dari Tripay',
    
    -- Timestamps
    expired_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_reference (payment_reference),
    INDEX idx_status (status),
    INDEX idx_status_date (status, created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8. **payment_callbacks** - Log Callback dari Payment Gateway

```sql
CREATE TABLE payment_callbacks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    
    -- Callback Data
    callback_data JSON NOT NULL COMMENT 'Full payload dari Tripay',
    signature VARCHAR(255) NOT NULL COMMENT 'Signature untuk validasi',
    ip_address VARCHAR(45) NOT NULL,
    
    -- Validation
    is_valid BOOLEAN DEFAULT TRUE COMMENT 'Signature valid?',
    processed BOOLEAN DEFAULT FALSE COMMENT 'Callback sudah diproses?',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_payment_id (payment_id),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 9. **transaction_logs** - Activity Log Transaksi

```sql
CREATE TABLE transaction_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT UNSIGNED NOT NULL,
    
    -- Status Change
    status_from VARCHAR(50) NULL,
    status_to VARCHAR(50) NOT NULL,
    
    -- Message
    message TEXT NULL,
    
    -- Additional Data
    meta_data JSON NULL COMMENT 'Additional info (error, response, dll)',
    
    -- Created By
    created_by BIGINT UNSIGNED NULL COMMENT 'Admin ID jika manual action',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 10. **banners** - Banner/Slider Promo

```sql
CREATE TABLE banners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Banner Info
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    link VARCHAR(255) NULL COMMENT 'URL redirect',
    description TEXT NULL,
    
    -- Type
    type ENUM('slider', 'popup', 'promo', 'banner') DEFAULT 'slider',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Schedule
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    
    -- Sort
    sort_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 11. **settings** - Pengaturan Aplikasi

```sql
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Setting Key
    `key` VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NULL,
    
    -- Type
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    
    -- Grouping
    `group` VARCHAR(50) NULL COMMENT 'general, payment, product, notification, dll',
    
    -- Description
    description TEXT NULL,
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Bisa diakses dari frontend API?',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_key (`key`),
    INDEX idx_group (`group`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Example Settings:**
```sql
INSERT INTO settings (`key`, value, type, `group`, is_public) VALUES
('app_name', 'TopUp Store', 'string', 'general', TRUE),
('app_logo', '/images/logo.png', 'string', 'general', TRUE),
('app_maintenance', 'false', 'boolean', 'general', TRUE),
('min_topup', '10000', 'number', 'payment', TRUE),
('max_topup', '10000000', 'number', 'payment', TRUE),
('retail_admin_fee', '1500', 'number', 'payment', TRUE),
('reseller_admin_fee', '0', 'number', 'payment', TRUE),
('tripay_api_key', 'xxx-xxx-xxx', 'string', 'payment', FALSE),
('tripay_private_key', 'xxx-xxx-xxx', 'string', 'payment', FALSE),
('tripay_merchant_code', 'T1234', 'string', 'payment', FALSE),
('digiflazz_username', 'username', 'string', 'product', FALSE),
('digiflazz_api_key', 'xxx-xxx-xxx', 'string', 'product', FALSE),
('whatsapp_api_key', 'xxx', 'string', 'notification', FALSE);
```

---

### 12. **notifications** - Notifikasi User

```sql
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Type
    type ENUM('info', 'success', 'warning', 'error', 'promo') DEFAULT 'info',
    
    -- Additional Data
    data JSON NULL COMMENT 'Transaction ID, product info, dll',
    
    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_read (user_id, is_read)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 13. **vouchers** - Voucher/Promo Code

```sql
CREATE TABLE vouchers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Voucher Info
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    
    -- Discount
    type ENUM('percentage', 'fixed') NOT NULL COMMENT 'percentage=%, fixed=nominal',
    value DECIMAL(15, 2) NOT NULL COMMENT 'Nilai diskon (10 = 10% atau Rp 10,000)',
    
    -- Conditions
    min_transaction DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Min. transaksi untuk pakai voucher',
    max_discount DECIMAL(15, 2) NULL COMMENT 'Max. diskon (untuk percentage)',
    
    -- Usage Limit
    usage_limit INT NULL COMMENT 'Total usage limit (NULL = unlimited)',
    usage_count INT DEFAULT 0,
    user_limit INT DEFAULT 1 COMMENT 'Berapa kali per user bisa pakai',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Schedule
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 14. **voucher_usages** - History Penggunaan Voucher

```sql
CREATE TABLE voucher_usages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    voucher_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    transaction_id BIGINT UNSIGNED NOT NULL,
    
    -- Discount Applied
    discount_amount DECIMAL(15, 2) NOT NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_voucher_id (voucher_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 15. **activity_logs** - System Activity Log

```sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User
    user_id BIGINT UNSIGNED NULL,
    
    -- Action
    action VARCHAR(100) NOT NULL COMMENT 'created, updated, deleted, login, dll',
    
    -- Model
    model VARCHAR(100) NULL COMMENT 'User, Product, Transaction, dll',
    model_id BIGINT UNSIGNED NULL,
    
    -- Description
    description TEXT NULL,
    
    -- Request Info
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Additional Data
    properties JSON NULL COMMENT 'Old values, new values, dll',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_model (model, model_id),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📊 RELATIONSHIPS SUMMARY

### Users → Other Tables
```
users (1) ----< (N) transactions
users (1) ----< (1) balances
users (1) ----< (N) balance_mutations
users (1) ----< (N) notifications
users (1) ----< (N) voucher_usages
users (1) ----< (N) activity_logs
users (1) ----< (N) transaction_logs (created_by)
```

### Products → Transactions
```
product_categories (1) ----< (N) products
products (1) ----< (N) transactions
```

### Transactions → Payments & Logs
```
transactions (1) ----< (1) payments
transactions (1) ----< (N) transaction_logs
payments (1) ----< (N) payment_callbacks
```

### Vouchers
```
vouchers (1) ----< (N) voucher_usages
```

---

## 🎯 KEY DIFFERENCES FROM PREVIOUS VERSION

### ✅ **NEW/UPDATED Fields:**

**users table:**
- ✅ `customer_type` ENUM('retail', 'reseller')
- ✅ `is_guest` BOOLEAN
- ✅ `password` NULL (untuk guest)

**products table:**
- ✅ `retail_price` DECIMAL
- ✅ `reseller_price` DECIMAL
- ✅ `retail_profit` DECIMAL
- ✅ `reseller_profit` DECIMAL

**transactions table:**
- ✅ `customer_type` ENUM('retail', 'reseller')
- ✅ `payment_type` ENUM('gateway', 'balance')
- ✅ `transaction_type` ENUM('purchase', 'topup')

---

## 📈 SAMPLE DATA

### Example Users

```sql
-- Admin
INSERT INTO users (name, email, phone, password, role, customer_type, is_guest) VALUES
('Admin', 'admin@topupstore.com', '081234567890', '$2y$10$...', 'admin', 'retail', FALSE);

-- Guest User (belum set password)
INSERT INTO users (name, email, phone, password, role, customer_type, is_guest) VALUES
('Guest User', 'john@email.com', '081234567891', NULL, 'customer', 'retail', TRUE);

-- Registered Retail
INSERT INTO users (name, email, phone, password, role, customer_type, is_guest) VALUES
('John Doe', 'john.registered@email.com', '081234567892', '$2y$10$...', 'customer', 'retail', FALSE);

-- Reseller
INSERT INTO users (name, email, phone, password, role, customer_type, is_guest) VALUES
('Jane Store', 'jane@store.com', '081234567893', '$2y$10$...', 'customer', 'reseller', FALSE);
```

### Example Products

```sql
INSERT INTO products (category_id, digiflazz_code, name, brand, type, base_price, retail_price, reseller_price, retail_profit, reseller_profit, stock_status, is_active) VALUES
(1, 'ML86', 'Mobile Legends 86 Diamonds', 'Mobile Legends', 'game', 20000, 24000, 21500, 4000, 1500, 'available', TRUE),
(1, 'FF100', 'Free Fire 100 Diamonds', 'Free Fire', 'game', 15000, 18000, 16000, 3000, 1000, 'available', TRUE),
(2, 'TSEL10', 'Telkomsel 10.000', 'Telkomsel', 'pulsa', 10000, 12000, 10500, 2000, 500, 'available', TRUE);
```

---

## 🔧 TRIGGERS (Optional)

### Auto Calculate Profit

```sql
DELIMITER $$

CREATE TRIGGER before_product_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    SET NEW.retail_profit = NEW.retail_price - NEW.base_price;
    SET NEW.reseller_profit = NEW.reseller_price - NEW.base_price;
END$$

CREATE TRIGGER before_product_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    SET NEW.retail_profit = NEW.retail_price - NEW.base_price;
    SET NEW.reseller_profit = NEW.reseller_price - NEW.base_price;
END$$

DELIMITER ;
```

### Auto Create Balance on User Register

```sql
DELIMITER $$

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO balances (user_id, balance, bonus_balance)
    VALUES (NEW.id, 0, 0);
END$$

DELIMITER ;
```

---

## 📝 MIGRATION ORDER

Urutan pembuatan tabel (untuk avoid foreign key error):

```
1. users
2. balances
3. product_categories
4. products
5. transactions
6. payments
7. payment_callbacks
8. transaction_logs
9. balance_mutations
10. notifications
11. vouchers
12. voucher_usages
13. banners
14. settings
15. activity_logs
```

---

## ✅ DATABASE READY!

Database ini sudah siap mendukung:
- ✅ Guest Checkout (auto-create user)
- ✅ Retail Customer (bayar langsung)
- ✅ Reseller (deposit system)
- ✅ Top Up & Purchase transactions
- ✅ Multiple payment methods
- ✅ Voucher/Promo system
- ✅ Complete audit trail
- ✅ Notification system

**Next Step:** Generate Laravel Migrations! 🚀
