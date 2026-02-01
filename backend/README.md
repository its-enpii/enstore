# 🛒 EnStore - Pro Gaming Store Engine
> Modern, High-Performance Game Top-up & PPOB Marketplace Backend.

![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?style=for-the-badge&logo=php)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis)

## 📋 Features
- **Hierarchical Product System**: Manage Games and Variants (Items) with ease.
- **Automated Sync**: Real-time product & price synchronization with Digiflazz.
- **Guest Checkout**: Allow users to buy without creating an account.
- **Multiple Payment Gateways**: Integrated with Tripay (QRIS, E-Wallet, VA, Retail Outlets).
- **Balance System**: Internal wallet for registered members & resellers.
- **Role-Based Pricing**: Differentiated pricing for Retail and Reseller levels.
- **Real-time Notifications**: Notify users about transaction status changes.

---

## 🚀 Quick Start

### 1. Requirements
- Docker & Docker Compose
- PHP 8.1+ (for local development)
- Composer

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/enpiistudio/enstore.git
cd enstore/backend

# Copy environment file
cp .env.example .env

# Start Docker environment
docker-compose up -d

# Install dependencies & run migrations
docker-compose exec backend composer install
docker-compose exec backend php artisan migrate:fresh --seed
docker-compose exec backend php artisan key:generate
```

### 3. Synchronize Products
```bash
docker-compose exec backend php artisan digiflazz:sync-products
```

---

## 📖 API Documentation
Detailed documentation for all modules can be found in the `docs/` directory:

- 🔐 [Authentication API](docs/AUTH_API_DOCUMENTATION.md)
- 👤 [Customer & Public API](docs/CUSTOMER_API_ENDPOINTS.md)
- 🛠️ [Admin Dashboard API](docs/ADMIN_API_ENDPOINTS.md)
- 💎 [Model Relationships](docs/MODEL_RELATIONSHIPS.md)

---

## 🔧 Core Integrations
guides for external services:
- [Digiflazz Guide](docs/DIGIFLAZZ_GUIDE.md) - Product provider setup.
- [Tripay Integration](docs/TRIPAY_INTEGRATION.md) - Payment gateway setup.

---

## 🏛️ Project Structure
```text
backend/
├── app/
│   ├── Http/Controllers/Api/  # Unified API Controllers
│   ├── Services/              # Core Business Logic (Tripay, Digiflazz, Transaction)
│   ├── Models/                # Database Entities
│   └── Jobs/                  # Background Processing
├── database/                  # Migrations & Seeders
├── docs/                      # 📚 Project Documentation
└── routes/api.php             # API Route Definitions
```

---
*Created with ❤️ by Enpii Studio*
