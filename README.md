# Enstore - Digital Product Store Platform

Platform penjualan produk digital (voucher game, pulsa, PLN, e-money, dll) dengan integrasi Tripay (payment gateway) dan Digiflazz (product provider).

## 🚀 Quick Start dengan Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- Git

### Menjalankan Semua Aplikasi (Backend + Frontend + Database)

```bash
# Clone repository
git clone <repository-url>
cd new-me

# Copy environment file
cp backend/.env.example backend/.env

# Edit .env sesuai kebutuhan (opsional)
# nano backend/.env

# Jalankan semua services
docker-compose up -d

# Tunggu beberapa saat, lalu install dependencies backend
docker-compose exec backend composer install

# Generate application key
docker-compose exec backend php artisan key:generate

# Run migrations
docker-compose exec backend php artisan migrate

# Seed database (optional)
docker-compose exec backend php artisan db:seed
```

### 🎯 Akses Aplikasi

Setelah semua container berjalan, Anda bisa mengakses:

| Service | URL | Description | Status |
|---------|-----|-------------|--------|
| **Backend API** | http://localhost:8000 | Laravel API | ✅ Active |
| **phpMyAdmin** | http://localhost:8080 | Database Management | ✅ Active |
| **MySQL** | localhost:3307 | Database (user: enstore_db_user, pass: enstore_db_password) | ✅ Active |
| **Redis** | localhost:6379 | Cache & Queue | ✅ Active |
| **Frontend** | http://localhost:3000 | Next.js Frontend | ⏸️ Disabled (Not Ready) |

**Note:** Frontend dan Flutter saat ini **disabled by default** karena belum ready. Untuk mengaktifkan:
```bash
# Jalankan dengan frontend
docker-compose --profile frontend up -d

# Jalankan dengan flutter (ketika sudah ready)
docker-compose --profile flutter up -d

# Jalankan dengan keduanya
docker-compose --profile frontend --profile flutter up -d
```

### 📦 Services yang Berjalan

**Active Services (Default):**

1. **backend** - Laravel API (PHP 8.4-FPM)
2. **backend-nginx** - Nginx untuk Backend
3. **db** - MySQL 8.0 Database
4. **redis** - Redis Cache & Queue
5. **queue** - Laravel Queue Worker
6. **scheduler** - Laravel Task Scheduler
7. **phpmyadmin** - Database Management UI

**Disabled Services (Not Ready Yet):**

- **frontend** - Next.js Frontend (enable dengan `--profile frontend`)
- **flutter-web** - Flutter Web App (enable dengan `--profile flutter`)

**Mengaktifkan Frontend/Flutter:**
```bash
# Hanya backend (default)
docker-compose up -d

# Dengan frontend
docker-compose --profile frontend up -d

# Dengan flutter (ketika sudah ready)
docker-compose --profile flutter up -d

# Semua services
docker-compose --profile frontend --profile flutter up -d
```

### 🛠️ Perintah Docker Compose

```bash
# Start semua services
docker-compose up -d

# Stop semua services
docker-compose down

# Lihat logs
docker-compose logs -f

# Lihat logs service tertentu
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service tertentu
docker-compose restart backend
docker-compose restart frontend

# Rebuild services
docker-compose up -d --build

# Masuk ke container backend
docker-compose exec backend bash

# Masuk ke container frontend
docker-compose exec frontend sh

# Stop dan hapus semua (termasuk volumes)
docker-compose down -v
```

### 🔧 Development Commands

#### Backend (Laravel)

```bash
# Install dependencies
docker-compose exec backend composer install

# Run migrations
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed

# Clear cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Run tests
docker-compose exec backend php artisan test

# Sync Digiflazz products
docker-compose exec backend php artisan digiflazz:sync-products

# Check queue status
docker-compose exec backend php artisan queue:work --once
```

#### Frontend (Next.js)

```bash
# Install dependencies
docker-compose exec frontend npm install

# Build for production
docker-compose exec frontend npm run build

# Run linter
docker-compose exec frontend npm run lint
```

## 📁 Struktur Project

```
new-me/
├── backend/                 # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── docker/
│   │   ├── nginx/
│   │   └── php/
│   ├── Dockerfile
│   └── .env
├── frontend/                # Next.js Frontend
│   ├── app/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Main Docker Compose file
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)

```env
APP_NAME=Enstore
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=enstore
DB_USERNAME=enstore_db_user
DB_PASSWORD=enstore_db_password

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

QUEUE_CONNECTION=redis

# Tripay Configuration
TRIPAY_API_KEY=your_api_key
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_MODE=sandbox

# Digiflazz Configuration
DIGIFLAZZ_USERNAME=your_username
DIGIFLAZZ_API_KEY=your_api_key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `backend/`:

- [DATABASE_LOGGING.md](backend/DATABASE_LOGGING.md) - Database logging strategy
- [TRIPAY_INTEGRATION.md](backend/TRIPAY_INTEGRATION.md) - Tripay payment gateway
- [DIGIFLAZZ_INTEGRATION.md](backend/DIGIFLAZZ_INTEGRATION.md) - Digiflazz product provider
- [CORE_BUSINESS_LOGIC.md](backend/CORE_BUSINESS_LOGIC.md) - Business logic services
- [AUTH_API_DOCUMENTATION.md](backend/AUTH_API_DOCUMENTATION.md) - Authentication API
- [ADMIN_API_ENDPOINTS.md](backend/ADMIN_API_ENDPOINTS.md) - Admin API
- [CUSTOMER_API_ENDPOINTS.md](backend/CUSTOMER_API_ENDPOINTS.md) - Customer API

## 🐛 Troubleshooting

### Port sudah digunakan

Jika port 3000, 8000, atau 3307 sudah digunakan, edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:80"    # Backend
  - "3308:3306"  # MySQL
```

### Permission errors (Linux/Mac)

```bash
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
```

### Database connection refused

```bash
# Restart database container
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Queue not processing

```bash
# Restart queue worker
docker-compose restart queue

# Check queue logs
docker-compose logs queue
```

## 🚀 Production Deployment

Untuk production, gunakan:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 License

This project is proprietary software.

## 👨‍💻 Developer

Developed by Enpii Studio
