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
      if (mutRes?.success)
        setMutations(Array.isArray(mutRes.data) ? mutRes.data : []);
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
      value: `${
        recentOrders.filter((o) => {
          const today = new Date().toISOString().slice(0, 10);
          return o.created_at?.startsWith(today);
        }).length
      } orders`,
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

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString("id-ID")}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
            className="inline-flex items-center gap-2 rounded-2xl bg-ocean-500 px-6 py-3 text-xs font-bold text-smoke-200 transition-all hover:bg-ocean-600"
          >
            <AddRounded fontSize="small" />
            <span>Top Up Balance</span>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} index={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
        {/* Main Content: Recent Orders */}
        <div className="flex flex-col space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-brand-500/90">
              Recent Sales
            </h2>
            <Link
              href="/reseller/transactions"
              className="inline-flex items-center gap-1 text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-brand-500/5" />
                    <div className="h-2 w-1/2 rounded-full bg-brand-500/5" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-brand-500/5" />
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="flex-1 divide-y divide-brand-500/5 rounded-2xl border border-brand-500/5 bg-smoke-200 shadow-sm">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/reseller/transactions/${order.transaction_code}`}
                  className="group flex items-center gap-4 p-5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-500 transition-colors group-hover:bg-ocean-500 group-hover:text-smoke-200">
                    <ShoppingCartRounded fontSize="small" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand-500/90 transition-colors group-hover:text-ocean-500">
                      {order.product_name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-brand-500/30">
                      {order.transaction_code} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-brand-500/90">
                      {formatCurrency(order.total_price)}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={order.status} size="sm" />
                    </div>
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
        <div className="flex flex-col space-y-6">
          <BalanceCard
            balance={balance?.available_balance ?? user?.balance ?? 0}
            userType={user?.customer_type}
          />

          {/* Recent Mutations */}
          <div className="flex-1 rounded-2xl border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
            <h3 className="mb-5 px-1 text-xs leading-none font-bold tracking-widest text-brand-500/30 uppercase">
              Balance Mutations
            </h3>

            {mutations.length > 0 ? (
              <div className="space-y-3">
                {mutations.map((mut) => (
                  <div key={mut.id} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${mut.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                    >
                      {mut.type === "credit" ? (
                        <SouthWestRounded fontSize="small" />
                      ) : (
                        <NorthEastRounded fontSize="small" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-brand-500/90">
                        {mut.description}
                      </p>
                      <p className="text-[10px] font-bold text-brand-500/30">
                        {formatDate(mut.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold ${mut.type === "credit" ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {mut.type === "credit" ? "+" : "-"}
                      {formatCurrency(mut.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-brand-500/5 py-8 text-center">
                <p className="text-[10px] font-bold text-brand-500/30">
                  No recent mutations
                </p>
              </div>
            )}

            <Link
              href="/reseller/balance/history"
              className="mt-5 block w-full rounded-2xl border border-brand-500/5 py-3 text-center text-[10px] font-bold text-brand-500/40 transition-colors hover:bg-cloud-200"
            >
              View Full History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
