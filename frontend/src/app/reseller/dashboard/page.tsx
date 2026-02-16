"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  ShoppingCartRounded,
  AssessmentRounded,
  ChevronRightRounded,
  AddRounded,
  NorthEastRounded,
  SouthWestRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getBalance,
  getBalanceMutations,
  getTransactions,
  type BalanceData,
  type BalanceMutation,
  type CustomerTransaction,
} from "@/lib/api";

export default function ResellerDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [recentOrders, setRecentOrders] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [balRes, mutRes, txnRes] = await Promise.all([
        getBalance().catch(() => null),
        getBalanceMutations(5).catch(() => null),
        getTransactions({ per_page: 5, type: "purchase" }).catch(() => null),
      ]);

      if (balRes?.success) setBalance(balRes.data);
      if (mutRes?.success) setMutations(Array.isArray(mutRes.data) ? mutRes.data : []);
      if (txnRes?.success) setRecentOrders(txnRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Available Balance",
      value: `Rp ${(balance?.available_balance ?? user?.balance ?? 0).toLocaleString("id-ID")}`,
      icon: <AccountBalanceWalletRounded />,
      color: "ocean" as const,
    },
    {
      title: "Hold Amount",
      value: `Rp ${(balance?.hold_amount ?? 0).toLocaleString("id-ID")}`,
      icon: <AssessmentRounded />,
      color: "brand" as const,
    },
    {
      title: "Today's Sales",
      value: `${recentOrders.filter(o => {
        const today = new Date().toISOString().slice(0, 10);
        return o.created_at?.startsWith(today);
      }).length} orders`,
      icon: <ShoppingCartRounded />,
      color: "ocean" as const,
    },
    {
      title: "Recent Transactions",
      value: `${recentOrders.length}`,
      icon: <TrendingUpRounded />,
      color: "brand" as const,
    },
  ];

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Reseller Panel"
        emoji="💼"
        description={`Hello, ${user?.name}. Monitor your sales performance and balance.`}
        actions={
          <Link
            href="/reseller/topup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-smoke-200 font-bold text-xs rounded-2xl transition-all"
          >
            <AddRounded fontSize="small" />
            <span>Top Up Balance</span>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <StatCard key={idx} index={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">Recent Sales</h2>
            <Link href="/reseller/transactions" className="text-[10px] font-bold text-ocean-500 hover:underline inline-flex items-center gap-1">
              View All <ChevronRightRounded fontSize="small" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-8 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-500/5 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-brand-500/5 rounded-full w-3/4" />
                    <div className="h-2 bg-brand-500/5 rounded-full w-1/2" />
                  </div>
                  <div className="h-6 w-16 bg-brand-500/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 divide-y divide-brand-500/5">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/reseller/transactions/${order.transaction_code}`}
                  className="flex items-center gap-4 p-5 hover:bg-cloud-200/50 dark:hover:bg-brand-700/30 transition-colors first:rounded-t-[28px] last:rounded-b-[28px]"
                >
                  <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center text-ocean-500 shrink-0">
                    <ShoppingCartRounded fontSize="small" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-500/90 dark:text-smoke-200 truncate">{order.product_name}</p>
                    <p className="text-[10px] font-bold text-brand-500/30 mt-0.5">
                      {order.transaction_code} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">{formatCurrency(order.total_price)}</p>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingCartRounded fontSize="large" />}
              title="No sales data yet"
              description="Start selling game products to see your performance here."
            />
          )}
        </div>

        {/* Sidebar: Balance + Mutations */}
        <div className="space-y-6">
          <BalanceCard
            balance={balance?.available_balance ?? user?.balance ?? 0}
            userType={user?.customer_type}
          />

          {/* Recent Mutations */}
          <div className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-6">
            <h3 className="text-xs font-bold text-brand-500/90 dark:text-smoke-200 mb-5">Balance Mutations</h3>

            {mutations.length > 0 ? (
              <div className="space-y-3">
                {mutations.map((mut) => (
                  <div key={mut.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mut.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {mut.type === "credit" ? <SouthWestRounded fontSize="small" /> : <NorthEastRounded fontSize="small" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-500/90 dark:text-smoke-300 truncate">{mut.description}</p>
                      <p className="text-[10px] text-brand-500/30 font-bold">{formatDate(mut.created_at)}</p>
                    </div>
                    <span className={`text-xs font-bold ${mut.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                      {mut.type === "credit" ? "+" : "-"}{formatCurrency(mut.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-brand-500/5 rounded-2xl">
                <p className="text-[10px] text-brand-500/30 font-bold">No recent mutations</p>
              </div>
            )}

            <Link
              href="/reseller/balance/history"
              className="block w-full mt-5 py-3 text-[10px] font-bold text-brand-500/40 dark:text-brand-500/50 border border-brand-500/5 rounded-2xl hover:bg-cloud-200 dark:hover:bg-brand-700/30 transition-colors text-center"
            >
              View Full History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
