# Enstore - Platform Toko Produk Digital

Platform penjualan produk digital (voucher game, pulsa, PLN, e-money, dll) dengan integrasi Tripay (payment gateway) dan Digiflazz (penyedia produk).

## 🚀 Memulai Cepat

```bash
# Salin konfigurasi environment
cp .env.example .env

# Jalankan semua layanan dengan Docker
docker-compose up -d

# Instal dependensi backend
docker-compose exec backend composer install
```

## 📚 Dokumentasi

Dokumentasi lengkap telah disentralisasi di folder `docs/`:

- [**Arsitektur Sistem**](docs/architecture.md) - Desain sistem & skema database.
- [**Setup & Instalasi**](docs/setup.md) - Panduan lengkap Docker, Redis, dan Environment.
- [**Referensi API**](docs/api-reference.md) - Dokumentasi lengkap endpoint API.
- [**Integrasi Pihak Ketiga**](docs/integrations.md) - Integrasi Tripay, Digiflazz, & Login Sosial.
- [**Fitur & Alur Khusus**](docs/features.md) - Logika Refund, Checkout Guest, dll.

## 📁 Struktur Proyek

- `backend/`: API Laravel (PHP 8.4)
- `frontend/`: Aplikasi Web Next.js
- `enstore/`: Aplikasi Mobile Flutter
- `docs/`: Dokumentasi Terpusat

---

Dikembangkan oleh enpii studio
