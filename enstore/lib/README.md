# Enstore Application Architecture

Dokumentasi ini menjelaskan struktur keseluruhan folder `lib` pada proyek Enstore. Arsitektur ini menggunakan pendekatan pemisahan tanggung jawab (separation of concerns) untuk memisahkan antara logika inti aplikasi (`core`) dan antarmuka pengguna (`presentation`).

## Struktur Direktori Root (`lib/`)

```text
lib/
├── core/                    # Logika inti, data, layanan, dan konfigurasi aplikasi
├── presentation/            # Antarmuka Pengguna (UI), layar, dan widget yang dapat digunakan ulang
└── main.dart                # Entry point utama aplikasi Flutter
```

---

## 1. Core (`lib/core/`)

Bagian `core` bertanggung jawab atas semua hal yang tidak berhubungan dengan tampilan, seperti pengambilan data dari API, model struktur data, bantuan (helpers), serta tema dasar (warna).

```text
core/
├── constants/               # Nilai konstanta aplikasi
│   └── api_endpoints.dart   # Daftar lengkap path URL (misal: `/auth/login`, `/products`)
├── helpers/                 # Kelas/fungsi utilitas pendukung
│   └── phone_helper.dart    # Fungsi bantu untuk validasi nomor dan deteksi provider lokal
├── models/                  # Struktur Model Data yang merepresentasikan objek entity aplikasi
│   ├── api_response.dart    # Model pembungkus respons dari backend
│   ├── auth_response.dart   # Model respons spesifik untuk aktivitas autentikasi
│   ├── current_user.dart    # Metadata session user yang sedang aktif
│   ├── owner.dart           # Model data pemilik aplikasi (misal: logo aplikasi)
│   ├── product.dart         # Model grup produk (Product/ProductCategory)
│   ├── product_item.dart    # Partikel produk aktual dengan detail harga
│   ├── product_provider.dart# Model data penyedia layanan (provider)
│   ├── transaction.dart     # Model histori transaksi dan riwayat
│   └── user.dart            # Detail profil user
├── network/                 # Komunikasi layer API
│   └── api_client.dart      # HTTP Client tersentral (Dio/http wrapper), menangani token & header
├── services/                # Layanan yang menjembatani API client dengan request spesifik
│   ├── app_service.dart
│   ├── auth_service.dart    # Registrasi, Login, dan Logout
│   ├── cache_service.dart   # Penyimpanan/pengambilan data dari shared preferences/local
│   ├── order_service.dart   # Penanganan pembuatan pesanan baru (Checkout)
│   ├── product_service.dart # Pengambilan katalog kategori dan item
│   ├── transaction_service.dart
│   ├── user_service.dart    # Transaksi profil
│   └── utility_service.dart # Lookup provider (secara bertahap digantikan ke helper lokal)
└── theme/                   # Pengaturan gaya dan desain global
    └── app_colors.dart      # Standardisasi palet warna yang dapat digunakan di UI
```

---

## 2. Presentation (`lib/presentation/`)

Bagian ini menampung segala hal tentang rupa aplikasi serta _flow_ yang digunakan oleh pengguna.

### Layar / Screens (`lib/presentation/screens/`)

Layar adalah unit halaman secara utuh. File pada hierarki ini sebaiknya menyatukan beberapa komponen/widget menjadi satu alur.

```text
screens/
├── app/                     # Layar utama dan fitur-fitur yang diakses setelah login
│   ├── homescreen/          # Layar beranda utama dan fitur-fitur di dalamnya
│   │   ├── checkout/        # Alur pembayaran (Checkout, Payment, Transaction Status)
│   │   ├── product/         # Modul untuk setiap kategori jenis produk
│   │   │   ├── game/        # Input ID dan Detail Produk Game (`game_detail_screen.dart`)
│   │   │   ├── pulsa/       # Form Pulsa dengan deteksi otomatis dan pemilihan nominal (`pulsa_screen.dart`)
│   │   │   ├── data/        # (Mendatang) Produk Paket Data
│   │   │   ├── voucher/     # (Mendatang) Produk Voucher
│   │   │   ├── e_wallet/    # (Mendatang) Top up E-Wallet
│   │   │   ├── internet/    # (Mendatang) Produk Internet / Tagihan WiFi
│   │   │   ├── water/       # (Mendatang) Tagihan Air
│   │   │   └── electricity/ # (Mendatang) Tagihan Listrik Token
│   │   ├── dashboard_screen.dart # Tampilan konten Dashboard Beranda
│   │   └── home_screen.dart      # Container utama dashboard
│   ├── promo/               # Layar Informasi Promo
│   ├── favorite/            # Layar Item/Produk Favorit pengguna
│   ├── history/             # Layar Riwayat Pesanan pengguna
│   ├── profile/             # Layar Profil Pengguna dan Pengaturan
│   └── main_screen.dart     # Entry point halaman internal & pengatur Bottom Navigation
├── auth/                    # Layar Otentikasi (Sebelum masuk app utama)
│   ├── login_screen.dart    # Form Login
│   └── register_screen.dart # Form Register
└── splash/                  # Layar inisialisasi awal saat membuka aplikasi
    └── splash_screen.dart   # Pengecekan sesi & loading resouce
```

### Widgets (`lib/presentation/widgets/`)

Widget merupakan komponen UI yang bersifat _reusable_ dan _composable_ agar tidak perlu menulis ulang kode tampilan. Tersentral pada beberapa grup:

```text
widgets/
├── buttons/                 # Kumpulan jenis tombol interaktif
│   └── app_button.dart      # Tombol utama yang disesuaikan
├── cards/                   # Kontainer berbingkai
│   └── app_product_item_card.dart # Wadah interaktif (ada animasi) untuk setiap unit produk
├── feedback/                # Overlay untuk berinteraksi dengan pengguna di atas layar normal
│   ├── app_dialog.dart      # Pop-up konfirmasi atau peringatan bergaya aplikasi
│   └── app_toast.dart       # Pengganti Snackbar untuk info cepat tidak menginterupsi
├── inputs/                  # Jenis input field yang dispesifikasikan form
│   ├── app_dropdown.dart    # Input dropdown pilih menu
│   ├── app_product_input_form.dart # Kumpulan input generik beradaptasi berdasar API
│   └── app_text_field.dart  # Form Input field teks
└── layout/                  # Elemen kerangka / susunan blok makro
    ├── app_app_bar.dart     # Header/AppBar yang disesuaikan
    └── app_sticky_footer.dart # Container harga + tombol checkout di footer yang menempel pada layar
```
