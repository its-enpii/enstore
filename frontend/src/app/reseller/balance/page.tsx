"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StatCard from "@/components/dashboard/StatCard";
import {
  AccountBalanceWalletRounded,
  SavingsRounded,
  TrendingUpRounded,
  TrendingDownRounded,
  NorthEastRounded,
  SouthWestRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getBalance,
  getBalanceMutations,
  type BalanceData,
  type BalanceMutation,
} from "@/lib/api";

export default function ResellerBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balRes, mutRes] = await Promise.all([
        getBalance().catch(() => null),
        getBalanceMutations(10).catch(() => null),
      ]);
      if (balRes?.success) setBalance(balRes.data);
      if (mutRes?.success) setMutations(Array.isArray(mutRes.data) ? mutRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (s: string) => new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const totalCredit = mutations.filter(m => m.type === "credit").reduce((s, m) => s + m.amount, 0);
  const totalDebit = mutations.filter(m => m.type === "debit").reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-8">
        <PageHeader
          title="Balance Overview"
          emoji="💰"
          description="Manage your wallet balance and view financial activity."
          breadcrumbs={[
            { label: "Dashboard", href: "/reseller/dashboard" },
            { label: "Balance" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <BalanceCard
            balance={balance?.available_balance ?? user?.balance ?? 0}
            userType={user?.customer_type}
          />

          {/* Summary Stats */}
          <StatCard
            title="Total Income"
            value={formatCurrency(totalCredit)}
            icon={<TrendingUpRounded />}
            color="ocean"
            index={1}
            subtitle="Recent deposits"
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(totalDebit)}
            icon={<TrendingDownRounded />}
            color="brand"
            index={2}
            subtitle="Recent purchases"
          />
        </div>

        {/* Recent Mutations */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest">Recent Mutations</h2>
            <Link href="/reseller/balance/history" className="text-[10px] font-bold text-ocean-500 hover:underline inline-flex items-center gap-1 uppercase tracking-widest">
              View All <ChevronRightRounded fontSize="small" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-brand-500/5 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-brand-500/5 rounded-full w-2/3" />
                    <div className="h-2 bg-brand-500/5 rounded-full w-1/3" />
                  </div>
                  <div className="h-4 w-20 bg-brand-500/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : mutations.length > 0 ? (
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 divide-y divide-brand-500/5">
              {mutations.map((mut) => (
                <div key={mut.id} className="flex items-center gap-4 p-5 hover:bg-cloud-200/50 dark:hover:bg-brand-700/30 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mut.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {mut.type === "credit" ? <SouthWestRounded /> : <NorthEastRounded />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-500 dark:text-smoke-200 truncate">{mut.description}</p>
                    <p className="text-[10px] text-brand-500/30 font-bold uppercase tracking-wider mt-0.5">
                      {formatDate(mut.created_at)} • {formatTime(mut.created_at)}
                      {mut.transaction && <> • <span className="text-ocean-500">{mut.transaction.transaction_code}</span></>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${mut.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                      {mut.type === "credit" ? "+" : "-"}{formatCurrency(mut.amount)}
                    </p>
                    <p className="text-[10px] text-brand-500/20 font-bold mt-0.5">
                      → {formatCurrency(mut.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-dashed border-brand-500/10 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-500/5 rounded-2xl flex items-center justify-center text-brand-500/15">
                <SavingsRounded fontSize="large" />
              </div>
              <p className="text-xs font-black text-brand-500/30 uppercase tracking-widest">No mutations yet</p>
              <p className="text-xs text-brand-500/20 mt-1">Top up your balance to get started.</p>
            </div>
          )}
      </div>
    </div>
  );
}
