"use client";

import React from "react";
import Link from "next/link";
import {
  SecurityRounded,
  ArrowForwardRounded,
  AdminPanelSettingsRounded,
  ArrowUpwardRounded,
  VpnKeyRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";

export default function SecurityPage() {
  const tableOfContents = [
    { id: "pendahuluan", label: "1. Pendahuluan" },
    { id: "komitmen", label: "2. Komitmen Keamanan Kami" },
    { id: "infrastruktur", label: "3. Keamanan Infrastruktur" },
    { id: "aplikasi", label: "4. Keamanan Aplikasi" },
    { id: "data", label: "5. Keamanan Data" },
    { id: "akun", label: "6. Keamanan Akun Pengguna" },
    { id: "transaksi", label: "7. Keamanan Transaksi" },
    { id: "operasional", label: "8. Keamanan Operasional" },
    { id: "monitoring", label: "9. Monitoring dan Logging" },
    { id: "incident-response", label: "10. Incident Response" },
    { id: "business-continuity", label: "11. Business Continuity" },
    { id: "pihak-ketiga", label: "12. Keamanan Pihak Ketiga" },
    { id: "mobile-web", label: "13. Keamanan Mobile dan Web" },
    { id: "compliance", label: "14. Compliance dan Regulasi" },
    { id: "tanggung-jawab-user", label: "15. Tanggung Jawab Pengguna" },
    { id: "pelaporan-kerentanan", label: "16. Pelaporan Kerentanan" },
    { id: "pembaruan", label: "17. Pembaruan Keamanan" },
    { id: "kontrak-keamanan", label: "18. Kontrak Keamanan Kami" },
    { id: "kontak", label: "19. Kontak Keamanan" },
    { id: "penutup", label: "20. Penutup" },
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
            <AdminPanelSettingsRounded fontSize="small" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-brand-500">Security Technicals</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold leading-tight text-brand-500 md:text-6xl"
          >
            Kebijakan <span className="text-ocean-500">Keamanan</span>
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
                  <VpnKeyRounded className="text-ocean-500" />
                  Navigasi Teknikal
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
                  <div className="mb-6 flex items-center gap-3">
                     <div className="h-4 w-4 rounded-full bg-ocean-400 shadow-enstore animate-pulse"></div>
                     <span className="text-[10px] font-bold tracking-widest text-ocean-400 uppercase">System Operational</span>
                  </div>
                  <h4 className="mb-4 text-2xl font-bold">Infrastruktur Aman</h4>
                  <p className="mb-8 text-base font-normal text-white/50 leading-relaxed">
                    Setiap request API dilindungi enkripsi TLS 1.3 dan monitoring 24/7.
                  </p>
                  <div className="flex w-full items-center justify-center rounded-2xl bg-ocean-500 py-4 font-bold text-white shadow-enstore">
                    SIRT-2026 ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technical Content Area */}
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
                    Keamanan adalah prioritas utama EnStore. Dokumen Kebijakan Keamanan ini menjelaskan bagaimana kami melindungi platform, data pengguna, dan transaksi dari ancaman keamanan cyber.
                  </p>
                  <p className="text-[16px] font-normal leading-relaxed text-brand-500/60 font-normal">
                    EnStore berkomitmen untuk menyediakan lingkungan yang aman bagi pengguna untuk melakukan transaksi top up dan pembayaran tagihan dengan tenang dan terlindungi.
                  </p>
                  <div className="pt-8 border-t border-brand-500/5">
                    <p className="mb-4 font-bold text-brand-500">Security Contact:</p>
                    <ul className="space-y-2 text-[16px] font-normal text-brand-500/60">
                      <li>• Operator: enpii studio</li>
                      <li>• Kontak: 085842712135</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* 2. KOMITMEN KEAMANAN KAMI */}
            <section id="komitmen" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">2. KOMITMEN KEAMANAN KAMI</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div>
                      <h3 className="mb-6 text-[18px] font-bold text-brand-500">2.1 Prinsip Keamanan</h3>
                      <p>Kami menerapkan prinsip keamanan berlapis (defense in depth) yang meliputi Kerahasiaan, Integritas, Ketersediaan, Autentikasi menyeluruh, serta Otorisasi hak akses yang ketat sesuai regulasi.</p>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-8">
                         {[
                           { t: "Kerahasiaan", d: "Melindungi data dari akses tidak sah.", i: "🔒", c: "bg-brand-500/5" },
                           { t: "Integritas", d: "Memastikan data tidak diubah tanpa otorisasi.", i: "✅", c: "bg-ocean-500/5" },
                           { t: "Ketersediaan", d: "Menjaga layanan tetap dapat diakses 24/7.", i: "⚡", c: "bg-brand-500/5" }
                         ].map((item, i) => (
                            <div key={i} className={`rounded-[32px] p-6 border border-brand-500/5 ${item.c} text-center shadow-enstore`}>
                               <span className="text-3xl mb-4 block">{item.i}</span>
                               <h4 className="mb-2 font-bold text-brand-500 text-xs uppercase tracking-widest">{item.t}</h4>
                               <p className="text-[11px] leading-relaxed opacity-60">{item.d}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="pt-8 border-t border-brand-500/5">
                      <h3 className="mb-4 text-[18px] font-bold text-brand-500">2.2 Standar Keamanan</h3>
                      <p>Kami mengikuti praktik terbaik industri dan standar keamanan yang diakui secara internasional dalam setiap tahap pengelolaan infrastruktur platform dan data transaksi pengguna.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 3. KEAMANAN INFRASTRUKTUR */}
            <section id="infrastruktur" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight">3. KEAMANAN INFRASTRUKTUR</h2>
                <div className="space-y-12 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <h3 className="text-[18px] font-bold text-brand-500 border-l-4 border-ocean-500 pl-4">3.1 Keamanan Server</h3>
                         <ul className="space-y-2 text-sm opacity-80">
                            <li>• Hosting Aman (Firewall Enterprise)</li>
                            <li>• Pembaruan Software & OS Rutin</li>
                            <li>• Monitoring 24/7 (Anomaly Detection)</li>
                            <li>• Backup Otomatis & Disaster Recovery</li>
                            <li>• Isolasi Lingkungan Prod/Staging</li>
                         </ul>
                      </div>
                      <div className="space-y-4">
                         <h3 className="text-[18px] font-bold text-brand-500 border-l-4 border-ocean-500 pl-4">3.2 Keamanan Jaringan</h3>
                         <p className="text-sm opacity-80">Perlindungan perimeter dengan aturan ketat, DDoS Protection, Intrusion Detection System (IDS), VPN Access untuk admin, serta Segmentasi Jaringan komponen kritis.</p>
                      </div>
                   </div>
                   <div className="p-8 bg-white rounded-[32px] border border-brand-500/5 shadow-enstore">
                      <h3 className="mb-4 text-[18px] font-bold text-brand-500">3.3 Keamanan Database</h3>
                      <p className="text-sm opacity-80">Enkripsi at Rest untuk data sensitif, Access Control berbasis Least Privilege, proteksi Query melalui Parameterization, serta Database Audit Logging yang mencatat setiap akses data.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 4. KEAMANAN APLIKASI */}
            <section id="aplikasi" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] border border-brand-500/5 bg-brand-500 p-8 md:p-14 text-white shadow-enstore"
              >
                <h2 className="mb-10 text-[24px] font-bold text-white md:text-[32px] tracking-tight">4. KEAMANAN APLIKASI</h2>
                <div className="space-y-12 text-[16px] font-normal text-white/70 leading-relaxed">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <h3 className="text-ocean-400 uppercase tracking-widest text-[12px] font-bold">4.1 Secure Development</h3>
                         <ul className="space-y-2 text-[15px] opacity-70">
                            <li>• Secure Coding Practices (OWASP)</li>
                            <li>• Mandatory Code Review System</li>
                            <li>• Dependency Scanning & Sanitization</li>
                            <li>• Input Validation & Output Encoding</li>
                         </ul>
                      </div>
                      <div className="space-y-6">
                         <h3 className="text-ocean-400 uppercase tracking-widest text-[12px] font-bold">4.2 Keamanan API</h3>
                         <ul className="space-y-2 text-[15px] opacity-70">
                            <li>• Rate Limiting (Abuse Prevention)</li>
                            <li>• Bearer Token Authentication</li>
                            <li>• HMAC Request Signing Protocols</li>
                            <li>• Enforced HTTPS Only Connect</li>
                         </ul>
                      </div>
                   </div>
                   <div className="rounded-[32px] bg-white/10 p-8 border border-white/5 backdrop-blur-sm">
                      <p className="text-[14px] opacity-80">Kami menangani ancaman SQL Injection, XSS, CSRF, Clickjacking, dan Man-in-the-Middle melalui standardisasi prosedur teknis yang ketat di seluruh platform.</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* 5-7 SECTIONS */}
            <div className="space-y-10">
                {[
                 { id: "data", t: "5. Keamanan Data", d: "Password di-hash bcrypt/Argon2. Transmisi via TLS 1.2+ dengan Forward Secrecy. Data finansial dienkripsi AES-256 via KMS. Kebijakan retensi data minimal 5 tahun (fiskal RI)." },
                 { id: "akun", t: "6. Keamanan Akun", d: "OAuth 2.0 Google/FB menjamin kami tidak simpan password Anda. Dilengkapi Session Management otomatis, notifikasi perangkat baru, PIN transaksi, dan batas limit harian." },
                 { id: "transaksi", t: "7. Keamanan Transaksi", d: "Tripay (PCI-DSS) compliant. Implementasi Idempotensi, Automated Fraud Detection AI-based, serta review manual untuk pola aktivitas mencurigakan nilai tinggi." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore border-l-8 border-l-ocean-500">
                       <h3 className="text-[20px] font-bold text-brand-500 mb-4 uppercase tracking-tight">{item.t}</h3>
                       <p className="text-[16px] font-normal text-brand-500/60 leading-relaxed">{item.d}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 8-12 TECHNICAL - GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                 { id: "operasional", t: "8. Operasional", d: "Background checks SDM, least privilege access, audit log sistem admin, serta audit berkala terhadap vendor Tripay & Digiflazz." },
                 { id: "monitoring", t: "9. Monitoring", d: "SIEM Aggregation untuk deteksi anomali real-time. Log audit login/mutasi disimpan minimal 1 tahun untuk investigasi." },
                 { id: "incident", t: "10. Respons Tim", d: "SIRT aktif: Deteksi → Analisis → Isolasi → Pembersihan → Pemulihan. Notifikasi pelanggaran data dalam maksimal 3x24 jam." },
                 { id: "continuity", t: "11. Kelangsungan", d: "Backup offsite harian terenkripsi, RTO pemulihan 4 jam, RPO data 1 jam, serta High Availability Load Balancing." },
                 { id: "pihak-ketiga", t: "12. Mitra Pihak Ke-3", d: "Validasi Webhook Signature Digiflazz aggregator via HTTPS. EnStore tidak memiliki kerjasama langsung dengan provider telekomunikasi/PLN." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <motion.div className="h-full rounded-3xl bg-smoke-200 border border-brand-500/5 p-8 shadow-enstore">
                       <h3 className="font-bold text-brand-500 text-[14px] mb-4 uppercase tracking-widest border-b border-brand-500/5 pb-2">{item.t}</h3>
                       <p className="text-[13px] text-brand-500/60 font-normal leading-relaxed">{item.d}</p>
                    </motion.div>
                  </section>
               ))}
            </div>

            {/* 13. KEAMANAN MOBILE DAN WEB */}
            <section id="mobile-web" className="scroll-mt-32">
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 md:p-14 shadow-enstore"
               >
                  <h2 className="mb-10 text-[24px] font-bold text-brand-500 md:text-[32px] tracking-tight uppercase text-center">13. KEAMANAN WEB & STORAGE</h2>
                  <div className="space-y-10 text-[16px] font-normal text-brand-500/60 leading-relaxed">
                     <p>Implementasi Security Headers (CSP, HSTS, X-Frame-Options), Secure Cookies (HttpOnly/SameSite), serta pembatasan CORS Policy untuk mencegah intrusi lintas domain tidak sah.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        <div className="bg-white p-8 rounded-[32px] border border-brand-500/5 shadow-enstore">
                           <h4 className="mb-4 font-bold text-brand-500 uppercase tracking-tight text-xs">A. Local Storage Security:</h4>
                           <p className="text-sm opacity-70">Token JWT dienkripsi AES, rotasi token terjadwal, invalidasi session saat logout, serta server-side validation berkala for setiap aktif session.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-brand-500/5 shadow-enstore">
                           <h4 className="mb-4 font-bold text-brand-500 uppercase tracking-tight text-xs">B. XSS Protection:</h4>
                           <p className="text-sm opacity-70">Vaksinasi Input, Output Encoding sistematis, DOM Sanitization, serta Content Security Policy tingkat lanjut for membatasi sumber script berbahaya.</p>
                        </div>
                     </div>
                     <p className="mt-8 text-center text-ocean-500 font-bold uppercase tracking-widest text-[10px]">PENTING: Kami TIDAK PERNAH menyimpan Password, PIN, atau OTP di Local Storage.</p>
                  </div>
               </motion.div>
            </section>

            {/* 14-17 SECTIONS - BOXED */}
            <div className="space-y-8 text-[16px] font-normal leading-relaxed text-brand-500/60">
                {[
                 { id: "compliance", h: "14. COMPLIANCE & REGULASI", p: "Sesuai UU PDP No. 27/2022, UU ITE No. 19/2016, serta regulasi BI/OJK terkait sistem pembayaran digital nasional." },
                 { id: "tanggung-jawab-user", h: "15. TANGGUNG JAWAB PENGGUNA", p: "Pengguna wajib password kuat, tidak berbagi OTP/PIN, verifikasi URL domain resmi accounts.google.com/facebook.com, dan logout di perangkat publik." },
                 { id: "pelaporan-kerentanan", h: "16. BUG BOUNTY PROGRAM", p: "Program Responsible Disclosure aktif untuk peneliti keamanan. Reward tersedia bagi laporan kerentanan valid/kritikal melalui verifikasi tim SIRT." },
                 { id: "pembaruan", h: "17. PEMBARUAN KEAMANAN", p: "Patch management berkelanjutan, publikasi security advisory jika diperlukan, serta audit teknis berkala sistem dan infrastruktur." }
               ].map((item) => (
                  <section key={item.id} id={item.id} className="scroll-mt-32">
                    <div className="rounded-3xl border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore border-r-6 border-r-ocean-500">
                       <h3 className="text-[20px] font-bold text-brand-500 mb-4">{item.h}</h3>
                       <p>{item.p}</p>
                    </div>
                  </section>
               ))}
            </div>

            {/* 18. KONTRAK KEAMANAN - PREMIUM FINALE */}
            <section id="kontrak-keamanan" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] bg-brand-500 p-10 md:p-16 text-white shadow-enstore overflow-hidden relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                   <div className="space-y-6">
                      <h2 className="text-[32px] font-bold leading-tight underline decoration-ocean-500 decoration-8 underline-offset-8">18. KONTRAK KAMI</h2>
                      <p className="text-[16px] opacity-70 font-normal leading-relaxed">SIRT EnStore siap membantu pelaporan masalah keamanan atau investigasi kejanggalan akun:</p>
                      <div className="space-y-1">
                        <p className="text-[28px] font-bold tracking-wider">085842712135</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-normal italic">Security Hotline & SIRT Official</p>
                      </div>
                   </div>
                   <div className="bg-white/10 p-10 rounded-[40px] border border-white/5 backdrop-blur-xl">
                      <p className="text-[15px] font-bold uppercase tracking-widest text-ocean-400 mb-6 underline underline-offset-8 decoration-ocean-400/30">19. Audit Technical</p>
                      <p className="text-[14px] font-normal opacity-70 leading-relaxed mb-8">Setiap butir kebijakan adalah standar operasional wajib bagi enpii studio demi menjaga ekosistem digital EnStore yang aman.</p>
                      <div className="h-px bg-white/10 w-full mb-8"></div>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.4em]">20. Stay Safe, Stay Secure! 🔒</p>
                   </div>
                </div>
              </motion.div>
            </section>

            {/* FINAL COPYRIGHT */}
            <div className="pb-16 text-center space-y-4 pt-10">
               <p className="text-[11px] font-bold text-brand-500/20 uppercase tracking-[1.5em]">ENSTORE BY ENPII STUDIO</p>
               <p className="text-[10px] font-normal text-brand-500/10 tracking-widest uppercase">SECURITY VERIFIED SIRT: 19 FEBRUARI 2026</p>
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
