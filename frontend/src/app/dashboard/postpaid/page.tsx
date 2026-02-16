"use client";

import React, { useState, useEffect } from "react";
import {
  ReceiptLongRounded,
  SearchRounded,
  PaymentRounded,
  CheckCircleRounded,
  InfoRounded,
  ErrorOutlineRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";

import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  postpaidInquiry,
  postpaidPay,
  getProducts,
  type Product,
  type PostpaidInquiryResponse,
} from "@/lib/api";

export default function PostpaidPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerNo, setCustomerNo] = useState("");
  const [inquiryResult, setInquiryResult] = useState<
    PostpaidInquiryResponse["data"] | null
  >(null);

  useEffect(() => {
    fetchPostpaidProducts();
  }, []);

  const fetchPostpaidProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        payment_type: "postpaid",
        is_active: true,
      });
      if (res.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !customerNo) {
      toast.error("Pilih layanan dan masukkan ID Pelanggan");
      return;
    }

    setInquiryLoading(true);
    setInquiryResult(null);
    try {
      const res = await postpaidInquiry({
        sku: selectedProduct,
        customer_no: customerNo,
      });

      if (res.success && res.data?.data) {
        setInquiryResult(res.data.data);
        toast.success("Inquiry berhasil!");
      } else {
        toast.error(
          res.message || res.data?.message || "Gagal melakukan inquiry",
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setInquiryLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!inquiryResult) return;

    setPayLoading(true);
    try {
      const res = await postpaidPay({ ref_id: inquiryResult.ref_id });
      if (res.success) {
        toast.success("Pembayaran berhasil diproses!");
        setInquiryResult(null);
        setCustomerNo("");
      } else {
        toast.error(res.message || "Gagal melakukan pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Pembayaran gagal");
    } finally {
      setPayLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Layanan Pascabayar (PPOB)"
        emoji="🧾"
        description="Bayar tagihan PLN, BPJS, PDAM, dan lainnya dengan saldo EnStore."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Inquiry Form */}
        <div className="space-y-6">
          <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black text-brand-500">
              <SearchRounded className="text-ocean-500" /> Cek Tagihan
            </h2>

            <form onSubmit={handleInquiry} className="space-y-4">
              <div className="space-y-2">
                <label className="ml-1 text-xs font-black text-brand-500/40 uppercase">
                  Pilih Layanan
                </label>
                <select
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-brand-500/5 bg-white px-6 py-3 font-bold text-brand-500 transition-all outline-none focus:ring-4 focus:ring-ocean-500/10"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading || inquiryLoading}
                >
                  <option value="">-- Pilih Layanan --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="ml-1 animate-pulse text-[10px] font-bold text-ocean-500">
                    Memuat layanan...
                  </p>
                )}
                {!loading && products.length === 0 && (
                  <p className="ml-1 text-[10px] font-bold text-red-500">
                    Layanan tidak tersedia saat ini.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-black text-brand-500/40 uppercase">
                  ID Pelanggan / No. Meter
                </label>
                <Input
                  fullWidth
                  placeholder="Contoh: 5123456789"
                  value={customerNo}
                  onChange={(e) => setCustomerNo(e.target.value)}
                  disabled={inquiryLoading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={inquiryLoading}
                disabled={!selectedProduct || !customerNo}
                icon={<SearchRounded />}
              >
                Cek Tagihan Sekarang
              </Button>
            </form>
          </div>

          <div className="flex gap-4 rounded-3xl border border-ocean-500/10 bg-ocean-500/5 p-6">
            <InfoRounded className="shrink-0 text-ocean-500" />
            <div className="space-y-1">
              <p className="text-sm font-black text-brand-500">
                Informasi Penting
              </p>
              <p className="text-xs leading-relaxed font-bold text-brand-500/60">
                Pastikan ID Pelanggan Anda benar. Biaya admin mungkin berbeda
                untuk setiap layanan. Transaksi paska bayar hanya bisa
                menggunakan saldo akun.
              </p>
            </div>
          </div>
        </div>

        {/* Inquiry Result */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!inquiryResult ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-brand-500/5 bg-smoke-200/50 p-10 text-center"
              >
                <ReceiptLongRounded className="mb-4 text-7xl text-brand-500/10" />
                <h3 className="text-lg font-black text-brand-500/40">
                  Belum Ada Inquiry
                </h3>
                <p className="mt-2 text-sm font-bold text-brand-500/20">
                  Masukkan detail tagihan di sebelah kiri untuk melihat rincian
                  pembayaran di sini.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8 rounded-[32px] border border-brand-500/5 bg-white p-8 shadow-enstore"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-brand-500">
                    Rincian Tagihan
                  </h2>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                    <CheckCircleRounded />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between border-b border-brand-500/5 pb-4">
                    <div>
                      <p className="text-[10px] font-black text-brand-500/40 uppercase">
                        Pelanggan
                      </p>
                      <p className="text-lg font-black text-brand-500">
                        {inquiryResult.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-brand-500/40 uppercase">
                        ID Pelanggan
                      </p>
                      <p className="font-bold text-brand-500">
                        {inquiryResult.customer_no}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-500/60">Tagihan Pokok</span>
                      <span className="text-brand-500">
                        {formatCurrency(inquiryResult.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-500/60">Biaya Admin</span>
                      <span className="text-brand-500">
                        {formatCurrency(inquiryResult.admin)}
                      </span>
                    </div>
                    {inquiryResult.desc?.denda &&
                      parseInt(inquiryResult.desc.denda) > 0 && (
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-red-500">Denda</span>
                          <span className="text-red-500">
                            {formatCurrency(parseInt(inquiryResult.desc.denda))}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-brand-500/5 pt-6">
                    <span className="text-lg font-black text-brand-500">
                      Total Bayar
                    </span>
                    <span className="text-3xl font-black text-ocean-500">
                      {formatCurrency(inquiryResult.selling_price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handlePayment}
                    isLoading={payLoading}
                    icon={<PaymentRounded />}
                  >
                    Bayar Sekarang
                  </Button>
                  <p className="text-center text-[10px] font-bold text-brand-500/30">
                    Dengan membayar, Anda menyetujui Ketentuan Layanan kami.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
