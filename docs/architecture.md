# System Architecture & Database Structure

## 🏗️ Architecture Overview

The system is built as a Docker-integrated Laravel backend with a Next.js/Flutter frontend (profile-based).

### Service Details

- **Backend (PHP-FPM)**: Running on port 9000 (Internal), handled by Nginx on port 8000.
- **Database (MySQL 8.0)**: Accessible on port 3307.
- **Redis**: Used for caching and queue management on port 6379.
- **Queue Worker**: Handles background jobs (e.g., Digiflazz order processing).
- **Scheduler**: Manages cron tasks like product syncing.

---

## 🗄️ Database Structure

### Core Entity Relationship (ERD)

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : places
    USERS ||--|| BALANCES : has
    USERS ||--o{ BALANCE_MUTATIONS : track
    USERS ||--o{ NOTIFICATIONS : receives
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ TRANSACTIONS : part_of
    TRANSACTIONS ||--|| PAYMENTS : has
    TRANSACTIONS ||o--o{ TRANSACTION_LOGS : logs
    PAYMENTS ||--o{ PAYMENT_CALLBACKS : receives
    VOUCHERS ||--o{ VOUCHER_USAGES : used_in
```

### Table Definitions

#### 1. Users

Manages Guest, Retail, Reseller, and Admin accounts.

- `role`: admin, customer.
- `customer_type`: retail, reseller.
- `is_guest`: TRUE/FALSE.

#### 2. Products & Categories

- `products`: Integrated with Digiflazz SKUs. Supports tiered pricing (retail vs reseller) and dynamic input fields.
- `product_categories`: Grouping by type (game, pulsa, etc.).

#### 3. Transactions & Payments

- `transactions`: Central log for purchases and top-ups.
- `payments`: Tracks payment gateway (Tripay) statuses and methods (QRIS, VA, etc.).
- `balance_mutations`: Detailed history of all wallet movements for resellers.

#### 4. System Logs

- `activity_logs`: General system actions.
- `transaction_logs`: Specific status transitions for orders.

---

## 🔄 Core Data Flows

### API Request Flow

1. User Request → Backend Nginx (8000)
2. Nginx → PHP-FPM (Backend)
3. Backend → MySQL/Redis
4. Response → User

### Order Processing Flow (Digiflazz)

1. Payment PAID (via Tripay Callback)
2. Trigger `ProcessDigiflazzOrder` Job
3. Job pushed to Redis Queue
4. Queue Worker executes job → Call Digiflazz API
5. SN (Serial Number) received → Complete Transaction
6. Notify User
