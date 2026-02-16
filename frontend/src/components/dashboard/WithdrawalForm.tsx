"use client";

import React, { useState, useEffect } from "react";
import {
  AccountBalanceRounded,
  PersonRounded,
  NumbersRounded,
  MonetizationOnRounded,
  HistoryRounded,
  CheckCircleRounded,
  PendingRounded,
  CancelRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

import DashboardInput from "./DashboardInput";
import DashboardSelect from "./DashboardSelect";
import DashboardButton from "./DashboardButton";
import StatusBadge from "./StatusBadge";
import { api, ENDPOINTS } from "@/lib/api";

const PAYMENT_METHODS = [
  { value: "BCA", label: "Bank BCA" },
  { value: "BRI", label: "Bank BRI" },
  { value: "BNI", label: "Bank BNI" },
  { value: "MANDIRI", label: "Bank Mandiri" },
  { value: "GOPAY", label: "GoPay" },
  { value: "OVO", label: "OVO" },
  { value: "DANA", label: "DANA" },
];

export function WithdrawalForm() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [balance, setBalance] = useState(0);

  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "",
    account_number: "",
    account_name: "",
  });

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, balanceRes] = await Promise.all([
        api.get(
          ENDPOINTS.customer.withdrawals + `?page=${page}`,
          undefined,
          true,
        ),
        api.get(ENDPOINTS.customer.balance, undefined, true),
      ]);

      if (historyRes.success) {
        setHistory((historyRes.data as any).data);
        setTotalPages((historyRes.data as any).last_page);
      }

      if (balanceRes.success) {
        const balData = balanceRes.data as any;
        setBalance(balData.balance - balData.hold_balance);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) < 10000) {
      toast.error("Minimal penarikan Rp 10.000");
      return;
    }

    if (parseFloat(formData.amount) > balance) {
      toast.error("Saldo tidak mencukupi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(
        ENDPOINTS.customer.createWithdrawal,
        formData,
        true,
      );
      if (res.success) {
        toast.success("Permintaan penarikan berhasil diajukan");
        setFormData({
          amount: "",
          payment_method: "",
          account_number: "",
          account_name: "",
        });
        fetchData();
      } else {
        toast.error(res.message || "Gagal mengajukan penarikan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "completed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Form Section */}
      <div className="lg:col-span-5">
        <div className="h-full rounded-[32px] border border-brand-500/5 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-500/10 text-ocean-500 shadow-sm">
              <MonetizationOnRounded />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-500">Tarik Saldo</h3>
              <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                Tersedia: Rp {balance.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <DashboardInput
              label="Nominal Penarikan"
              type="number"
              placeholder="Min. 10.000"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              icon={<MonetizationOnRounded />}
              required
            />

            <DashboardSelect
              label="Metode Penarikan"
              options={PAYMENT_METHODS}
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value })
              }
              icon={<AccountBalanceRounded />}
              placeholder="Pilih Bank / E-Wallet"
              required
            />

            <DashboardInput
              label="Nomor Rekening / E-Wallet"
              placeholder="Masukkan nomor akun"
              value={formData.account_number}
              onChange={(e) =>
                setFormData({ ...formData, account_number: e.target.value })
              }
              icon={<NumbersRounded />}
              required
            />

            <DashboardInput
              label="Nama Pemilik Akun"
              placeholder="Sesuai buku tabungan / e-wallet"
              value={formData.account_name}
              onChange={(e) =>
                setFormData({ ...formData, account_name: e.target.value })
              }
              icon={<PersonRounded />}
              required
            />

            <DashboardButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting}
              className="rounded-2xl py-4 shadow-lg shadow-ocean-500/20"
            >
              {submitting ? "Memproses..." : "Ajukan Penarikan"}
            </DashboardButton>
          </form>
        </div>
      </div>

      {/* History Section */}
      <div className="lg:col-span-7">
        <div className="h-full rounded-[32px] border border-brand-500/5 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/5 text-brand-500/40 shadow-sm">
                <HistoryRounded />
              </div>
              <h3 className="text-lg font-black text-brand-500">
                Riwayat Penarikan
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-smoke-200"
                />
              ))
            ) : history.length > 0 ? (
              history.map((item) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.id}
                  className="group flex items-center justify-between rounded-2xl border border-brand-500/5 p-4 transition-all duration-300 hover:border-ocean-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-smoke-200 text-brand-500/30 transition-colors group-hover:bg-ocean-500/10 group-hover:text-ocean-500">
                      <AccountBalanceRounded fontSize="small" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-brand-500">
                          {item.payment_method}
                        </p>
                        <span className="text-[10px] font-bold tracking-tighter text-brand-500/20 uppercase">
                          {item.reference_id}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-brand-500/40">
                        Rp {parseFloat(item.amount).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge
                      status={
                        item.status === "completed"
                          ? "success"
                          : item.status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                      size="sm"
                      label={item.status.toUpperCase()}
                    />
                    <span className="text-[10px] font-bold text-brand-500/30">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-smoke-200 text-brand-500/20">
                  <PendingRounded sx={{ fontSize: 32 }} />
                </div>
                <p className="text-sm font-bold tracking-widest text-brand-500/40 uppercase">
                  Belum ada penarikan
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 border-t border-brand-500/5 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-brand-500/5 p-2 transition-all hover:bg-smoke-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowForwardRounded
                  className="rotate-180 text-brand-500/50"
                  sx={{ fontSize: 18 }}
                />
              </button>
              <span className="text-xs font-bold text-brand-500/40 uppercase">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-brand-500/5 p-2 transition-all hover:bg-smoke-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowForwardRounded
                  className="text-brand-500/50"
                  sx={{ fontSize: 18 }}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
