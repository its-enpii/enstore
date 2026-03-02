"use client";

import React, { useState, useEffect } from "react";
import {
  ReceiptLongRounded,
  SearchRounded,
  PaymentRounded,
  CheckCircleRounded,
  InfoRounded,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";

import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  postpaidInquiry,
  postpaidPay,
  getCustomerPaymentChannels,
  type PostpaidInquiryData,
} from "@/lib/api";
import { getProducts } from "@/lib/api";
import type { Product, ProductItem } from "@/lib/api/types";

interface SelectableItem {
  item: ProductItem;
  product: Product;
}

export default function PostpaidPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allItems, setAllItems] = useState<SelectableItem[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Form State
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [customerNo, setCustomerNo] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [inquiryResult, setInquiryResult] =
    useState<PostpaidInquiryData | null>(null);

  useEffect(() => {
    fetchPostpaidProducts();
    fetchPaymentChannels();
  }, []);

  const fetchPostpaidProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        payment_type: "postpaid",
        is_active: true,
        per_page: 100,
      });
      if (res.success) {
        const fetchedProducts = res.data.data;
        setProducts(fetchedProducts);

        // Flatten all product items into selectable list
        const items: SelectableItem[] = [];
        for (const product of fetchedProducts) {
          if (product.items && product.items.length > 0) {
            for (const item of product.items) {
              if (item.is_active && item.stock_status === "available") {
                items.push({ item, product });
              }
            }
          }
        }
        setAllItems(items);
      }
    } catch (err) {
      console.error("Failed to fetch postpaid products:", err);
      toast.error("Gagal memuat layanan pascabayar");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentChannels = async () => {
    try {
      const res = await getCustomerPaymentChannels();
      if (res.success && Array.isArray(res.data)) {
        setPaymentChannels(res.data);
        // Auto-select first available channel
        const first = res.data.find((c: any) => c.active);
        if (first) setSelectedPaymentMethod(first.code);
      }
    } catch {
      // Silent fail — payment channels optional for now
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !customerNo) {
      toast.error("Pilih layanan dan masukkan ID Pelanggan");
      return;
    }

    setInquiryLoading(true);
    setInquiryResult(null);
    try {
      const res = await postpaidInquiry({
        product_item_id: selectedItemId as number,
        customer_no: customerNo,
      });

      if (res.success && res.data) {
        setInquiryResult(res.data);
        toast.success("Berhasil cek tagihan!");
      } else {
        toast.error(res.message || "Gagal melakukan inquiry");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setInquiryLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!inquiryResult) return;
    if (!selectedPaymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setPayLoading(true);
    try {
      const res = await postpaidPay({
        inquiry_ref: inquiryResult.inquiry_ref,
        payment_method: selectedPaymentMethod,
      });
      if (res.success) {
        toast.success("Pembayaran berhasil diproses!");
        setInquiryResult(null);
        setCustomerNo("");
        setSelectedItemId("");
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

  // Group items by product name for optgroup
  const groupedItems = products.reduce(
    (acc, product) => {
      const productItems = allItems.filter((s) => s.product.id === product.id);
      if (productItems.length > 0) {
        acc[product.name] = productItems;
      }
      return acc;
    },
    {} as Record<string, SelectableItem[]>,
  );

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
          <div className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-brand-500/90">
              <SearchRounded className="text-ocean-500" /> Cek Tagihan
            </h2>

            <form onSubmit={handleInquiry} className="space-y-4">
              {/* Product Item Select */}
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold text-brand-500/40 uppercase">
                  Pilih Layanan
                </label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-brand-500/5 bg-smoke-200 px-6 py-3 pr-10 font-bold text-brand-500/90 transition-all outline-none focus:ring-4 focus:ring-ocean-500/10"
                    value={selectedItemId}
                    onChange={(e) =>
                      setSelectedItemId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    disabled={loading || inquiryLoading}
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {Object.entries(groupedItems).map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName}>
                        {items.map(({ item, product }) => (
                          <option key={item.id} value={item.id}>
                            {product.items && product.items.length > 1
                              ? item.name
                              : product.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <KeyboardArrowDownRounded className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-brand-500/30" />
                </div>
                {loading && (
                  <p className="ml-1 animate-pulse text-[10px] font-bold text-ocean-500">
                    Memuat layanan...
                  </p>
                )}
                {!loading && allItems.length === 0 && (
                  <p className="ml-1 text-[10px] font-bold text-red-500">
                    Layanan tidak tersedia saat ini.
                  </p>
                )}
              </div>

              {/* Customer Number */}
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold text-brand-500/40 uppercase">
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
                disabled={!selectedItemId || !customerNo}
                icon={<SearchRounded />}
              >
                Cek Tagihan Sekarang
              </Button>
            </form>
          </div>

          <div className="flex gap-4 rounded-3xl border border-ocean-500/10 bg-ocean-500/5 p-6">
            <InfoRounded className="shrink-0 text-ocean-500" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-brand-500/90">
                Informasi Penting
              </p>
              <p className="text-xs leading-relaxed font-bold text-brand-500/60">
                Pastikan ID Pelanggan Anda benar. Biaya admin mungkin berbeda
                untuk setiap layanan. Transaksi pascabayar hanya bisa
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
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-500/5 bg-smoke-200/50 p-10 text-center"
              >
                <ReceiptLongRounded className="mb-4 text-7xl text-brand-500/10" />
                <h3 className="text-lg font-bold text-brand-500/40">
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
                className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-500/90">
                    Rincian Tagihan
                  </h2>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                    <CheckCircleRounded />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-end justify-between border-b border-brand-500/5 pb-4">
                    <div>
                      <p className="text-[10px] font-bold text-brand-500/40 uppercase">
                        Pelanggan
                      </p>
                      <p className="text-lg font-bold text-brand-500/90">
                        {inquiryResult.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-brand-500/40 uppercase">
                        ID Pelanggan
                      </p>
                      <p className="font-bold text-brand-500/90">
                        {inquiryResult.customer_no}
                      </p>
                    </div>
                  </div>

                  {/* Product & Period */}
                  {inquiryResult.period && (
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-500/60">Periode</span>
                      <span className="text-brand-500/90">
                        {inquiryResult.period}
                      </span>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-500/60">Tagihan Pokok</span>
                      <span className="text-brand-500/90">
                        {formatCurrency(inquiryResult.tagihan)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-500/60">Biaya Admin</span>
                      <span className="text-brand-500/90">
                        {formatCurrency(inquiryResult.admin)}
                      </span>
                    </div>
                  </div>

                  {/* Bill Details (multi-period) */}
                  {inquiryResult.details &&
                    inquiryResult.details.length > 1 && (
                      <details className="rounded-xl border border-brand-500/5 bg-cloud-200/50 p-4">
                        <summary className="cursor-pointer text-xs font-bold text-brand-500/50 uppercase">
                          Detail Tagihan ({inquiryResult.details.length}{" "}
                          periode)
                        </summary>
                        <div className="mt-3 space-y-2">
                          {inquiryResult.details.map(
                            (
                              d: import("@/lib/api").PostpaidBillDetail,
                              i: number,
                            ) => (
                              <div
                                key={i}
                                className="flex justify-between border-b border-brand-500/5 pb-2 text-xs font-bold"
                              >
                                <span className="text-brand-500/60">
                                  {d.period}
                                </span>
                                <span className="text-brand-500/90">
                                  {formatCurrency(d.nominal + d.denda)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </details>
                    )}

                  {/* Total */}
                  <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-brand-500/5 pt-6">
                    <span className="text-lg font-bold text-brand-500/90">
                      Total Bayar
                    </span>
                    <span className="text-3xl font-bold text-ocean-500">
                      {formatCurrency(inquiryResult.total)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Select */}
                {paymentChannels.length > 0 && (
                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-bold text-brand-500/40 uppercase">
                      Metode Pembayaran
                    </label>
                    <div className="relative">
                      <select
                        className="w-full cursor-pointer appearance-none rounded-2xl border border-brand-500/5 bg-smoke-200 px-6 py-3 pr-10 font-bold text-brand-500/90 outline-none focus:ring-4 focus:ring-ocean-500/10"
                        value={selectedPaymentMethod}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                      >
                        <option value="">-- Pilih Metode --</option>
                        {paymentChannels
                          .filter((c) => c.active)
                          .map((channel: any) => (
                            <option key={channel.code} value={channel.code}>
                              {channel.name}
                            </option>
                          ))}
                      </select>
                      <KeyboardArrowDownRounded className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-brand-500/30" />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handlePayment}
                    isLoading={payLoading}
                    disabled={!selectedPaymentMethod}
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
