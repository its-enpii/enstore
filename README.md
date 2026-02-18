# Enstore - Digital Product Store Platform

Platform penjualan produk digital (voucher game, pulsa, PLN, e-money, dll) dengan integrasi Tripay (payment gateway) dan Digiflazz (product provider).

## 🚀 Quick Start

```bash
cp .env.example .env
docker-compose up -d
docker-compose exec backend composer install
```

## 📚 Documentation

Dokumentasi lengkap telah disentralisasi di folder `docs/`:

- [**System Architecture**](docs/architecture.md) - Desain sistem & skema database.
- [**Setup & Installation**](docs/setup.md) - Panduan lengkap Docker, Redis, dan Environment.
- [**API Reference**](docs/api-reference.md) - Dokumentasi lengkap endpoint API.
- [**Third-Party Integrations**](docs/integrations.md) - Integrasi Tripay, Digiflazz, & Social Login.
- [**Features & Flows**](docs/features.md) - Logika Refund, Guest Checkout, dll.

## 📁 Project Structure

- `backend/`: Laravel API (PHP 8.4)
- `frontend/`: Next.js Web App
- `enstore/`: Flutter Mobile App
- `docs/`: Centralized Documentation

---

Developed by Enpii Studio
