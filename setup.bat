@echo off
REM Enstore - Setup Script for Windows
REM This script helps you set up the development environment

echo.
echo ================================
echo   Enstore Setup Script
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Step 1: Copy environment files
echo [Step 1] Setting up environment files...
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Created .env file
) else (
    echo [SKIP] .env already exists
)

if not exist backend\.env (
    copy backend\.env.example backend\.env >nul
    echo [OK] Created backend\.env file
) else (
    echo [SKIP] backend\.env already exists
)

echo.

REM Step 2: Start Docker containers
echo [Step 2] Starting Docker containers...
docker-compose up -d

echo [WAIT] Waiting for containers to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo.

REM Step 3: Install backend dependencies
echo [Step 3] Installing backend dependencies...
docker-compose exec -T backend composer install --no-interaction

echo.

REM Step 4: Generate application key
echo [Step 4] Generating application key...
docker-compose exec -T backend php artisan key:generate --no-interaction

echo.

REM Step 5: Run migrations
echo [Step 5] Running database migrations...
docker-compose exec -T backend php artisan migrate --no-interaction

echo.

REM Step 6: Ask about seeding
set /p SEED="Do you want to seed the database? (y/n): "
if /i "%SEED%"=="y" (
    echo [SEED] Seeding database...
    docker-compose exec -T backend php artisan db:seed --no-interaction
)

echo.

REM Step 7: Ask about syncing products
set /p SYNC="Do you want to sync Digiflazz products? (y/n): "
if /i "%SYNC%"=="y" (
    echo [SYNC] Syncing Digiflazz products...
    docker-compose exec -T backend php artisan digiflazz:sync-products
)

echo.
echo ================================
echo   Setup completed successfully!
echo ================================
echo.
echo Your application is ready!
echo.
echo Access your applications:
echo   - Frontend:    http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - phpMyAdmin:  http://localhost:8080
echo.
echo Useful commands:
echo   - View logs:        docker-compose logs -f
echo   - Stop services:    docker-compose down
echo   - Restart services: docker-compose restart
echo.
echo Happy coding!
echo.
pause
