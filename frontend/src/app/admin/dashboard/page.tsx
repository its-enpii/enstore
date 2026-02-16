"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  TrendingUpRounded,
  ShoppingCartRounded,
  PeopleRounded,
  AccountBalanceWalletRounded,
  AssessmentRounded,
  WarningRounded,
  NotificationsActiveRounded,
  ChevronRightRounded,
  NorthEastRounded,
  HistoryRounded,
  PendingActionsRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { api, ENDPOINTS } from "@/lib/api";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/dashboard/RevenueChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
      </div>
    ),
  },
);

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all in parallel for speed
        const [statsRes, transRes, logsRes] = await Promise.all([
          api.get(ENDPOINTS.admin.dashboard, undefined, true),
          api.get(ENDPOINTS.admin.transactions.list, { per_page: 5 }, true),
          api.get(ENDPOINTS.admin.activityLogs.list, { per_page: 5 }, true),
        ]);

        if (statsRes.success) setData(statsRes.data);
        if (transRes.success)
          setRecentTransactions((transRes.data as any).data);
        if (logsRes.success) setRecentActivities((logsRes.data as any).data);
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Revenue (MTD)",
      value: data
        ? `Rp ${data.overview.total_revenue.toLocaleString("id-ID")}`
        : "Rp 0",
      icon: <TrendingUpRounded />,
      color: "bg-ocean-500",
      text: "text-ocean-500",
      bg_light: "bg-ocean-500/10",
      growth: data?.overview.revenue_growth || 0,
      progress: 75,
    },
    {
      title: "Total Transactions",
      value: data
        ? data.overview.total_transactions.toLocaleString("id-ID")
        : "0",
      icon: <ShoppingCartRounded />,
      color: "bg-brand-500",
      text: "text-brand-500",
      bg_light: "bg-brand-500/10",
      growth: data?.overview.transaction_growth || 0,
      progress: 62,
    },
    {
      title: "Active Users",
      value: data ? data.users.active_users.toLocaleString("id-ID") : "0",
      icon: <PeopleRounded />,
      color: "bg-ocean-500",
      text: "text-ocean-500",
      bg_light: "bg-ocean-500/10",
      growth: 12,
      progress: 88,
    },
    {
      title: "Estimated Profit (MTD)",
      value: data
        ? `Rp ${data.revenue.total_profit.toLocaleString("id-ID")}`
        : "Rp 0",
      icon: <AccountBalanceWalletRounded />,
      color: "bg-brand-500",
      text: "text-brand-500",
      bg_light: "bg-brand-500/10",
      growth: 8,
      progress: 92,
    },
  ];

  const alerts = [
    {
      title: `${data?.transactions.pending || 0} Pending Transactions`,
      type: "warning",
      icon: <PendingActionsRounded fontSize="small" />,
      color: "text-brand-500",
      bg: "bg-brand-500/5",
      border: "border-brand-500/10",
    },
    {
      title: "Digiflazz Balance Connected",
      type: "success",
      icon: <CheckCircleRounded fontSize="small" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "System Ready",
      type: "info",
      icon: <NotificationsActiveRounded fontSize="small" />,
      color: "text-ocean-500",
      bg: "bg-ocean-500/10",
      border: "border-ocean-500/20",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10 text-emerald-500";
      case "pending":
        return "bg-brand-500/10 text-brand-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-cloud-200 text-brand-500/40";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-brand-500">
              Admin Overview 🛡️
            </h1>
            <p className="mt-1 font-bold text-brand-500/50">
              Control center for Enstore platform management.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-brand-500/60">
                Digiflazz: Online
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-brand-500/60">
                Tripay: Active
              </span>
            </div>
          </div>
        </div>

        {/* Alerts / Tasks */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`${alert.bg} ${alert.color} ${alert.border} flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm`}
            >
              <div className="flex items-center gap-2">
                {alert.icon}
                <span className="text-xs font-bold tracking-wide uppercase">
                  {alert.title}
                </span>
              </div>
              <ChevronRightRounded
                fontSize="small"
                className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
              />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-[32px] border border-brand-500/5 bg-smoke-200 p-6 shadow-sm transition-all duration-300 hover:border-ocean-500/20 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`h-12 w-12 ${stat.color} flex items-center justify-center rounded-2xl text-smoke-200 shadow-lg shadow-ocean-500/10 transition-transform duration-300 group-hover:scale-110`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] font-black ${stat.growth >= 0 ? "text-emerald-500" : "text-red-500"} uppercase`}
                >
                  <NorthEastRounded
                    fontSize="inherit"
                    className={stat.growth < 0 ? "rotate-90" : ""}
                  />
                  <span>{Math.abs(stat.growth)}%</span>
                </div>
              </div>
              <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                {stat.title}
              </p>
              <h3 className="mt-1 text-2xl font-black text-brand-500">
                {stat.value}
              </h3>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-brand-500/30 uppercase">
                  <span>Target Reach</span>
                  <span>{stat.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-cloud-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                    className={`h-full ${stat.color} shadow-[0_0_8px_rgba(14,165,233,0.3)]`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Section - New Chart Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-brand-500">
                Revenue & Sales Performance
              </h2>
              <Link
                href="/admin/reports/sales"
                className="text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
              >
                Detailed Report
              </Link>
            </div>
            <div className="rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-brand-500/40 uppercase">
                    Avg. Daily Revenue
                  </p>
                  <p className="text-xl font-black text-brand-500">
                    Rp{" "}
                    {data
                      ? Math.round(
                          data.revenue.total_revenue / 30,
                        ).toLocaleString("id-ID")
                      : "0"}
                  </p>
                </div>
                <div className="h-8 w-px bg-brand-500/10"></div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-brand-500/40 uppercase">
                    Success Rate
                  </p>
                  <p className="text-xl font-black text-emerald-500">
                    {data?.overview.success_rate || 0}%
                  </p>
                </div>
              </div>
              <div className="h-[240px]">
                <RevenueChart
                  data={data?.charts.daily_revenue || []}
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-brand-500">
              Sales Distribution
            </h2>
            <div className="h-full rounded-[40px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
              <div className="space-y-6">
                {data?.charts.status_distribution &&
                  Object.entries(data.charts.status_distribution).map(
                    ([status, count]: [string, any], idx) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              status === "success"
                                ? "bg-emerald-500"
                                : status === "pending"
                                  ? "bg-brand-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm font-bold text-brand-500/60 capitalize">
                            {status}
                          </span>
                        </div>
                        <span className="text-sm font-black text-brand-500">
                          {count}
                        </span>
                      </div>
                    ),
                  )}

                <div className="border-t border-brand-500/5 pt-6">
                  <p className="mb-4 text-[10px] font-bold tracking-widest text-brand-500/40 uppercase">
                    Top Transaction Types
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold text-ocean-500">
                        Purchase
                      </span>
                      <span className="text-xs font-black text-brand-500">
                        Rp{" "}
                        {data?.revenue.by_type.purchase.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cloud-200">
                      <div
                        className="h-full rounded-full bg-ocean-500"
                        style={{
                          width: `${(data?.revenue.by_type.purchase / data?.revenue.total_revenue) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold text-brand-500/60">
                        Top Up
                      </span>
                      <span className="text-xs font-black text-brand-500">
                        Rp {data?.revenue.by_type.topup.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cloud-200">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${(data?.revenue.by_type.topup / data?.revenue.total_revenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Section 1: Recent Transactions Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-brand-500">
                Live Transactions
              </h2>
              <Link
                href="/admin/transactions"
                className="text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="overflow-hidden rounded-[32px] border border-brand-500/5 bg-smoke-200">
              <div className="divide-y divide-brand-500/5">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tr, idx) => (
                    <div
                      key={tr.id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-cloud-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-brand-500 shadow-sm">
                          {tr.transaction_code.slice(-3).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-brand-500">
                            {tr.product_name}
                          </p>
                          <p className="text-[10px] font-bold text-brand-500/40">
                            {tr.user?.name || "Guest User"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-brand-500">
                          Rp {tr.total_price.toLocaleString("id-ID")}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${getStatusColor(tr.status)}`}
                        >
                          {tr.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <HistoryRounded className="mx-auto mb-4 text-6xl text-brand-500/10" />
                    <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      No transactions recorded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Best Products & Profit */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-brand-500">
                Product Performance
              </h2>
              <Link
                href="/admin/products"
                className="text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
              >
                Management
              </Link>
            </div>
            <div className="rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8">
              <div className="space-y-6">
                {data?.products.top_selling.length > 0 ? (
                  data.products.top_selling.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs font-bold text-brand-500">
                          {item.name}
                        </p>
                        <p className="text-xs font-bold text-brand-500/40">
                          {item.total_sold} Sales
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-cloud-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((item.total_sold / 100) * 100, 100)}%`,
                          }}
                          transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                          className="h-full bg-ocean-500"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm font-bold tracking-widest text-brand-500/40 uppercase">
                    No sales data recorded yet.
                  </p>
                )}
              </div>

              <div className="mt-10 rounded-2xl border border-ocean-500/10 bg-ocean-500/5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-500 text-smoke-200 shadow-lg shadow-ocean-500/20">
                    <AssessmentRounded />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-ocean-500 uppercase">
                      Estimated Profit (MTD)
                    </p>
                    <p className="text-2xl font-black text-brand-500">
                      Rp{" "}
                      {data?.revenue.total_profit.toLocaleString("id-ID") ||
                        "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-brand-500">
                System Activity Logs
              </h2>
              <Link
                href="/admin/activity-logs"
                className="text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
              >
                Full Logs
              </Link>
            </div>
            <div className="overflow-hidden rounded-[32px] border border-brand-500/5 bg-smoke-200">
              <div className="divide-y divide-brand-500/5">
                {recentActivities.length > 0 ? (
                  recentActivities.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-cloud-200"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ocean-500 shadow-sm">
                        <NotificationsActiveRounded fontSize="small" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-brand-500">
                          {log.description}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-500/40 capitalize">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-brand-500/20">
                            •
                          </span>
                          <span className="text-[10px] font-bold text-brand-500/40">
                            {new Date(log.created_at).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-brand-500/30 uppercase italic">
                        {log.user?.name || "System"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs font-bold text-brand-500/30 uppercase">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
