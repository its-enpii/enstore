# Panduan Setup & Instalasi

## 🚀 Memulai Cepat (Docker)

### 1. Persiapan Awal

```bash
# 1. Salin file environment
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Jalankan semua layanan
docker-compose up -d

# 3. Instal dependensi
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
```

### 2. Pengembangan Harian

- **Mulai**: `docker-compose up -d`
- **Berhenti**: `docker-compose down`
- **Log**: `docker-compose logs -f`

---

## 🔧 Konfigurasi Layanan

### Layanan Utama

| Layanan | Kontainer             | Port | Deskripsi         |
| ------- | --------------------- | ---- | ----------------- |
| backend | enstore-backend       | -    | PHP-FPM (Laravel) |
| nginx   | enstore-backend-nginx | 8000 | Web Server        |
| db      | enstore-db            | 3307 | MySQL 8.0         |
| redis   | enstore-redis         | 6379 | Cache & Antrian   |
| pma     | enstore-phpmyadmin    | 8080 | Manajemen DB      |

### Mengaktifkan Redis (Cache & Antrian)

Untuk performa yang lebih baik:

1. Perbarui `backend/.env`:
   ```env
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis
   REDIS_HOST=redis
   ```
2. Restart layanan:
   ```bash
   docker-compose down && docker-compose up -d
   docker-compose restart queue
   ```

---

## 📝 Variabel Lingkungan (.env)

### Kunci Penting Backend

- `APP_URL`: domain aplikasi Anda.
- `DB_HOST`: set ke `db` (nama kontainer).
- `REDIS_HOST`: set ke `redis`.
- `TRIPAY_*`: Kredensial gateway pembayaran.
- `DIGIFLAZZ_*`: Kredensial penyedia produk digital.

> [!NOTE]
> File `.env` di **root directory** digunakan untuk mengatur port Docker dan kredensial database untuk kontainer, sedangkan `backend/.env` digunakan untuk konfigurasi internal Laravel.

---

## 🐛 Troubleshooting

### Masalah Umum

- **Permission Denied**: Jalankan `chmod -R 777 backend/storage backend/bootstrap/cache`.
- **Database Connection Refused**: Tunggu 10-15 detik hingga MySQL selesai inisialisasi.
- **Port Conflict**: Ubah port di `docker-compose.yml` utama jika 8000/3307/6379 sudah digunakan.

### Perintah Pemeliharaan

```bash
# Bersihkan semua cache Laravel
docker-compose exec backend php artisan optimize:clear

# Bangun ulang kontainer spesifik
docker-compose up -d --build backend
```

### 🌍 Deployment Produksi

Untuk lingkungan produksi, gunakan file compose produksi:

```bash
# Bangun image produksi
docker-compose -f docker-compose.prod.yml build

# Jalankan layanan produksi
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🏗️ Profile & Layanan Opsional

Beberapa layanan seperti Frontend (Next.js) dan Flutter dinonaktifkan secara default. Gunakan profile Docker untuk mengaktifkannya:

```bash
# Aktifkan Frontend
docker-compose --profile frontend up -d

# Aktifkan Flutter
docker-compose --profile flutter up -d

# Aktifkan Keduanya
docker-compose --profile frontend --profile flutter up -d
```
