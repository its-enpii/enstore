# Redis Configuration Guide

## 📋 Current Status

**Cache & Queue:** Currently using `database`
**Redis:** Configured but not active

## 🎯 Why Use Redis?

### Benefits
- ✅ **Faster Cache** - In-memory storage (100x faster than database)
- ✅ **Better Queue Performance** - Process background jobs efficiently
- ✅ **Scalable** - Can handle millions of operations per second
- ✅ **Production Ready** - Industry standard for caching & queuing

### Use Cases in Enstore
1. **Product Caching** - Cache product lists (5 minutes)
2. **Digiflazz Price List** - Cache API response (1 hour)
3. **Category Caching** - Cache categories with product count
4. **Queue Jobs** - Process Digiflazz orders, send notifications
5. **Session Storage** - Store user sessions (optional)

---

## 🚀 How to Enable Redis

### Option 1: Quick Enable (Recommended for Docker)

**Step 1:** Update `backend/.env`
```env
# Change these lines:
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis        # ← Important for Docker!
```

**Step 2:** Rebuild backend container
```bash
docker-compose down
docker-compose up -d --build backend
```

**Step 3:** Clear cache
```bash
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
```

**Step 4:** Restart queue worker
```bash
docker-compose restart queue
```

**Done!** ✅

---

### Option 2: Manual Configuration

#### 1. Update `.env` File

```env
# ==================== CACHE CONFIGURATION ====================
# Change from 'database' to 'redis'
CACHE_STORE=redis

# ==================== QUEUE CONFIGURATION ====================
# Change from 'database' to 'redis'
QUEUE_CONNECTION=redis

# ==================== REDIS CONFIGURATION ====================
REDIS_CLIENT=phpredis
REDIS_HOST=redis              # ← Use container name for Docker
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0                    # Database 0 for general use
REDIS_CACHE_DB=1              # Database 1 for cache
```

#### 2. Verify Redis Extension

```bash
# Check if Redis extension is installed
docker-compose exec backend php -m | grep redis

# Should output: redis
```

If not installed, rebuild:
```bash
docker-compose up -d --build backend
```

#### 3. Test Redis Connection

```bash
# Access backend container
docker-compose exec backend bash

# Test Redis connection
php artisan tinker
>>> Cache::put('test_key', 'Hello Redis!', 60);
>>> Cache::get('test_key');
# Should return: "Hello Redis!"

>>> exit
```

#### 4. Test Queue with Redis

```bash
# Dispatch a test job
php artisan tinker
>>> dispatch(function() { \Log::info('Test job from Redis queue'); });
>>> exit

# Check queue worker logs
docker-compose logs queue

# Should see the job being processed
```

---

## 🔍 Verification Checklist

After enabling Redis, verify:

- [ ] **Cache works**
  ```bash
  docker-compose exec backend php artisan tinker
  >>> Cache::put('test', 'works', 60);
  >>> Cache::get('test');
  ```

- [ ] **Queue works**
  ```bash
  docker-compose logs queue
  # Should show: "Processing jobs from redis connection"
  ```

- [ ] **Redis container running**
  ```bash
  docker-compose ps redis
  # Should show: Up
  ```

- [ ] **No errors in logs**
  ```bash
  docker-compose logs backend | grep -i error
  docker-compose logs queue | grep -i error
  ```

---

## 📊 Performance Comparison

### Cache Performance

| Operation | Database | Redis | Improvement |
|-----------|----------|-------|-------------|
| Read (1 item) | ~5ms | ~0.05ms | **100x faster** |
| Write (1 item) | ~10ms | ~0.1ms | **100x faster** |
| Read (1000 items) | ~500ms | ~5ms | **100x faster** |

### Queue Performance

| Metric | Database | Redis | Improvement |
|--------|----------|-------|-------------|
| Jobs/second | ~10 | ~1000 | **100x faster** |
| Latency | ~100ms | ~1ms | **100x faster** |
| Concurrent workers | 1-2 | 10+ | **Scalable** |

---

## 🐛 Troubleshooting

### Issue: "Class 'Redis' not found"

**Solution:** Redis extension not installed
```bash
docker-compose up -d --build backend
```

### Issue: "Connection refused to redis:6379"

**Solution 1:** Check Redis container
```bash
docker-compose ps redis
docker-compose logs redis
```

**Solution 2:** Check REDIS_HOST in `.env`
```env
REDIS_HOST=redis  # ← Must be 'redis' for Docker
```

**Solution 3:** Restart containers
```bash
docker-compose restart backend queue
```

### Issue: Queue jobs not processing

**Solution:** Restart queue worker
```bash
docker-compose restart queue
docker-compose logs queue
```

### Issue: Cache not clearing

**Solution:** Clear all cache
```bash
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear
docker-compose exec backend php artisan view:clear
```

---

## 🔧 Advanced Configuration

### Separate Redis Databases

```env
REDIS_DB=0              # Default connection
REDIS_CACHE_DB=1        # Cache connection
REDIS_SESSION_DB=2      # Session connection (if using Redis for sessions)
```

### Redis Persistence

Redis in Docker is configured with persistence by default:
```yaml
# In docker-compose.yml
volumes:
  - redisdata:/data
```

### Monitor Redis

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Monitor commands in real-time
MONITOR

# Check memory usage
INFO memory

# List all keys
KEYS *

# Get cache statistics
INFO stats
```

---

## 📝 Configuration Files Reference

### 1. `.env`
```env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### 2. `config/cache.php`
```php
'default' => env('CACHE_STORE', 'database'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_CACHE_CONNECTION', 'cache'),
    ],
],
```

### 3. `config/queue.php`
```php
'default' => env('QUEUE_CONNECTION', 'database'),

'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
    ],
],
```

### 4. `config/database.php`
```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    
    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],
    
    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],
],
```

---

## 🎯 Recommendation

### For Development (Current)
**Keep using database** if:
- ✅ Simple setup
- ✅ No performance issues yet
- ✅ Learning the system

### For Production (Recommended)
**Switch to Redis** because:
- ✅ Much better performance
- ✅ Can handle high traffic
- ✅ Industry standard
- ✅ Already configured in Docker

---

## 🚀 Quick Start Commands

```bash
# Enable Redis (all-in-one)
# 1. Update .env: CACHE_STORE=redis, QUEUE_CONNECTION=redis, REDIS_HOST=redis
# 2. Run:
docker-compose down
docker-compose up -d --build backend
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose restart queue

# Verify
docker-compose exec backend php artisan tinker
>>> Cache::put('test', 'works', 60);
>>> Cache::get('test');
>>> exit

# Monitor
docker-compose logs -f queue
docker-compose exec redis redis-cli MONITOR
```

---

## 📚 Additional Resources

- [Laravel Redis Documentation](https://laravel.com/docs/redis)
- [Redis Documentation](https://redis.io/documentation)
- [phpredis GitHub](https://github.com/phpredis/phpredis)

---

**Status:** Redis is configured and ready to use. Just update `.env` and rebuild! 🚀
