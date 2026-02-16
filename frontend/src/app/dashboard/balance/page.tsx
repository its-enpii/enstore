"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import PageHeader from "@/components/dashboard/PageHeader";
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
import { getBalance, getBalanceMutations, type BalanceData, type BalanceMutation } from "@/lib/api/customer";
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
              <DashboardButton variant="primary" icon={<AddCardRounded fontSize="small" />}>
                Top Up Balance
              </DashboardButton>
            </Link>
          }
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3 animate-pulse">
            <div className="h-40 bg-brand-500/5 rounded-xl md:col-span-2" />
            <div className="h-40 bg-brand-500/5 rounded-xl" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 relative overflow-hidden bg-linear-to-br from-ocean-500 to-ocean-700 rounded-xl p-8 text-white shadow-xl shadow-ocean-500/20"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <AccountBalanceWalletRounded sx={{ fontSize: 180 }} />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-ocean-100 font-medium mb-1">Total Balance</p>
                  <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                    {formatCurrency(balance?.balance || 0)}
                  </h2>
                  <div className="flex gap-4 mt-4">
                     <span className="flex items-center gap-1.5 text-xs bg-smoke-200/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <PaidRounded style={{ fontSize: 14 }} className="text-emerald-300" />
                        Available: <span className="font-bold">{formatCurrency(balance?.available_balance || 0)}</span>
                     </span>
                     <span className="flex items-center gap-1.5 text-xs bg-smoke-200/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <HourglassEmptyRounded style={{ fontSize: 14 }} className="text-amber-300" />
                        Hold: <span className="font-bold">{formatCurrency(balance?.hold_amount || 0)}</span>
                     </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Link href="/dashboard/topup" className="flex-1">
                    <button className="w-full bg-smoke-200 text-ocean-600 font-bold py-3 px-4 rounded-xl hover:bg-ocean-50 transition-colors flex items-center justify-center gap-2">
                      <AddCardRounded fontSize="small" /> Top Up
                    </button>
                  </Link>
                  <Link href="/dashboard/withdrawal" className="flex-1">
                    <button className="w-full bg-ocean-600/50 backdrop-blur-sm text-white font-bold py-3 px-4 rounded-xl hover:bg-ocean-600/70 transition-colors flex items-center justify-center gap-2 border border-white/10">
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
              className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-6 flex flex-col justify-between"
            >
               <div>
                  <h3 className="font-bold text-lg text-brand-500/90 dark:text-smoke-200 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-brand-500/5 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <TrendingUpRounded fontSize="small" />
                           </div>
                           <span className="text-sm font-medium text-brand-500/70">Income This Month</span>
                        </div>
                        <span className="font-bold text-brand-500/90 dark:text-smoke-200 text-sm">Rp 0</span>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-brand-500/5 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                              <TrendingDownRounded fontSize="small" />
                           </div>
                           <span className="text-sm font-medium text-brand-500/70">Expense This Month</span>
                        </div>
                        <span className="font-bold text-brand-500/90 dark:text-smoke-200 text-sm">Rp 0</span>
                     </div>
                  </div>
               </div>
               
               <Link href="/dashboard/balance/history" className="mt-4">
                  <button className="w-full py-3 text-sm font-bold text-brand-500/60 hover:text-ocean-500 transition-colors flex items-center justify-center gap-2 border border-brand-500/10 rounded-xl hover:bg-brand-500/5">
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
           className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-8"
        >
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-brand-500/90 dark:text-smoke-200">Recent Activity</h3>
              <Link href="/dashboard/balance/history" className="text-sm font-bold text-ocean-500 hover:text-ocean-600">
                 See All
              </Link>
           </div>
           
           {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-brand-500/5 rounded-xl" />)}
              </div>
           ) : mutations.length === 0 ? (
              <div className="text-center py-10 text-brand-500/40">
                <HistoryRounded sx={{ fontSize: 48, opacity: 0.5, marginBottom: 1 }} />
                <p>No recent transactions found.</p>
              </div>
           ) : (
              <div className="space-y-4">
                {mutations.map((mutation) => (
                  <div key={mutation.id} className="flex items-center justify-between p-4 bg-smoke-200 dark:bg-brand-900/50 rounded-2xl border border-brand-500/5 hover:border-ocean-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mutation.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {mutation.type === 'credit' ? <TrendingUpRounded /> : <TrendingDownRounded />}
                       </div>
                       <div>
                          <p className="font-bold text-brand-500/90 dark:text-smoke-200 group-hover:text-ocean-500 transition-colors">{mutation.description}</p>
                          <p className="text-xs text-brand-500/40 font-medium">{formatDate(mutation.created_at)}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-bold ${mutation.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {mutation.type === 'credit' ? '+' : '-'}{formatCurrency(mutation.amount)}
                       </p>
                       <p className="text-[10px] text-brand-500/30 font-bold mt-0.5">Balance: {formatCurrency(mutation.balance_after)}</p>
                    </div>
                  </div>
                ))}
              </div>
           )}
        </motion.div>
      </div>
  );
}
