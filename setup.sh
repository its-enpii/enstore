#!/bin/bash

# Enstore - Skrip Setup
# Skrip ini membantu Anda menyiapkan lingkungan pengembangan

set -e

echo "🚀 Skrip Setup Enstore"
echo "======================="
echo ""

# Cek apakah Docker berjalan
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker tidak berjalan. Silakan jalankan Docker Desktop terlebih dahulu."
    exit 1
fi

echo "✅ Docker berjalan"
echo ""

# Langkah 1: Salin file environment
echo "📝 Langkah 1: Menyiapkan file environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Berhasil membuat file .env"
else
    echo "⚠️  .env sudah ada, melewati..."
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Berhasil membuat file backend/.env"
else
    echo "⚠️  backend/.env sudah ada, melewati..."
fi

echo ""

# Langkah 2: Jalankan kontainer Docker
echo "🐳 Langkah 2: Menjalankan kontainer Docker..."
docker-compose up -d

echo "⏳ Menunggu kontainer siap (30 detik)..."
sleep 30

echo ""

# Langkah 3: Instal dependensi backend
echo "📦 Langkah 3: Menginstal dependensi backend..."
docker-compose exec -T backend composer install --no-interaction

echo ""

# Langkah 4: Generate application key
echo "🔑 Langkah 4: Membuat application key..."
docker-compose exec -T backend php artisan key:generate --no-interaction

echo ""

# Langkah 5: Jalankan migrasi database
echo "🗄️  Langkah 5: Menjalankan migrasi database..."
docker-compose exec -T backend php artisan migrate --no-interaction

echo ""

# Langkah 6: Tanya tentang seeding
read -p "Apakah Anda ingin mengisi database dengan data awal (seed)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Mengisi database..."
    docker-compose exec -T backend php artisan db:seed --no-interaction
fi

echo ""

# Langkah 7: Tanya tentang sinkronisasi produk
read -p "Apakah Anda ingin sinkronisasi produk Digiflazz? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Sinkronisasi produk Digiflazz..."
    docker-compose exec -T backend php artisan digiflazz:sync-products
fi

echo ""
echo "✅ Setup Berhasil Diselesaikan!"
echo ""
echo "🎉 Aplikasi Anda sudah siap!"
echo ""
echo "📍 Akses aplikasi Anda di:"
echo "   - Frontend:    http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - phpMyAdmin:  http://localhost:8080"
echo ""
echo "📚 Perintah berguna:"
echo "   - Lihat log:        docker-compose logs -f"
echo "   - Hentikan layanan: docker-compose down"
echo "   - Restart layanan:  docker-compose restart"
echo ""
echo "Selamat berkoding! 🚀"
