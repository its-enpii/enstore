# Setup & Installation Guide

## 🚀 Quick Start (Docker)

### 1. Initial Setup

```bash
# 1. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Start all services
docker-compose up -d

# 3. Install dependencies
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
```

### 2. Daily Development

- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`
- **Logs**: `docker-compose logs -f`

---

## 🔧 Service Configuration

### Main Services

| Service | Container             | Port | Description       |
| ------- | --------------------- | ---- | ----------------- |
| backend | enstore-backend       | -    | PHP-FPM (Laravel) |
| nginx   | enstore-backend-nginx | 8000 | Web Server        |
| db      | enstore-db            | 3307 | MySQL 8.0         |
| redis   | enstore-redis         | 6379 | Cache & Queue     |
| pma     | enstore-phpmyadmin    | 8080 | DB Management     |

### Enabling Redis (Cache & Queue)

To enable Redis for better performance:

1. Update `backend/.env`:
   ```env
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis
   REDIS_HOST=redis
   ```
2. Restart services:
   ```bash
   docker-compose down && docker-compose up -d
   docker-compose restart queue
   ```

---

## 📝 Environment Variables (.env)

### Backend Important Keys

- `APP_URL`: your app domain.
- `DB_HOST`: set to `db` (container name).
- `REDIS_HOST`: set to `redis`.
- `TRIPAY_*`: Payment gateway credentials.
- `DIGIFLAZZ_*`: Digital product provider credentials.

---

## 🐛 Troubleshooting

### Common Issues

- **Permission Denied**: Run `chmod -R 777 backend/storage backend/bootstrap/cache`.
- **Database Connection Refused**: Wait 10-15s for MySQL to initialize.
- **Port Conflict**: Change ports in root `docker-compose.yml` if 8000/3307/6379 are taken.

### Maintenance Commands

```bash
# Clear all Laravel cache
docker-compose exec backend php artisan optimize:clear

# Rebuild specific container
docker-compose up -d --build backend
```

### 🌍 Production Deployment

For production, use the production compose file:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🏗️ Profiles & Optional Services

Some services like Frontend (Next.js) and Flutter are disabled by default. Use Docker profiles to enable them:

```bash
# Enable Frontend
docker-compose --profile frontend up -d

# Enable Flutter
docker-compose --profile flutter up -d

# Enable All
docker-compose --profile frontend --profile flutter up -d
```
