"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LocalOfferRounded,
  ContentCopyRounded,
  SearchRounded,
  CheckRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/config";

interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_purchase: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  user_remaining: number | null;
  is_available: boolean;
  start_date: string | null;
  end_date: string | null;
}

export default function PromosPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Voucher[]>(ENDPOINTS.transactions.vouchers);
      if (res.success && Array.isArray(res.data)) {
        setVouchers(res.data);
      }
    } catch {
      toast.error("Gagal memuat promo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success(`Kode "${code}" berhasil disalin!`);
      setTimeout(() => setCopiedCode(null), 3000);
    });
  };

  const filtered = vouchers.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDiscount = (v: Voucher) =>
    v.discount_type === "percent"
      ? `${v.discount_value}% OFF`
      : `Rp ${v.discount_value.toLocaleString("id-ID")} OFF`;

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Promo & Voucher"
        emoji="🎫"
        description="Gunakan kode promo berikut saat checkout untuk mendapatkan diskon."
      />

      {/* Search */}
      <div className="relative max-w-md">
        <SearchRounded className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30" />
        <input
          type="text"
          placeholder="Cari promo atau kode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-brand-500/5 bg-smoke-200 py-3 pr-4 pl-12 font-bold text-brand-500/90 outline-none placeholder:font-normal placeholder:text-brand-500/30 focus:ring-4 focus:ring-ocean-500/10"
        />
      </div>

      {/* Voucher Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-cloud-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <LocalOfferRounded className="mb-4 text-7xl text-brand-500/10" />
          <h3 className="text-lg font-bold text-brand-500/40">
            {search ? "Promo tidak ditemukan" : "Belum ada promo tersedia"}
          </h3>
          <p className="mt-2 text-sm text-brand-500/25">
            {search
              ? "Coba kata kunci lain"
              : "Pantau terus halaman ini untuk penawaran terbaru!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((voucher, idx) => {
            const isCopied = copiedCode === voucher.code;
            const endDate = formatDate(voucher.end_date);
            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`overflow-hidden rounded-2xl border bg-smoke-200 shadow-sm transition-opacity ${
                  voucher.is_available
                    ? "border-brand-500/5"
                    : "border-brand-500/5 opacity-50"
                }`}
              >
                {/* Top */}
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-500">
                    <LocalOfferRounded />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-brand-500/90">
                        {voucher.name}
                      </h3>
                      {!voucher.is_available && (
                        <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                          Habis
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-lg font-bold text-ocean-500">
                      {formatDiscount(voucher)}
                    </p>
                    {endDate && (
                      <p className="mt-1 text-xs text-brand-500/40">
                        Berlaku s/d {endDate}
                      </p>
                    )}
                    {voucher.user_remaining !== null &&
                      voucher.is_available && (
                        <p className="mt-1 text-xs font-bold text-amber-500">
                          Sisa {voucher.user_remaining}x penggunaan
                        </p>
                      )}
                  </div>
                </div>

                {/* Divider dashed */}
                <div className="mx-5 flex items-center gap-0">
                  <div className="h-5 w-5 -translate-x-1/2 rounded-full bg-cloud-200" />
                  <div className="h-px flex-1 border-t-2 border-dashed border-brand-500/10" />
                  <div className="h-5 w-5 translate-x-1/2 rounded-full bg-cloud-200" />
                </div>

                {/* Bottom Code + Copy */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                      Kode Promo
                    </p>
                    <p className="mt-0.5 font-mono text-base font-bold tracking-wider text-brand-500/90">
                      {voucher.code}
                    </p>
                  </div>
                  {voucher.is_available && (
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                        isCopied
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-ocean-500 text-smoke-200 hover:bg-ocean-600"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckRounded fontSize="small" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <ContentCopyRounded fontSize="small" />
                          Salin
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
