"use client";

import Link from "next/link";
import { WarningAmberRounded, HomeRounded } from "@mui/icons-material";
import { motion } from "motion/react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="flex justify-center"
          >
            <WarningAmberRounded className="text-[120px] text-brand-500/10" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-8xl font-bold text-brand-500/90">404</h1>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-brand-500/90">
            Halaman Tidak Ditemukan 🏜️
          </h2>
          <p className="font-bold text-brand-500/40">
            Ups! Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={<HomeRounded />}
            >
              Kembali ke Beranda
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full rounded-full px-6 py-3 font-bold text-brand-500/60 transition-colors hover:text-brand-500/90 sm:w-auto"
          >
            Kembali
          </button>
        </div>
      </motion.div>
    </div>
  );
}
