"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  RocketLaunchRounded,
  SecurityRounded,
  SupportAgentRounded,
  GroupsRounded,
  LocalPostOfficeRounded,
  LocationOnRounded,
} from "@mui/icons-material";

export default function AboutPage() {
  const values = [
    {
      title: "Cepat & Instan",
      desc: "Transaksi diproses secara otomatis dalam hitungan detik setelah pembayaran terverifikasi.",
      icon: <RocketLaunchRounded className="text-ocean-500" />,
    },
    {
      title: "Keamanan Terjamin",
      desc: "Kami menggunakan gateway pembayaran resmi dan sistem keamanan terkini untuk menjaga data Anda.",
      icon: <SecurityRounded className="text-ocean-500" />,
    },
    {
      title: "Layanan 24/7",
      desc: "Sistem kami bekerja tanpa henti setiap hari, siap melayani kebutuhan top-up Anda kapan saja.",
      icon: <SupportAgentRounded className="text-ocean-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-cloud-200 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-0">
        {/* Hero Section */}
        <div className="mx-auto mb-20 max-w-4xl space-y-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-brand-500 md:text-6xl"
          >
            Tentang <span className="text-ocean-500">EnStore</span> 🚀
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-relaxed font-medium text-brand-500/60 md:text-xl"
          >
            EnStore adalah platform top-up game dan layanan PPOB terpercaya yang
            hadir untuk memudahkan para gamer dan masyarakat Indonesia dalam
            mengelola kebutuhan digital mereka.
          </motion.p>
        </div>

        {/* Vision & Mission */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[48px] border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore"
          >
            <h2 className="mb-4 text-2xl font-black text-brand-500">
              Visi Kami
            </h2>
            <p className="leading-relaxed font-bold text-brand-500/60">
              Menjadi platform layanan digital nomor satu di Indonesia yang
              mengutamakan kecepatan, keamanan, dan kemudahan bagi setiap
              pengguna.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[48px] border border-brand-500/5 bg-smoke-200 p-10 shadow-enstore"
          >
            <h2 className="mb-4 text-2xl font-black text-brand-500">
              Misi Kami
            </h2>
            <p className="leading-relaxed font-bold text-brand-500/60">
              Menyediakan ekosistem top-up yang transparan, harga yang
              kompetitif, serta dukungan pelanggan yang responsif bagi seluruh
              komunitas gamer.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="mb-20 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-brand-500">
              Kenapa Memilih Kami?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 text-center transition-all hover:border-ocean-500/20"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-500/10 transition-transform group-hover:scale-110">
                  {val.icon}
                </div>
                <h3 className="mb-3 text-xl font-black text-brand-500">
                  {val.title}
                </h3>
                <p className="text-sm leading-relaxed font-bold text-brand-500/40">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact info placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-10 rounded-[56px] bg-brand-500 p-12 text-cloud-200 md:flex-row"
        >
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-black">Punya Pertanyaan?</h2>
            <p className="font-medium text-cloud-200/60">
              Tim support kami siap membantu Anda kapan saja.
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <LocalPostOfficeRounded />
              </div>
              <div>
                <p className="text-[10px] font-black text-cloud-200/40 uppercase">
                  Email
                </p>
                <p className="font-bold">support@enstore.id</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <LocationOnRounded />
              </div>
              <div>
                <p className="text-[10px] font-black text-cloud-200/40 uppercase">
                  Alamat
                </p>
                <p className="font-bold">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
