# Docker Compose Setup Guide

## 📋 Struktur File Docker

```
new-me/
├── docker-compose.yml           # Main compose file (development)
├── docker-compose.prod.yml      # Production compose file (optional)
├── .env.example                 # Docker environment template
├── README.md                    # Main documentation
│
├── backend/
│   ├── Dockerfile               # Backend Docker image
│   ├── .dockerignore           # Backend ignore file
│   ├── .env.example            # Backend environment template
│   └── docker/
│       ├── nginx/
│       │   └── conf.d/
│       │       └── default.conf
│       └── php/
│           └── local.ini
│
└── frontend/
    ├── Dockerfile               # Frontend Docker image
    └── .dockerignore           # Frontend ignore file
```

## 🚀 Quick Start

### 1. First Time Setup

```bash
# 1. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Edit backend/.env
# Update database credentials, API keys, etc.

# 3. Start all services
docker-compose up -d

# 4. Wait for containers to be ready (check with)
docker-compose ps

# 5. Install backend dependencies
docker-compose exec backend composer install

# 6. Generate application key
docker-compose exec backend php artisan key:generate

# 7. Run database migrations
docker-compose exec backend php artisan migrate

# 8. (Optional) Seed database
docker-compose exec backend php artisan db:seed

# 9. (Optional) Sync Digiflazz products
docker-compose exec backend php artisan digiflazz:sync-products
```

### 2. Daily Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Service Details

### Backend Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| backend | enstore-backend | - | PHP-FPM (Laravel) |
| backend-nginx | enstore-backend-nginx | 8000 | Nginx web server |
| queue | enstore-queue | - | Laravel queue worker |
| scheduler | enstore-scheduler | - | Laravel task scheduler |

### Frontend Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| frontend | enstore-frontend | 3000 | Next.js development server |

### Database & Cache

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| db | enstore-db | 3307 | MySQL 8.0 |
| redis | enstore-redis | 6379 | Redis cache & queue |
| phpmyadmin | enstore-phpmyadmin | 8080 | Database UI |

## 📝 Common Commands

### Backend Commands

```bash
# Run artisan commands
docker-compose exec backend php artisan <command>

# Examples:
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:list
docker-compose exec backend php artisan queue:work
docker-compose exec backend php artisan digiflazz:sync-products

# Composer commands
docker-compose exec backend composer install
docker-compose exec backend composer update
docker-compose exec backend composer dump-autoload

# Access backend container
docker-compose exec backend bash
```

### Frontend Commands

```bash
# NPM commands
docker-compose exec frontend npm install
docker-compose exec frontend npm run build
docker-compose exec frontend npm run lint

# Access frontend container
docker-compose exec frontend sh
```

### Database Commands

```bash
# Access MySQL CLI
docker-compose exec db mysql -u enstore_db_user -p enstore

# Backup database
docker-compose exec db mysqldump -u root -proot enstore > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -proot enstore < backup.sql

# Access phpMyAdmin
# Open browser: http://localhost:8080
# Server: db
# Username: root
# Password: root
```

### Redis Commands

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Clear all cache
docker-compose exec redis redis-cli FLUSHALL

# Monitor Redis
docker-compose exec redis redis-cli MONITOR
```

## 🐛 Troubleshooting

### Container tidak bisa start

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild service
docker-compose up -d --build <service-name>
```

### Port sudah digunakan

Edit `docker-compose.yml` dan ubah port mapping:

```yaml
ports:
  - "3001:3000"  # Change from 3000 to 3001
```

### Permission errors (Linux/Mac)

```bash
# Fix storage permissions
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
```

### Database connection refused

```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait 10-15 seconds for database to be ready
```

### Frontend hot reload tidak bekerja

Pada Windows, tambahkan di `frontend/next.config.ts`:

```typescript
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}
```

### Queue tidak memproses jobs

```bash
# Check queue worker logs
docker-compose logs queue

# Restart queue worker
docker-compose restart queue

# Manually process queue
docker-compose exec backend php artisan queue:work --once
```

## 🔄 Update & Maintenance

### Update dependencies

```bash
# Backend
docker-compose exec backend composer update

# Frontend
docker-compose exec frontend npm update
```

### Rebuild containers

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: deletes database)
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### Environment Variables

Production `.env` should have:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_HOST=db
REDIS_HOST=redis

TRIPAY_MODE=production
```

## 📊 Monitoring

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f queue

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check resource usage

```bash
# Container stats
docker stats

# Specific container
docker stats enstore-backend
```

## 🔐 Security Notes

1. **Change default passwords** in production
2. **Use environment variables** for sensitive data
3. **Don't commit** `.env` files
4. **Use HTTPS** in production
5. **Limit exposed ports** in production
6. **Regular updates** of base images

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Guide](https://laravel.com/docs/sail)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
