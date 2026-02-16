"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ErrorOutlineRounded,
  RefreshRounded,
  HomeRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex justify-center"
          >
            <ErrorOutlineRounded className="text-[120px] text-red-500" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-8xl font-bold text-brand-500/90">500</h1>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-brand-500/90">
            Terjadi Kesalahan 🛠️
          </h2>
          <p className="font-bold text-brand-500/40">
            Maaf, sistem kami sedang mengalami gangguan sejenak. Silakan coba
            lagi nanti.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] text-brand-500/20">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            variant="primary"
            size="md"
            fullWidth
            icon={<RefreshRounded />}
            onClick={() => reset()}
          >
            Coba Lagi
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="white"
              size="md"
              fullWidth
              icon={<HomeRounded />}
              className="border border-brand-500/5"
            >
              Beranda
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
