# Screens Directory Structure

Dokumentasi ini menjelaskan struktur folder `screens` terbaru setelah proses refactoring. Struktur ini dibuat lebih terpusat pada alur fitur aplikasi untuk memudahkan navigasi dan pengembangan ke depannya.

## Struktur Direktori Saat Ini

```text
screens/
├── app/
│   ├── homescreen/          # Layar utama dan fitur-fitur yang diakses melalui Beranda
│   │   ├── checkout/        # Alur pembayaran (Checkout, Payment, Transaction Status)
│   │   ├── product/         # Modul untuk setiap kategori produk
│   │   │   ├── game/        # Produk Game (GameListScreen & GameDetailScreen)
│   │   │   ├── pulsa/       # Produk Pulsa (Mendatang)
│   │   │   ├── data/        # Produk Paket Data (Mendatang)
│   │   │   ├── voucher/     # Produk Voucher (Mendatang)
│   │   │   ├── e_wallet/    # Produk E-Wallet (Mendatang)
│   │   │   ├── internet/    # Produk Internet / WiFi (Mendatang)
│   │   │   ├── water/       # Produk Tagihan Air (Mendatang)
│   │   │   └── electricity/ # Produk Tagihan Listrik (Mendatang)
│   │   ├── dashboard_screen.dart
│   │   └── home_screen.dart
│   ├── promo/               # Layar Informasi Promo
│   ├── favorite/            # Layar Item/Produk Favorit
│   ├── history/             # Layar Riwayat Pesanan
│   ├── profile/             # Layar Profil Pengguna (ProfileScreen)
│   └── main_screen.dart     # Entry point & pengatur Bottom Navigation
├── auth/                    # Layar Otentikasi (Login, Register, dll)
│   ├── login_screen.dart
│   └── register_screen.dart
└── splash/                  # Layar awal saat membuka aplikasi
    └── splash_screen.dart
```

## Detail Perubahan (Refactoring)

1. **Penghapusan Folder `main/`**:
   - `main_screen.dart` dipindah ke root `app/`.
   - `home_screen.dart` dan `dashboard_screen.dart` dipindah ke `app/homescreen/`.
2. **Penyatuan ke dalam `app/`**:
   - Semua layar utama yang membutuhkan Bottom Navigation Bar (`homescreen`, `promo`, `favorite`, `history`, `profile`) digabungkan ke dalam folder `app/`.
3. **Pemindahan Folder `products/` & `checkout/`**:
   - Seluruh letak produk sebelumnya digeser ke `app/homescreen/product/` agar terisolasi khusus sebagai bagian fitur dari beranda.
   - Folder `checkout/` menjadi bagian dari alur beranda di `app/homescreen/checkout/`.
4. **Simplifikasi Folder `game/`**:
   - Folder ekstra `list_game/` dan `detail/` dihapus. File `game_list_screen.dart` dan `game_detail_screen.dart` kini bertempat langsung di dalam folder `app/homescreen/product/game/`.
5. **Persiapan Folder Fitur Baru**:
   - Folder kategori produk lainnya (pulsa, data, e-wallet, dll) telah dibuat sebagai _placeholder_ pengembangan layar (screen) selanjutnya.
