"use client";

import React from "react";
import Link from "next/link";
import {
  GavelRounded,
  ArrowForwardRounded,
  HistoryEduRounded,
  ArrowUpwardRounded,
  InfoRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";

export default function TermsPage() {
  const tableOfContents = [
    { id: "pendahuluan", label: "1. Pendahuluan" },
    { id: "definisi", label: "2. Definisi" },
    { id: "persyaratan-pengguna", label: "3. Persyaratan Pengguna" },
    { id: "pendaftaran-akun", label: "4. Pendaftaran dan Akun" },
    { id: "layanan-tersedia", label: "5. Layanan yang Tersedia" },
    { id: "transaksi-pembayaran", label: "6. Transaksi dan Pembayaran" },
    { id: "kebijakan-refund", label: "7. Kebijakan Pengembalian Dana" },
    { id: "poin-reward", label: "8. Sistem Poin dan Reward" },
    { id: "hak-kewajiban", label: "9. Hak dan Kewajiban" },
    { id: "batasan-tanggung-jawab", label: "10. Batasan Tanggung Jawab" },
    { id: "larangan-penggunaan", label: "11. Larangan Penggunaan" },
    { id: "hki", label: "12. Hak Kekayaan Intelektual" },
    { id: "perubahan-ketentuan", label: "13. Perubahan Ketentuan" },
    { id: "penyelesaian-sengketa", label: "14. Penyelesaian Sengketa" },
    { id: "force-majeure", label: "15. Force Majeure" },
    { id: "hubungi-kami", label: "16. Hubungi Kami" },
    { id: "pernyataan-persetujuan", label: "17. Pernyataan Persetujuan" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cloud-200 py-28 font-sans">
      <div className="container mx-auto px-4 lg:px-0">
        
        {/* Header Section */}
        <div className="mx-auto mb-20 max-w-4xl space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-ocean-500/10 px-6 py-2 text-ocean-600"
          >
            <GavelRounded fontSize="small" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-brand-500">Legal Agreement</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold leading-tight text-brand-500 md:text-6xl"
          >
            Syarat & <span className="text-ocean-500">Ketentuan</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] font-medium leading-relaxed text-brand-500/40"
          >
            EnStore by enpii studio
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Sticky Navigation Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-28 space-y-8">
              <div className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-10 shadow-enstore">
                <h3 className="mb-8 flex items-center gap-3 text-xl font-bold text-brand-500">
                  <HistoryEduRounded className="text-ocean-500" />
                  Navigasi Legal
                </h3>
                <nav className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] custom-scrollbar pr-2">
                  {tableOfContents.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className="group flex items-center justify-between rounded-xl p-3 transition-all hover:bg-white hover:shadow-enstore"
                    >
                      <span className="text-sm font-medium text-brand-500/60 group-hover:text-ocean-500">
                        {item.label}
                      </span>
                      <ArrowForwardRounded className="text-brand-500/20 group-hover:translate-x-1 group-hover:text-ocean-500" fontSize="small" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Status Alert Card */}
              <div className="rounded-[40px] bg-brand-500 p-10 text-white shadow-enstore relative overflow-hidden group">
                <div className="relative z-10">
                  <InfoRounded className="mb-6 h-12 w-12 text-ocean-400" />
                  <h4 className="mb-4 text-2xl font-bold">Kepatuhan Hukum</h4>
                  <p className="mb-8 text-base font-normal text-white/50 leading-relaxed">
                    Setiap transaksi di EnStore dilindungi oleh payung hukum yang kuat dan transparan.
                  </p>
                  <div className="flex w-full items-center justify-center rounded-2xl bg-ocean-500 py-4 font-bold text-white shadow-enstore">
                    STATUS VERIFIED 2026
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. PENDAHULUAN */}
            <section id="pendahuluan" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-8 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">1. PENDAHULUAN</h2>
                <div className="space-y-6">
                  <p className="text-[16px] font-normal leading-relaxed text-brand-500/60">
                    Selamat datang di EnStore! Syarat dan Ketentuan Layanan ini (&quot;Ketentuan&quot;) mengatur penggunaan Anda atas platform EnStore yang dioperasikan oleh enpii studio (&quot;kami&quot;, &quot;EnStore&quot;). Dengan mengakses atau menggunakan layanan kami, Anda menyetujui untuk terikat dengan Ketentuan ini.
                  </p>
                  <div className="pt-8 border-t border-brand-500/5">
                    <p className="mb-4 font-bold text-brand-500">Informasi Kontak:</p>
                    <ul className="space-y-2 text-[16px] font-normal text-brand-500/60">
                      <li>• Operator: enpii studio</li>
                      <li>• Kontak: 085842712135</li>
                      <li>• Nama Platform: EnStore</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* 2. DEFINISI */}
            <section id="definisi" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-8 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">2. DEFINISI</h2>
                <ul className="space-y-4 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                  <li>• <span className="font-bold text-brand-500">&quot;Layanan&quot;</span> merujuk pada semua layanan top up dan pembayaran tagihan (PPOB) yang disediakan melalui platform EnStore</li>
                  <li>• <span className="font-bold text-brand-500">&quot;Pengguna&quot;</span> atau <span className="font-bold text-brand-500">&quot;Anda&quot;</span> merujuk pada individu atau entitas yang menggunakan layanan kami</li>
                  <li>• <span className="font-bold text-brand-500">&quot;Akun&quot;</span> merujuk pada akun pengguna yang terdaftar di platform EnStore</li>
                  <li>• <span className="font-bold text-brand-500">&quot;Saldo&quot;</span> merujuk pada dana yang tersimpan dalam akun pengguna untuk melakukan transaksi</li>
                  <li>• <span className="font-bold text-brand-500">&quot;Member&quot;</span> merujuk pada pengguna yang telah terdaftar dan memiliki akun di EnStore</li>
                </ul>
              </motion.div>
            </section>

            {/* 3. PERSYARATAN PENGGUNA */}
            <section id="persyaratan-pengguna" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight uppercase">3. PERSYARATAN PENGGUNA</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-4 text-[18px] font-bold text-brand-500">3.1 Usia Minimum</h3>
                      <p>Anda harus berusia minimal 13 tahun untuk menggunakan layanan EnStore. Dengan mendaftar, Anda menyatakan bahwa Anda telah memenuhi persyaratan usia ini.</p>
                   </div>
                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-4 text-[18px] font-bold text-brand-500">3.2 Wilayah Operasional</h3>
                      <p>Layanan EnStore saat ini hanya tersedia untuk pengguna yang berada di wilayah Indonesia.</p>
                   </div>
                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-4 text-[18px] font-bold text-brand-500">3.3 Akurasi Informasi</h3>
                      <p>Anda bertanggung jawab untuk memberikan informasi yang akurat, lengkap, dan terkini saat mendaftar dan menggunakan layanan kami.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 4. PENDAFTARAN DAN AKUN */}
            <section id="pendaftaran-akun" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight uppercase">4. PENDAFTARAN DAN AKUN</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">4.1 Pembuatan Akun</h3>
                      <p className="mb-6">EnStore dapat digunakan dengan dua cara:</p>
                      
                      <div className="space-y-6">
                         <div>
                            <p className="mb-4 font-bold text-brand-500">A. Sebagai Guest (Tanpa Registrasi):</p>
                            <ul className="space-y-2 ml-4 mb-6">
                               <li>• Anda dapat melakukan transaksi tanpa membuat akun</li>
                               <li>• Cukup isi data transaksi dan lakukan pembayaran</li>
                               <li>• <span className="font-bold text-brand-500">Keterbatasan</span>:</li>
                               <li className="ml-4">• Tidak ada riwayat transaksi yang tersimpan</li>
                               <li className="ml-4">• Tidak bisa menggunakan saldo akun</li>
                               <li className="ml-4">• Refund TIDAK otomatis (harus manual via CS)</li>
                               <li className="ml-4">• Tidak mendapatkan poin reward</li>
                               <li className="ml-4">• Tidak bisa akses program reseller/afiliasi</li>
                            </ul>
                         </div>

                         <div>
                            <p className="mb-4 font-bold text-brand-500">B. Sebagai Member (Dengan Registrasi):</p>
                            <p className="mb-4">Untuk akses fitur lengkap, Anda dapat mendaftar dengan:</p>
                            
                            <p className="mb-2 font-bold text-brand-500 underline underline-offset-4 decoration-ocean-500/30">B1. Pendaftaran Manual:</p>
                            <p className="mb-4">Dengan memberikan: Nama lengkap, alamat email yang valid, nomor telepon yang aktif, password yang kuat, foto profil (opsional).</p>

                            <p className="mb-2 font-bold text-brand-500 underline underline-offset-4 decoration-ocean-500/30">B2. Pendaftaran melalui OAuth (Login Sosial):</p>
                            <p className="mb-4">Anda dapat mendaftar/login menggunakan:</p>
                            <ul className="space-y-2 ml-4">
                               <li>• <span className="font-bold text-brand-500">Google Account</span>: Login cepat menggunakan akun Google Anda</li>
                               <li>• <span className="font-bold text-brand-500">Facebook Account</span>: Login cepat menggunakan akun Facebook Anda</li>
                            </ul>
                         </div>

                         <div className="p-10 bg-white rounded-[32px] border border-brand-500/5 space-y-4">
                            <p className="font-bold text-brand-500 uppercase tracking-widest text-xs">Keuntungan Menjadi Member:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <li className="flex items-start gap-2">✅ <span className="font-bold text-brand-500">Transaksi TANPA FEE</span> dengan saldo akun</li>
                               <li className="flex items-start gap-2">✅ Refund otomatis ke saldo akun</li>
                               <li className="flex items-start gap-2">✅ Riwayat transaksi tersimpan</li>
                               <li className="flex items-start gap-2">✅ Bisa isi dan gunakan saldo akun</li>
                               <li className="flex items-start gap-2">✅ Mendapatkan poin dari setiap transaksi</li>
                               <li className="flex items-start gap-2">✅ Akses fitur favorit</li>
                               <li className="flex items-start gap-2">✅ Notifikasi status transaksi</li>
                               <li className="flex items-start gap-2">✅ Promo dan diskon khusus member</li>
                            </ul>
                         </div>

                         <div className="p-10 bg-brand-500/5 rounded-[32px] border border-brand-500/10 font-mono text-sm leading-relaxed">
                            <p className="mb-4 font-bold text-brand-500 uppercase font-sans text-xs tracking-widest">Perbandingan Biaya:</p>
                            <p>Contoh: Beli Pulsa Rp 50.000</p>
                            <p className="mt-4">Guest / Bayar Transfer Bank:</p>
                            <p>Rp 50.000 + Fee Rp 1.500 = Rp 51.500 ❌</p>
                            <p className="mt-4">Member dengan Saldo EnStore:</p>
                            <p>Rp 50.000 + Fee Rp 0 = Rp 50.000 ✅</p>
                            <p className="mt-6 text-brand-500 font-bold font-sans uppercase tracking-[0.2em]">HEMAT Rp 1.500 per transaksi!</p>
                         </div>

                         <div className="space-y-6">
                            <p className="font-bold text-brand-500">Informasi yang Kami Terima dari OAuth:</p>
                            <p>Saat Anda memilih login dengan Google/Facebook, kami hanya menerima: Nama lengkap, alamat email, foto profil, dan User ID unik (untuk autentikasi).</p>

                            <p className="font-bold text-brand-500">Yang TIDAK Kami Akses:</p>
                            <ul className="space-y-2 ml-4">
                               <li>• Password Google/Facebook Anda</li>
                               <li>• Daftar teman atau kontak Anda</li>
                               <li>• Pesan atau chat pribadi</li>
                               <li>• Timeline atau posting Anda</li>
                               <li>• Data pribadi lainnya di akun Google/Facebook</li>
                            </ul>

                            <p className="font-bold text-brand-500">Mencabut Akses OAuth:</p>
                            <p>Anda dapat mencabut akses EnStore kapan saja melalui:</p>
                            <ul className="space-y-4 ml-4">
                               <li>• Google: <Link href="https://myaccount.google.com/permissions" className="text-ocean-500 hover:underline">myaccount.google.com/permissions</Link></li>
                               <li>• Facebook: Settings → Apps and Websites</li>
                            </ul>
                            <p>Mencabut akses akan memutus koneksi dengan Google/Facebook, tetapi akun EnStore Anda tetap aktif dan dapat diakses dengan email/password.</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">4.2 Keamanan Akun</h3>
                      <ul className="space-y-4">
                         <li>• Anda bertanggung jawab untuk menjaga kerahasiaan informasi login Anda</li>
                         <li>• Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
                         <li>• Segera laporkan kepada kami jika Anda mencurigai adanya penggunaan tidak sah atas akun Anda</li>
                         <li>• Kami tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian Anda dalam menjaga keamanan akun</li>
                      </ul>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">4.3 Penangguhan atau Penutupan Akun</h3>
                      <p className="mb-4">Kami berhak untuk menangguhkan atau menutup akun Anda jika:</p>
                      <ul className="space-y-2 ml-4">
                         <li>• Anda melanggar Ketentuan ini</li>
                         <li>• Kami mencurigai adanya aktivitas penipuan atau ilegal</li>
                         <li>• Anda memberikan informasi palsu atau menyesatkan</li>
                         <li>• Atas permintaan Anda sendiri</li>
                      </ul>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 5. LAYANAN YANG TERSEDIA */}
            <section id="layanan-tersedia" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight uppercase">5. LAYANAN YANG TERSEDIA</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <p>EnStore menyediakan layanan berikut:</p>
                   <div>
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">5.1 Top Up Digital</h3>
                      <ul className="space-y-2 ml-4">
                         <li>• Pulsa semua operator</li>
                         <li>• Paket data internet</li>
                         <li>• Token listrik PLN</li>
                         <li>• Langganan streaming (Spotify, Vidio, WeTV)</li>
                         <li>• Top up e-wallet (GoPay, OVO, DANA, LinkAja, ShopeePay)</li>
                         <li>• Top up game dan voucher game</li>
                      </ul>
                   </div>
                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">5.2 Pembayaran Tagihan (PPOB)</h3>
                      <ul className="space-y-2 ml-4">
                         <li>• Tagihan listrik PLN pascabayar</li>
                         <li>• Tagihan PDAM</li>
                         <li>• Tagihan BPJS Kesehatan</li>
                      </ul>
                   </div>
                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">5.3 Program Reseller/Afiliasi</h3>
                      <p>Kami menyediakan program reseller dan afiliasi dengan syarat dan ketentuan khusus yang akan diinformasikan secara terpisah.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 6. TRANSAKSI DAN PEMBAYARAN */}
            <section id="transaksi-pembayaran" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-14 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight text-center uppercase">6. TRANSAKSI DAN PEMBAYARAN</h2>
                <div className="space-y-16 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-8 text-[20px] font-bold text-brand-500 text-center tracking-wide">6.1 Metode Pembayaran</h3>
                      <p className="mb-8 text-center">EnStore menerima pembayaran melalui:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-8 bg-white rounded-[32px] border-l-8 border-l-ocean-500 shadow-enstore">
                            <p className="mb-4 font-bold text-brand-500">A. Saldo Akun (Member)</p>
                            <ul className="space-y-2 text-sm">
                               <li>✅ <span className="font-bold text-brand-500 text-xs uppercase tracking-widest">TANPA FEE</span> - 0% Biaya</li>
                               <li>✅ Proses instan sistem otomatis</li>
                               <li>✅ Rekomendasi utama pengguna hemat</li>
                            </ul>
                         </div>
                         <div className="p-8 bg-white rounded-[32px] border border-brand-500/5 shadow-enstore">
                            <p className="mb-4 font-bold text-brand-500">B. Transfer Bank</p>
                            <ul className="space-y-2 text-sm">
                               <li>❌ Dikenakan fee payment gateway</li>
                               <li>Proses: Bayar → Konfirmasi → Proses</li>
                               <li>Tersedia BCA, Mandiri, BNI, BRI, dll</li>
                            </ul>
                         </div>
                         <div className="p-8 bg-white rounded-[32px] border border-brand-500/5 shadow-enstore">
                            <p className="mb-4 font-bold text-brand-500">C. QRIS</p>
                            <ul className="space-y-2 text-sm">
                               <li>❌ Dikenakan fee payment gateway</li>
                               <li>Scan QR via e-wallet/mobile banking</li>
                               <li>Proses cepat setelah pembayaran</li>
                            </ul>
                         </div>
                         <div className="p-8 bg-white rounded-[32px] border border-brand-500/5 shadow-enstore">
                            <p className="mb-4 font-bold text-brand-500">D. Gerai Retail</p>
                            <ul className="space-y-2 text-sm">
                               <li>❌ Dikenakan fee payment gateway</li>
                               <li>Bayar di Alfamart/Indomaret</li>
                               <li>Gunakan kode pembayaran transaksi</li>
                            </ul>
                         </div>
                      </div>

                      <div className="mt-10 space-y-4">
                         <p className="font-bold text-brand-500 uppercase tracking-widest text-[11px]">Catatan Penting tentang Fee:</p>
                         <ul className="space-y-2 ml-4">
                            <li>• Fee diterapkan pada metode Transfer Bank, QRIS, dan Gerai Retail</li>
                            <li>• Fee digunakan untuk biaya processing payment gateway (Tripay)</li>
                            <li>• Besaran fee berbeda-beda tergantung metode yang dipilih</li>
                            <li>• Fee akan ditampilkan dengan jelas SEBELUM Anda konfirmasi pembayaran</li>
                            <li>• <span className="font-bold text-brand-500">Untuk menghindari fee, gunakan Saldo EnStore</span></li>
                         </ul>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-8 text-[18px] font-bold text-brand-500">6.2 Pemrosesan Transaksi</h3>
                      <ul className="space-y-2 ml-4">
                         <li>• Transaksi akan diproses setelah pembayaran dikonfirmasi</li>
                         <li>• <span className="font-bold text-brand-500">Guest User</span>: Transaksi langsung diproses setelah pembayaran terkonfirmasi</li>
                         <li>• <span className="font-bold text-brand-500">Member</span>: Dapat menggunakan saldo akun atau metode pembayaran lainnya</li>
                         <li>• Waktu pemrosesan bervariasi tergantung pada jenis layanan dan provider</li>
                         <li>• Kami menggunakan layanan pihak ketiga (Tripay dan Digiflazz) untuk memproses transaksi</li>
                         <li>• Pastikan semua detail transaksi (nomor tujuan, nominal, dll) sudah benar sebelum konfirmasi</li>
                         <li>• <span className="font-bold text-brand-500">Penting</span>: Verifikasi data dengan teliti, terutama untuk guest user yang tidak bisa melihat riwayat transaksi</li>
                      </ul>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-8 text-[18px] font-bold text-brand-500">6.3 Harga</h3>
                      <ul className="space-y-4 ml-4">
                         <li>• Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
                         <li>• Harga yang berlaku adalah harga pada saat transaksi dikonfirmasi</li>
                         <li>• Semua harga dalam Rupiah (IDR)</li>
                         <li>• <span className="font-bold text-brand-500">Struktur Harga</span>: Harga Produk + Fee Metode Pembayaran (jika ada)</li>
                      </ul>
                      
                      <div className="mt-8 p-10 bg-white border border-brand-500/5 rounded-[32px] space-y-6 shadow-enstore">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                               <p className="mb-2 font-bold text-brand-500">Metode & Fee:</p>
                               <ul className="space-y-1">
                                  <li>• Saldo EnStore: 0% Fee</li>
                                  <li>• Transfer/QRIS/Retail: Dikenakan Fee</li>
                               </ul>
                            </div>
                            <div>
                               <p className="mb-2 font-bold text-brand-500">Transparansi Harga:</p>
                               <p>Total yang harus dibayar akan ditampilkan dengan jelas di halaman checkout. Rincian: Harga produk + Fee akan terpisah dan jelas.</p>
                            </div>
                         </div>
                         <div className="p-4 bg-ocean-500/5 rounded-2xl flex items-center gap-4 text-ocean-600 font-bold text-[13px] uppercase tracking-widest">
                            <span>💡 Tips Hemat:</span>
                            <span>Isi Saldo EnStore terlebih dahulu untuk transaksi tanpa fee!</span>
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5 space-y-8">
                      <h3 className="text-[18px] font-bold text-brand-500">6.4 Saldo Akun</h3>
                      <p>Member dapat mengisi saldo akun untuk kemudahan transaksi. Saldo tidak memiliki masa kadaluarsa selama akun aktif dan tidak dapat ditarik kembali kecuali dalam kondisi tertentu yang disetujui manajemen EnStore.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <p className="font-bold text-brand-500 uppercase tracking-widest text-xs">Keuntungan Menggunakan Saldo:</p>
                           <ul className="space-y-3">
                              <li>• ✅ <span className="font-bold text-brand-500">TANPA FEE</span> - Gratis biaya admin setiap transaksi</li>
                              <li>• ✅ <span className="font-bold text-brand-500">Proses Lebih Cepat</span> - Transaksi langsung diproses instan</li>
                              <li>• ✅ <span className="font-bold text-brand-500">Refund Otomatis</span> - Pengembalian dana kilat jika gagal</li>
                              <li>• ✅ <span className="font-bold text-brand-500">Hemat Biaya</span> - Menghindari fee gateway berulang</li>
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <p className="font-bold text-brand-500 uppercase tracking-widest text-xs">Cara Isi Saldo:</p>
                           <ul className="space-y-2 text-sm leading-relaxed">
                              <li>1. Pilih menu &quot;Isi Saldo&quot; di dashboard</li>
                              <li>2. Pilih nominal yang ingin diisi</li>
                              <li>3. Pilih metode pembayaran (transfer/QRIS)</li>
                              <li><span className="opacity-50 font-normal italic">Note: Pengisian dapat dikenakan fee, namun transaksi menggunakan saldo adalah GRATIS fee.</span></li>
                           </ul>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 7. KEBIJAKAN REFUND */}
            <section id="kebijakan-refund" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-14 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight text-center uppercase">7. KEBIJAKAN PENGEMBALIAN DANA (REFUND)</h2>
                <div className="space-y-16 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">7.1 Refund Otomatis (Untuk Member Terdaftar)</h3>
                      <p className="mb-6">Pengembalian dana akan dilakukan secara otomatis jika transaksi gagal diproses sistem/provider, produk tidak terkirim karena kesalahan teknis, atau terjadi double charge.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm p-8 bg-white rounded-[32px] shadow-enstore">
                         <ul className="space-y-2">
                            <li>• <span className="font-bold text-brand-500">Jumlah Refund</span>: Sesuai harga produk saja</li>
                            <li>• <span className="font-bold text-brand-500">Tujuan Refund</span>: Masuk ke saldo akun member</li>
                         </ul>
                         <ul className="space-y-2">
                            <li>• <span className="font-bold text-brand-500">Waktu Proses</span>: Maksimal 1x24 jam</li>
                            <li>• <span className="font-bold text-brand-500">Notifikasi</span>: Otomatis saat refund selesai</li>
                         </ul>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">7.2 Refund untuk Guest User (Tidak Terdaftar)</h3>
                      <p className="mb-6">Jika bertransaksi tanpa login, refund TIDAK otomatis. Hubungi CS di 085842712135 dengan data: Invoice, Bukti Bayar, Nomor HP/Email transaksi, dan Nomor Rekening Bank.</p>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm font-normal">
                           <thead className="bg-brand-500 text-white font-bold uppercase tracking-widest text-[11px]">
                              <tr>
                                 <th className="p-5">Aspek</th>
                                 <th className="p-5">Member Terdaftar</th>
                                 <th className="p-5">Guest User</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-brand-500/5">
                              <tr className="hover:bg-brand-500/5 transition-colors">
                                 <td className="p-5 font-bold text-brand-500">Refund Otomatis</td>
                                 <td className="p-5">✅ Ya</td>
                                 <td className="p-5">❌ Tidak</td>
                              </tr>
                              <tr className="hover:bg-brand-500/5 transition-colors">
                                 <td className="p-5 font-bold text-brand-500">Tujuan Refund</td>
                                 <td className="p-5">Saldo akun</td>
                                 <td className="p-5">Transfer bank</td>
                              </tr>
                              <tr className="hover:bg-brand-500/5 transition-colors">
                                 <td className="p-5 font-bold text-brand-500">Waktu Proses</td>
                                 <td className="p-5">1x24 jam</td>
                                 <td className="p-5">3-7 hari kerja</td>
                              </tr>
                           </tbody>
                        </table>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5 grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <h3 className="text-[18px] font-bold text-brand-500">7.3 Refund by Request</h3>
                        <p>Pengajuan manual via CS di 085842712135 untuk kondisi salah input (kasus per kasus), produk tidak sesuai, atau masalah teknis lain. Keputusan mutlak di tangan tim EnStore.</p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[18px] font-bold text-brand-500">7.4 Waktu Pemrosesan</h3>
                        <ul className="space-y-1 text-sm">
                           <li>• Refund otomatis (member): 1x24 jam</li>
                           <li>• Refund manual (guest): 3-7 hari kerja</li>
                           <li>• Refund request (member): 2-5 hari kerja</li>
                           <li>• Refund request (guest): 5-10 hari kerja</li>
                        </ul>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">7.5 Kondisi yang Tidak Dapat Di-Refund</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                         <li>• Kesalahan input nomor tujuan pengguna</li>
                         <li>• Transaksi yang telah sukses di provider</li>
                         <li>• Perubahan pikiran setelah checkout selesai</li>
                         <li>• Pengajuan melebihi batas waktu (14 hari)</li>
                         <li>• <span className="font-bold text-brand-500">Fee atau biaya admin payment gateway</span></li>
                      </ul>
                   </div>

                   <div className="pt-10 border-t-2 border-brand-500/10 p-10 bg-ocean-500/5 rounded-[40px] space-y-10">
                      <h3 className="text-[20px] font-bold text-brand-500 text-center">7.6 Kebijakan Refund terkait Fee</h3>
                      <p className="text-center">Penting untuk dipahami bahwa setiap metode pembayaran memiliki komponen biaya yang berbeda. Biaya admin/fee dikenakan oleh payment gateway (Tripay) dan tidak dapat dikembalikan meskipun transaksi gagal.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="p-8 bg-white rounded-3xl border border-ocean-500/10 shadow-enstore space-y-4">
                            <p className="font-bold text-brand-500 uppercase tracking-widest text-xs">Metode Tanpa Fee (0%):</p>
                            <p className="text-sm">Saldo EnStore - Sangat direkomendasikan for transaksi rutin tanpa potongan sepeserpun.</p>
                         </div>
                         <div className="p-8 bg-white rounded-3xl border border-brand-500/5 shadow-enstore space-y-4">
                            <p className="font-bold text-brand-500 uppercase tracking-widest text-xs">Metode dengan Fee:</p>
                            <p className="text-sm">Transfer Bank, QRIS, Alfamart/Indomaret. Fee ini dibayarkan ke sistem gateway for memproses dana Anda.</p>
                         </div>
                      </div>

                      <div className="p-10 bg-brand-500 rounded-[32px] text-white">
                         <p className="mb-6 font-bold uppercase tracking-widest text-[11px] opacity-40">Contoh Mekanisme Refund Fee:</p>
                         <p className="mb-4">Bayar Rp 11.500 (Produk Rp 10.000 + Fee Rp 1.500) → Transaksi GAGAL.</p>
                         <p className="text-[24px] font-bold text-ocean-400">Refund = Rp 10.000 saja</p>
                         <p className="mt-4 text-sm opacity-60">Fee Rp 1.500 sudah terpakai untuk biaya processing payment gateway dan tidak dapat ditarik kembali.</p>
                         <div className="mt-8 pt-8 border-t border-white/10 text-xs uppercase tracking-widest font-bold text-white">
                            Gunakan Saldo EnStore untuk menghindari kehilangan biaya admin!
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 8-10 SECTIONS */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { id: "poin-reward", t: "8. Poin & Reward", d: "Member mendapatkan poin dari transaksi sukses yang dapat ditukar saldo/diskon sesuai masa berlaku di sistem. Poin tidak dapat dipindah tangankan antar akun." },
                 { id: "hak-kewajiban", t: "9. Hak & Kewajiban", d: "Pengguna wajib memberikan data akurat & mematuhi hukum. EnStore wajib memproses SOP, menjaga data, dan responsif dalam customer service." },
                 { id: "batasan-tanggung-jawab", t: "10. Batasan", d: "EnStore tidak menjamin 24/7 uptime & tidak bertanggung jawab atas kerugian salah input atau gangguan aggregator Digiflazz/Tripay di luar kendali langsung." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="h-full rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-enstore">
                       <h3 className="text-[14px] font-bold text-brand-500 mb-6 uppercase tracking-widest border-b border-brand-500/5 pb-4">{item.t}</h3>
                       <p className="text-[14px] font-normal text-brand-500/60 leading-relaxed">{item.d}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 11-15 SECTIONS */}
            <div className="space-y-10 text-[16px] font-normal leading-relaxed text-brand-500/60">
                {[
                 { id: "larangan-penggunaan", h: "11. LARANGAN PENGGUNAAN", p: "Dilarang menggunakan untuk tujuan ilegal, penipuan, bot/script tanpa izin, menyalahgunakan reward, atau merusak infrastruktur EnStore dengan cara apapun." },
                 { id: "hki", h: "12. HAK KEKAYAAN INTELEKTUAL", p: "Semua konten (logo, desain, teks) adalah milik enpii studio. Nama EnStore adalah merek dagang terdaftar. Dilarang modifikasi/distribusi tanpa izin tertulis." },
                 { id: "perubahan-ketentuan", h: "13. PERUBAHAN KETENTUAN", p: "Kami berhak mengubah Ketentuan kapan saja. Penggunaan layanan berkelanjutan dianggap sebagai bentuk persetujuan atas revisi legal terbaru kami." },
                 { id: "penyelesaian-sengketa", h: "14. PENYELESAIAN SENGKETA", p: "Diatur sepenuhnya oleh hukum Republik Indonesia. Sengketa diselesaikan secara musyawarah sebelum menempuh jalur hukum resmi yang berlaku." },
                 { id: "force-majeure", h: "15. FORCE MAJEURE", p: "Bebas tanggung jawab atas gangguan akibat bencana alam, perang, gangguan listrik/internet massal, pandemi, atau kebijakan darurat pemerintah RI." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore border-l-8 border-l-ocean-500">
                       <h3 className="text-[20px] font-bold text-brand-500 mb-4 tracking-tight uppercase">{item.h}</h3>
                       <p>{item.p}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 16. HUBUNGI KAMI */}
            <section id="hubungi-kami" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] bg-brand-500 p-10 md:p-16 text-white shadow-enstore overflow-hidden relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                   <div className="space-y-6">
                      <h2 className="text-[32px] font-bold leading-tight underline decoration-ocean-500 decoration-8 underline-offset-8">16. HUBUNGI KAMI</h2>
                      <p className="text-[16px] opacity-70 font-normal leading-relaxed">Customer Service EnStore siap membantu pertanyaan atau dukungan operasional setiap hari:</p>
                      <div className="space-y-1">
                        <p className="text-[28px] font-bold tracking-wider">085842712135</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-normal italic">WhatsApp / Telepon - enpii studio official</p>
                      </div>
                   </div>
                   <div className="bg-white/10 p-10 rounded-[40px] border border-white/5 backdrop-blur-xl">
                      <p className="text-[15px] font-bold uppercase tracking-widest text-ocean-400 mb-6 underline underline-offset-8 decoration-ocean-400/30">17. Pernyataan Persetujuan</p>
                      <ul className="space-y-3">
                         {[
                           "Telah membaca & memahami Ketentuan",
                           "Menyetujui terikat dengan Ketentuan ini",
                           "Menggunakan layanan atas risiko sendiri",
                           "Memenuhi syarat usia minimum (13 thn)"
                         ].map((text, i) => (
                            <li key={i} className="flex items-center gap-3 text-[14px] font-normal opacity-70">
                               <span className="w-1.5 h-1.5 rounded-full bg-ocean-500"></span>
                               <span>{text}</span>
                            </li>
                         ))}
                      </ul>
                      <div className="h-px bg-white/10 w-full my-8"></div>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.4em]">AUTHORIZED TERMS 2026</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* FINAL COPYRIGHT */}
            <div className="pb-16 text-center space-y-4 pt-10">
               <p className="text-[11px] font-bold text-brand-500/20 uppercase tracking-[1.5em]">ENSTORE BY ENPII STUDIO</p>
               <p className="text-[10px] font-normal text-brand-500/10 tracking-widest uppercase">SYARAT & KETENTUAN VERIFIED: 19 FEBRUARI 2026</p>
            </div>

          </div>
        </div>

        {/* Floating Back to Top */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-10 right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-enstore transition-transform"
        >
          <ArrowUpwardRounded />
        </motion.button>
      </div>
    </div>
  );
}
