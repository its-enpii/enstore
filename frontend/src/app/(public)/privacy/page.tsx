"use client";

import React from "react";
import Link from "next/link";
import {
  GppGoodRounded,
  ArrowForwardRounded,
  LockRounded,
  ArrowUpwardRounded,
  SecurityRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";

export default function PrivacyPage() {
  const tableOfContents = [
    { id: "pendahuluan", label: "1. Pendahuluan" },
    { id: "informasi-dikumpulkan", label: "2. Informasi yang Kami Kumpulkan" },
    { id: "penggunaan-informasi", label: "3. Cara Kami Menggunakan Informasi" },
    { id: "pembagian-informasi", label: "4. Pembagian Informasi Pihak Ketiga" },
    { id: "penyimpanan", label: "5. Penyimpanan dan Keamanan Data" },
    { id: "hak", label: "6. Hak Anda atas Data Pribadi" },
    { id: "anak", label: "7. Data Anak-Anak" },
    { id: "transfer", label: "8. Transfer Data Internasional" },
    { id: "perubahan", label: "9. Perubahan Kebijakan Privasi" },
    { id: "marketing", label: "10. Penggunaan Tujuan Marketing" },
    { id: "cookies", label: "11. Cookies dan Pelacakan" },
    { id: "local-storage", label: "11A. Penyimpanan Local Storage" },
    { id: "tautan", label: "12. Tautan ke Situs Pihak Ketiga" },
    { id: "yurisdiksi", label: "13. Yurisdiksi dan Hukum Berlaku" },
    { id: "pelanggaran", label: "14. Pelanggaran Data" },
    { id: "hubungi-kami", label: "15. Hubungi Kami" },
    { id: "persetujuan", label: "16. Pernyataan Persetujuan" },
    { id: "komitmen", label: "17. Komitmen Kami" },
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
            <GppGoodRounded fontSize="small" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-brand-500">Privacy Protection</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold leading-tight text-brand-500 md:text-6xl"
          >
            Kebijakan <span className="text-ocean-500">Privasi</span>
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
                  <LockRounded className="text-ocean-500" />
                  Navigasi Privasi
                </h3>
                <nav className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] custom-scrollbar pr-2">
                  {tableOfContents.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className="group flex items-center justify-between rounded-xl p-3 transition-all hover:bg-white hover:shadow-enstore"
                    >
                      <span className="text-sm font-medium text-brand-500/60 group-hover:text-ocean-600">
                        {item.label}
                      </span>
                      <ArrowForwardRounded className="text-brand-500/20 group-hover:translate-x-1 group-hover:text-ocean-500" fontSize="small" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Status Card */}
              <div className="rounded-[40px] bg-brand-500 p-10 text-white shadow-enstore relative overflow-hidden group">
                <div className="relative z-10">
                  <SecurityRounded className="mb-6 h-12 w-12 text-ocean-400" />
                  <h4 className="mb-4 text-2xl font-bold">Keamanan Data</h4>
                  <p className="mb-8 text-base font-normal text-white/50 leading-relaxed">
                    Kami mematuhi UU Pelindungan Data Pribadi No. 27 Tahun 2022 untuk keamanan data Anda.
                  </p>
                  <div className="flex w-full items-center justify-center rounded-2xl bg-ocean-500 py-4 font-bold text-white shadow-enstore">
                    SIRT 2026 ACTIVE
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
                    Selamat datang di EnStore! Kebijakan Privasi ini menjelaskan bagaimana enpii studio (&quot;kami&quot;, &quot;EnStore&quot;) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
                  </p>
                  <p className="text-[16px] font-normal leading-relaxed text-brand-500/60">
                    Kami berkomitmen untuk melindungi privasi Anda dan menangani data pribadi Anda dengan bertanggung jawab sesuai dengan peraturan perundang-undangan yang berlaku di Indonesia, termasuk UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
                  </p>
                  <div className="pt-8 border-t border-brand-500/5">
                    <p className="mb-4 font-bold text-brand-500">Informasi Kontak:</p>
                    <ul className="space-y-2 text-[16px] font-normal text-brand-500/60">
                      <li>• Operator: enpii studio</li>
                      <li>• Kontak: 085842712135</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* 2. INFORMASI YANG KAMI KUMPULKAN */}
            <section id="informasi-dikumpulkan" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">2. INFORMASI YANG KAMI KUMPULKAN</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">2.1 Informasi yang Anda Berikan Langsung</h3>
                      <p className="mb-4 font-bold text-brand-500 uppercase tracking-tight text-xs">A. Mendaftar Akun:</p>
                      <p className="mb-4">Pendaftaran Manual: Nama lengkap, alamat email, nomor telepon/WhatsApp, foto profil (opsional), password (di-hash).</p>
                      <p className="mb-4">Pendaftaran melalui OAuth (Google/Facebook): Kami menerima nama lengkap, alamat email, foto profil, dan User ID unik dari provider tersebut.</p>
                      
                      <p className="mb-4 font-bold text-brand-500 uppercase tracking-tight text-xs">B. Melakukan Transaksi:</p>
                      <p className="mb-4">Sebagai Guest: Nomor tujuan (telepon, ID pelanggan, ID game, dll), email, nomor HP, detail transaksi dan pembayaran.</p>
                      <p className="mb-4">Sebagai Member: Nomor tujuan, riwayat transaksi, metode pembayaran yang dipilih, detail pembayaran.</p>

                      <p className="mb-4 font-bold text-brand-500 uppercase tracking-tight text-xs">C. Customer Service:</p>
                      <p>Isi percakapan dan informasi yang Anda sampaikan terkait keluhan atau pertanyaan.</p>
                   </div>

                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
                      <p>Kami mengumpulkan alamat IP, jenis perangkat dan browser, waktu akses, aktivitas transaksi, serta log sistem untuk keamanan dan troubleshooting. EnStore tidak menggunakan cookies untuk tracking.</p>
                   </div>

                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">2.3 Informasi dari Pihak Ketiga</h3>
                      <p>Kami menerima informasi dari Tripay (data pembayaran), Digiflazz (status pengiriman produk), dan berbagai Provider terkait konfirmasi keberhasilan transaksi.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 3. CARA KAMI MENGGUNAKAN INFORMASI */}
            <section id="penggunaan-informasi" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight text-center">3. CARA PENGGUNAAN INFORMASI</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div className="space-y-4">
                      <h3 className="text-[18px] font-bold text-brand-500">3.1 Penyediaan Layanan</h3>
                      <p>Memproses transaksi, mengirimkan produk digital, mengelola akun/saldo, dan memverifikasi identitas pengguna platform.</p>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[18px] font-bold text-brand-500">3.2 Komunikasi</h3>
                      <p>Mengirim konfirmasi transaksi, update status pesanan, merespons pertanyaan/keluhan, serta info penting layanan.</p>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[18px] font-bold text-brand-500">3.3 Keamanan</h3>
                      <p>Mendeteksi/mencegah penipuan, melindungi platform dan pengguna, serta mematuhi kewajiban hukum yang berlaku.</p>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[18px] font-bold text-brand-500">3.4 Program Reward</h3>
                      <p>Menghitung poin, memproses penukaran poin, dan mengelola program loyalitas pelanggan secara sistematis.</p>
                   </div>
                </div>
                <div className="mt-12 p-8 bg-white rounded-[32px] border border-brand-500/5 text-[16px] font-normal text-brand-500/60">
                   <h3 className="mb-4 text-[18px] font-bold text-brand-500">3.6 OAuth Authentication</h3>
                   <p className="mb-4">Data nama, email, dan foto profil dari Google/Facebook digunakan untuk verifikasi identitas, setup profil, dan kemudahan login tanpa password tambahan.</p>
                   <p>Kami tidak mengakses timeline, posting, pesan pribadi, daftar teman, atau memposting apapun atas nama Anda tanpa izin.</p>
                </div>
              </motion.div>
            </section>

            {/* 4. PEMBAGIAN INFORMASI */}
            <section id="pembagian-informasi" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">4. PEMBAGIAN INFORMASI PIHAK KETIGA</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-white border border-brand-500/5 rounded-[32px] shadow-enstore">
                         <p className="mb-4 font-bold text-brand-500">a) OAuth Providers:</p>
                         <p>Google & Facebook memberikan data profil dasar untuk mempermudah login. Anda dapat mencabut akses via pengaturan masing-masing provider.</p>
                      </div>
                      <div className="p-8 bg-white border border-brand-500/5 rounded-[32px] shadow-enstore">
                         <p className="mb-4 font-bold text-brand-500">b) Mitra Transaksi:</p>
                         <p>Tripay (Payment Gateway) dan Digiflazz (Distributor) menerima data minimal yang diperlukan untuk memproses pembayaran dan produk Anda.</p>
                      </div>
                   </div>
                      <div className="p-8 bg-ocean-500/5 rounded-[32px] border border-ocean-500/10 text-center font-normal">
                      <p>Kami TIDAK menjual data pribadi Anda kepada pihak ketiga atau membagikannya untuk tujuan marketing tanpa persetujuan Anda.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 5-7 SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { id: "penyimpanan", t: "5. Penyimpanan Data", d: "Data transaksional disimpan minimal 5 tahun (sesuai hukum fiskal RI). Data akun disimpan selama aktif atau atas permintaan penghapusan." },
                 { id: "hak", t: "6. Hak Anda", d: "Anda berhak akses, koreksi, hapus, batasi pemrosesan, portabilitas data, dan menarik persetujuan pemrosesan data marketing kapan saja." },
                 { id: "anak", t: "7. Data Anak", d: "EnStore tidak sengaja mengumpulkan data anak di bawah 13 tahun. Segera hubungi CS jika ada data anak tanpa izin wali." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <motion.div className="h-full rounded-3xl bg-smoke-200 border border-brand-500/5 p-8 shadow-enstore">
                       <h3 className="font-bold text-brand-500 text-[14px] mb-4 uppercase tracking-widest border-b border-brand-500/5 pb-2">{item.t}</h3>
                       <p className="text-[14px] text-brand-500/60 font-normal leading-relaxed">{item.d}</p>
                    </motion.div>
                  </section>
               ))}
            </div>

            {/* 8-11 SECTIONS - NEWLY ADDED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { id: "transfer", h: "8. Transfer Data", d: "Saat ini EnStore hanya beroperasi di Indonesia. Transfer internasional hanya dilakukan dengan pemberitahuan dan perlindungan hukum setara sesuai regulasi PDP." },
                 { id: "perubahan", h: "9. Perubahan Kebijakan", d: "Kami dapat mengubah kebijakan ini dari waktu ke waktu. Pemberitahuan akan diberikan melalui platform atau email untuk setiap perubahan material yang signifikan." },
                 { id: "marketing", h: "10. Tujuan Marketing", d: "Dengan izin Anda, kami dapat mengirimkan informasi promo dan newsletter. Anda tetap memegang kendali penuh untuk berhenti berlangganan (opt-out) kapan saja." },
                 { id: "cookies", h: "11. Cookies & Pelacakan", d: "EnStore saat ini TIDAK menggunakan cookies atau teknologi pelacakan pihak ketiga untuk analytics. Kami memprioritaskan privasi browsing Anda." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="h-full rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-enstore border-t-4 border-t-ocean-500">
                       <h3 className="text-[14px] font-bold text-brand-500 mb-6 uppercase tracking-widest border-b border-brand-500/5 pb-4">{item.h}</h3>
                       <p className="text-[14px] font-normal text-brand-500/60 leading-relaxed">{item.d}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 11A. LOCAL STORAGE SECTION */}
            <section id="local-storage" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border-4 border-ocean-500/10 bg-smoke-200 p-8 md:p-14"
              >
                <div className="flex items-center gap-8 mb-10 border-b border-brand-500/10 pb-8">
                   <div className="w-16 h-16 bg-ocean-500 rounded-[24px] flex items-center justify-center text-white text-[32px] shadow-enstore">💾</div>
                   <h2 className="text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight uppercase">11A. LOCAL STORAGE</h2>
                </div>
                
                <div className="space-y-8 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <p>Local Storage memungkinkan website menyimpan data di perangkat Anda tanpa dikirim otomatis ke server. EnStore menggunakannya untuk:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white p-8 rounded-[32px] border border-brand-500/5 shadow-enstore">
                         <p className="mb-2 font-bold text-brand-500">Token Autentikasi</p>
                         <p className="text-sm opacity-60">Menjaga sesi login terenkripsi agar Anda tidak perlu login berulang kali.</p>
                      </div>
                      <div className="bg-white p-8 rounded-[32px] border border-brand-500/5 shadow-enstore">
                         <p className="mb-2 font-bold text-brand-500">Daftar Favorit</p>
                         <p className="text-sm opacity-60">Mengingat produk favorit akses cepat di dashboard dashboard pengguna.</p>
                      </div>
                      <div className="bg-white p-8 rounded-[32px] border border-brand-500/5 shadow-enstore">
                         <p className="mb-2 font-bold text-brand-500">Preferensi</p>
                         <p className="text-sm opacity-60">Mengingat pilihan tema, bahasa, atau tampilan visual pilihan Anda.</p>
                      </div>
                   </div>
                   <div className="p-8 bg-brand-500 rounded-[32px] text-white">
                      <p className="mb-4 font-bold uppercase tracking-tight text-xs opacity-50">Dampak Menghapus Local Storage:</p>
                      <p>Anda akan otomatis logout, daftar favorit akan hilang, dan preferensi visual kembali ke standar default.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 12-14 FINALE */}
            <div className="space-y-10 text-[16px] font-normal leading-relaxed text-brand-500/60">
               {[
                 { id: "tautan", h: "12. TAUTAN PIHAK KETIGA", p: "Tautan ke Tripay, Digiflazz, atau Provider tunduk pada kebijakan privasi masing-masing pihak tersebut." },
                 { id: "yurisdiksi", h: "13. YURISDIKSI DAN HUKUM", p: "Diatur hukum RI, termasuk UU PDP No. 27/2022 dan UU ITE No. 19/2016." },
                 { id: "pelanggaran", h: "14. PELANGGARAN DATA", p: "Jika terjadi pelanggaran data yang membahayakan, kami akan lapor otoritas dan notifikasi user dalam 3x24 jam." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="rounded-3xl border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore border-l-8 border-l-ocean-500">
                       <h3 className="text-[20px] font-bold text-brand-500 mb-4">{item.h}</h3>
                       <p>{item.p}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 15. HUBUNGI KAMI */}
            <section id="hubungi-kami" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] bg-brand-500 p-10 md:p-16 text-white shadow-enstore overflow-hidden relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                   <div className="space-y-6">
                      <h2 className="text-[32px] font-bold leading-tight underline decoration-ocean-500 decoration-8 underline-offset-8">15. HUBUNGI KAMI</h2>
                      <p className="text-[16px] opacity-70 font-normal leading-relaxed">Data Protection Officer EnStore siap membantu keluhan privasi Anda:</p>
                      <div className="space-y-1">
                        <p className="text-[28px] font-bold">085842712135</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-normal">WhatsApp Data Security Team</p>
                      </div>
                   </div>
                   <div className="bg-white/10 p-10 rounded-[40px] border border-white/5 backdrop-blur-xl">
                      <p id="persetujuan" className="text-[15px] font-bold uppercase tracking-widest text-ocean-400 mb-4 font-sans underline underline-offset-8 decoration-ocean-400/30 scroll-mt-32">16. Persetujuan</p>
                      <p className="text-[14px] font-normal opacity-70 leading-relaxed">Dengan menggunakan layanan EnStore, Anda menyetujui pengumpulan dan penggunaan informasi sebagaimana dijelaskan di atas.</p>
                      <div className="h-px bg-white/10 w-full my-8"></div>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.4em]">Privacy Policy Core 2026</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 17. KOMITMEN KAMI - FINAL PREMIUM BOX */}
            <section id="komitmen" className="scroll-mt-32">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="rounded-[40px] border-4 border-brand-500/10 bg-white p-10 md:p-14 shadow-enstore text-center space-y-8"
               >
                  <div className="mx-auto w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center text-white text-4xl shadow-enstore">
                    ✨
                  </div>
                  <h2 className="text-[28px] font-bold text-brand-500 tracking-tight uppercase">17. Komitmen Privasi Kami</h2>
                  <p className="max-w-2xl mx-auto text-[16px] font-normal text-brand-500/60 leading-relaxed">
                    EnStore berkomitmen untuk melindungi privasi Anda dengan serius, transparan dalam setiap penggunaan data, dan mematuhi seluruh regulasi PDP Indonesia demi keamanan ekosistem digital bersama.
                  </p>
                  <div className="pt-8 flex flex-wrap justify-center gap-4 text-[11px] font-bold text-brand-500/40 uppercase tracking-widest">
                    <span>Transparansi</span>
                    <span className="text-ocean-500">•</span>
                    <span>Keamanan</span>
                    <span className="text-ocean-500">•</span>
                    <span>Kendali Pengguna</span>
                  </div>
               </motion.div>
            </section>

            {/* FINAL COPYRIGHT */}
            <div className="pb-16 text-center space-y-4 pt-10">
               <p className="text-[11px] font-bold text-brand-500/20 uppercase tracking-[1.5em]">ENSTORE BY ENPII STUDIO</p>
               <p className="text-[10px] font-normal text-brand-500/10 tracking-widest uppercase">PRIVASI TERVERIFIKASI MD5: 19 FEBRUARI 2026</p>
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
