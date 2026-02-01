# Enstore - Docker Architecture

## 🏗️ Current Architecture (Backend Only)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Network                          │
│                          (enstore)                              │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Backend    │      │   Backend    │      │    MySQL     │ │
│  │  (PHP-FPM)   │◄────►│    Nginx     │      │  Database    │ │
│  │              │      │              │      │              │ │
│  │ Port: -      │      │ Port: 8000   │      │ Port: 3307   │ │
│  └──────┬───────┘      └──────────────┘      └──────┬───────┘ │
│         │                                            │         │
│         │              ┌──────────────┐              │         │
│         └─────────────►│    Redis     │◄─────────────┘         │
│                        │ Cache/Queue  │                        │
│                        │ Port: 6379   │                        │
│                        └──────────────┘                        │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │    Queue     │      │  Scheduler   │      │  phpMyAdmin  │ │
│  │   Worker     │      │   (Cron)     │      │              │ │
│  │              │      │              │      │ Port: 8080   │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔮 Future Architecture (When Frontend & Flutter Ready)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Network                          │
│                          (enstore)                              │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Frontend   │      │   Backend    │      │   Backend    │ │
│  │   (Next.js)  │─────►│  (PHP-FPM)   │◄────►│    Nginx     │ │
│  │              │      │              │      │              │ │
│  │ Port: 3000   │      │ Port: -      │      │ Port: 8000   │ │
│  └──────────────┘      └──────┬───────┘      └──────────────┘ │
│                               │                                │
│  ┌──────────────┐             │              ┌──────────────┐ │
│  │  Flutter Web │             │              │    MySQL     │ │
│  │              │             │              │  Database    │ │
│  │ Port: 5000   │             │              │ Port: 3307   │ │
│  └──────────────┘             │              └──────┬───────┘ │
│                               │                     │         │
│                               │  ┌──────────────┐   │         │
│                               └─►│    Redis     │◄──┘         │
│                                  │ Cache/Queue  │             │
│                                  │ Port: 6379   │             │
│                                  └──────────────┘             │
│                                                                │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐│
│  │    Queue     │      │  Scheduler   │      │  phpMyAdmin  ││
│  │   Worker     │      │   (Cron)     │      │              ││
│  │              │      │              │      │ Port: 8080   ││
│  └──────────────┘      └──────────────┘      └──────────────┘│
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Service Details

### Active Services (Default)

| Service | Container Name | Port | Internal Port | Description |
|---------|---------------|------|---------------|-------------|
| **backend** | enstore-backend | - | 9000 | PHP-FPM Application |
| **backend-nginx** | enstore-backend-nginx | 8000 | 80 | Web Server |
| **db** | enstore-db | 3307 | 3306 | MySQL Database |
| **redis** | enstore-redis | 6379 | 6379 | Cache & Queue |
| **queue** | enstore-queue | - | - | Background Jobs |
| **scheduler** | enstore-scheduler | - | - | Cron Tasks |
| **phpmyadmin** | enstore-phpmyadmin | 8080 | 80 | DB Management |

### Disabled Services (Profiles)

| Service | Container Name | Port | Profile | Status |
|---------|---------------|------|---------|--------|
| **frontend** | enstore-frontend | 3000 | `frontend` | ⏸️ Not Ready |
| **flutter-web** | enstore-flutter-web | 5000 | `flutter` | ⏸️ Not Ready |

## 🔄 Data Flow

### 1. API Request Flow
```
User Browser
    ↓
Backend Nginx (Port 8000)
    ↓
PHP-FPM (Backend)
    ↓
MySQL Database / Redis Cache
    ↓
Response back to User
```

### 2. Background Job Flow
```
API creates Job
    ↓
Job pushed to Redis Queue
    ↓
Queue Worker picks up Job
    ↓
Job processes (e.g., Digiflazz order)
    ↓
Updates Database
    ↓
Creates Notification
```

### 3. Scheduled Task Flow
```
Scheduler runs every minute
    ↓
Checks scheduled tasks
    ↓
Executes due tasks (e.g., sync products)
    ↓
Updates Database
    ↓
Logs to activity_logs
```

## 🌐 Network Configuration

### Internal Communication
- All services communicate via Docker network `enstore`
- Services use container names as hostnames
- Example: Backend connects to `db:3306` (not `localhost:3307`)

### External Access
- Only specific ports are exposed to host machine
- Port mapping: `HOST:CONTAINER`
- Example: `8000:80` means host port 8000 → container port 80

## 💾 Volume Configuration

### Persistent Volumes
```
dbdata:     MySQL database files
redisdata:  Redis persistence files
```

### Bind Mounts
```
./backend:/var/www                    Backend code
./frontend:/app                       Frontend code (when enabled)
./backend/docker/nginx:/etc/nginx     Nginx config
```

## 🔐 Security Considerations

### Current Setup (Development)
- ✅ Isolated network
- ✅ Non-root users in containers
- ⚠️ Database exposed on 3307 (for development)
- ⚠️ Default passwords (should change in production)

### Production Recommendations
- 🔒 Change all default passwords
- 🔒 Use secrets management
- 🔒 Don't expose database port
- 🔒 Use HTTPS/SSL
- 🔒 Enable firewall rules
- 🔒 Regular security updates

## 📈 Scaling Options

### Horizontal Scaling
```yaml
# Add more queue workers
docker-compose up -d --scale queue=3

# Add more backend instances (with load balancer)
docker-compose up -d --scale backend=2
```

### Vertical Scaling
```yaml
# Add resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## 🔧 Environment Variables

### Backend (.env)
```
DB_HOST=db              # ← Container name, not localhost
DB_PORT=3306            # ← Internal port, not 3307
REDIS_HOST=redis        # ← Container name
QUEUE_CONNECTION=redis
```

### Frontend (.env.local) - When Enabled
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚀 Deployment Modes

### Development (Current)
```bash
docker-compose up -d
```

### With Frontend (When Ready)
```bash
docker-compose --profile frontend up -d
```

### Production (Future)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Notes

1. **Frontend & Flutter are disabled by default** - Use profiles to enable
2. **Database takes 10-15 seconds to be ready** - Wait before running migrations
3. **Queue worker auto-restarts** - If job fails, it will retry
4. **Scheduler runs every minute** - Checks for due tasks
5. **All logs are persistent** - Check with `docker-compose logs`
