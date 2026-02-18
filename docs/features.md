# Fitur & Alur Khusus

## 🛒 Checkout Guest

Memungkinkan pengguna membeli tanpa harus mendaftarkan akun lengkap.

- **Alur Kerja**: Input detail → Pilih pembayaran → Bayar → Halaman status.
- **Akun Otomatis**: Ketentuan teknis untuk pendaftaran di masa mendatang menggunakan email yang sama.

---

## 💰 Sistem Refund

Diimplementasikan untuk pesanan penyedia (Digiflazz) yang gagal.

- **Pemicu**: Pesanan GAGAL DAN pembayaran sudah SUKSES.
- **Mekanisme**: Dana ditambahkan kembali ke `saldo` (balance) Pengguna.
- **Audit**: Tercatat dalam `balance_mutations` dan `activity_logs`.

---

## 🔔 Sistem Notifikasi

Umpan balik real-time untuk pengguna.

- **Tipe**: `payment_success`, `order_completed`, `refund_processed`.
- **Pengiriman**: Notifikasi database, terlihat di header web/mobile.

---

## 💎 Tingkatan Harga

- **Retail**: Margin keuntungan standar diterapkan pada harga dasar Digiflazz.
- **Reseller**: Margin keuntungan yang dikurangi untuk pengguna dengan volume tinggi.
- **Override**: Admin dapat secara manual mengatur harga item tertentu tanpa mengikuti rumus.

---

## 🛡️ Perlindungan Brute-force (Rate Limiting)

- **Batas Auth**: 5 upaya per menit.
- **Batas API**: 300 permintaan per menit.
- **Batas Polling**: 600 permintaan per menit (untuk pengecekan status).
