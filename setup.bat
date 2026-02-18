@echo off
REM Enstore - Skrip Setup untuk Windows
REM Skrip ini membantu Anda menyiapkan lingkungan pengembangan

echo.
echo ================================
echo   Skrip Setup Enstore
echo ================================
echo.

REM Cek apakah Docker berjalan
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker tidak berjalan. Silakan jalankan Docker Desktop terlebih dahulu.
    pause
    exit /b 1
)

echo [OK] Docker berjalan
echo.

REM Langkah 1: Salin file environment
echo [Langkah 1] Menyiapkan file environment...
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Berhasil membuat file .env
) else (
    echo [SKIP] .env sudah ada
)

if not exist backend\.env (
    copy backend\.env.example backend\.env >nul
    echo [OK] Berhasil membuat file backend\.env
) else (
    echo [SKIP] backend\.env sudah ada
)

echo.

REM Langkah 2: Jalankan kontainer Docker
echo [Langkah 2] Menjalankan kontainer Docker...
docker-compose up -d

echo [WAIT] Menunggu kontainer siap (30 detik)...
timeout /t 30 /nobreak >nul

echo.

REM Langkah 3: Instal dependensi backend
echo [Langkah 3] Menginstal dependensi backend...
docker-compose exec -T backend composer install --no-interaction

echo.

REM Langkah 4: Generate application key
echo [Langkah 4] Membuat application key...
docker-compose exec -T backend php artisan key:generate --no-interaction

echo.

REM Langkah 5: Jalankan migrasi database
echo [Langkah 5] Menjalankan migrasi database...
docker-compose exec -T backend php artisan migrate --no-interaction

echo.

REM Langkah 6: Tanya tentang seeding
set /p SEED="Apakah Anda ingin mengisi database dengan data awal (seed)? (y/n): "
if /i "%SEED%"=="y" (
    echo [SEED] Mengisi database...
    docker-compose exec -T backend php artisan db:seed --no-interaction
)

echo.

REM Langkah 7: Tanya tentang sinkronisasi produk
set /p SYNC="Apakah Anda ingin sinkronisasi produk Digiflazz? (y/n): "
if /i "%SYNC%"=="y" (
    echo [SYNC] Sinkronisasi produk Digiflazz...
    docker-compose exec -T backend php artisan digiflazz:sync-products
)

echo.
echo ===================================
echo   Setup Berhasil Diselesaikan!
echo ===================================
echo.
echo Aplikasi Anda sudah siap!
echo.
echo Akses aplikasi Anda di:
echo   - Frontend:    http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - phpMyAdmin:  http://localhost:8080
echo.
echo Perintah berguna:
echo   - Lihat log:        docker-compose logs -f
echo   - Hentikan layanan: docker-compose down
echo   - Restart layanan:  docker-compose restart
echo.
echo Selamat berkoding!
echo.
pause
