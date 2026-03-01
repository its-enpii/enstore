"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import PageHeader from "@/components/dashboard/PageHeader";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DataTable, { type TableColumn } from "@/components/dashboard/DataTable";
import DashboardButton from "@/components/dashboard/DashboardButton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  AccountBalanceWalletRounded,
  AddCardRounded,
  HistoryRounded,
  ArrowForwardRounded,
  TrendingDownRounded,
  TrendingUpRounded,
  PaidRounded,
  HourglassEmptyRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import {
  getBalance,
  getBalanceMutations,
  type BalanceData,
  type BalanceMutation,
} from "@/lib/api/customer";
import { toast } from "react-hot-toast";

export default function WalletPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceRes, mutationsRes] = await Promise.all([
        getBalance(),
        getBalanceMutations(5), // Get last 5 mutations
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.data);
      }
      if (mutationsRes.success) {
        setMutations(mutationsRes.data);
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error);
      toast.error("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Wallet"
        emoji="💳"
        description="Manage your balance, top up, and view transaction history."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Wallet" },
        ]}
        actions={
          <Link href="/dashboard/topup">
            <DashboardButton
              variant="primary"
              icon={<AddCardRounded fontSize="small" />}
            >
              Top Up Balance
            </DashboardButton>
          </Link>
        }
      />

      {loading ? (
        <div className="grid animate-pulse gap-6 md:grid-cols-3">
          <div className="h-40 rounded-xl bg-brand-500/5 md:col-span-2" />
          <div className="h-40 rounded-xl bg-brand-500/5" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-linear-to-br from-ocean-500 to-ocean-700 p-8 text-white shadow-xl shadow-ocean-500/20 md:col-span-2"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AccountBalanceWalletRounded sx={{ fontSize: 180 }} />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="mb-1 font-medium text-ocean-100">Total Balance</p>
                <h2 className="mb-2 text-4xl font-bold tracking-tight text-white">
                  {formatCurrency(balance?.balance || 0)}
                </h2>
                <div className="mt-4 flex gap-4">
                  <span className="flex items-center gap-1.5 rounded-full bg-smoke-200/10 px-3 py-1.5 text-xs backdrop-blur-sm">
                    <PaidRounded
                      style={{ fontSize: 14 }}
                      className="text-emerald-300"
                    />
                    Available:{" "}
                    <span className="font-bold">
                      {formatCurrency(balance?.available_balance || 0)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-smoke-200/10 px-3 py-1.5 text-xs backdrop-blur-sm">
                    <HourglassEmptyRounded
                      style={{ fontSize: 14 }}
                      className="text-amber-300"
                    />
                    Bonus:{" "}
                    <span className="font-bold">
                      {formatCurrency(balance?.bonus_balance || 0)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Link href="/dashboard/topup" className="flex-1">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-smoke-200 px-4 py-3 font-bold text-ocean-600 transition-colors hover:bg-ocean-50">
                    <AddCardRounded fontSize="small" /> Top Up
                  </button>
                </Link>
                <Link href="/dashboard/withdrawal" className="flex-1">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-ocean-600/50 px-4 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-ocean-600/70">
                    <ArrowForwardRounded fontSize="small" /> Withdraw
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions / Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-between rounded-2xl border border-brand-500/5 bg-smoke-200 p-7 shadow-sm dark:bg-brand-800"
          >
            <div>
              <h3 className="mb-4 text-lg font-bold text-brand-500/90 dark:text-smoke-200">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-brand-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingUpRounded fontSize="small" />
                    </div>
                    <span className="text-sm font-medium text-brand-500/70">
                      Income This Month
                    </span>
                  </div>
                  <span className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">
                    Rp 0
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-brand-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                      <TrendingDownRounded fontSize="small" />
                    </div>
                    <span className="text-sm font-medium text-brand-500/70">
                      Expense This Month
                    </span>
                  </div>
                  <span className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">
                    Rp 0
                  </span>
                </div>
              </div>
            </div>

            <Link href="/dashboard/balance/history" className="mt-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/10 py-3 text-sm font-bold text-brand-500/60 transition-colors hover:bg-brand-500/5 hover:text-ocean-500">
                <HistoryRounded fontSize="small" /> View Full History
              </button>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm dark:bg-brand-800"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-brand-500/90 dark:text-smoke-200">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/balance/history"
            className="text-sm font-bold text-ocean-500 hover:text-ocean-600"
          >
            See All
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-brand-500/5" />
            ))}
          </div>
        ) : mutations.length === 0 ? (
          <div className="py-10 text-center text-brand-500/40">
            <HistoryRounded
              sx={{ fontSize: 48, opacity: 0.5, marginBottom: 1 }}
            />
            <p>No recent transactions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mutations.map((mutation) => (
              <div
                key={mutation.id}
                className="group flex items-center justify-between rounded-2xl border border-brand-500/5 bg-smoke-200 p-4 transition-all hover:border-ocean-500/30 dark:bg-brand-900/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mutation.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {mutation.type === "credit" ? (
                      <TrendingUpRounded />
                    ) : (
                      <TrendingDownRounded />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-brand-500/90 transition-colors group-hover:text-ocean-500 dark:text-smoke-200">
                      {mutation.description}
                    </p>
                    <p className="text-xs font-medium text-brand-500/40">
                      {formatDate(mutation.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${mutation.type === "credit" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {mutation.type === "credit" ? "+" : "-"}
                    {formatCurrency(mutation.amount)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-brand-500/30">
                    Balance: {formatCurrency(mutation.balance_after)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
