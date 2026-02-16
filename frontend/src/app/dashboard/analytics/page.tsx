"use client";

import React, { useState, useEffect } from "react";
import {
  AttachMoney,
  ShoppingCart,
  CheckCircle,
  BarChart,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import StatsCard from "@/components/dashboard/analytics/StatsCard";
import TopProductsList from "@/components/dashboard/analytics/TopProductsList";
import toast from "react-hot-toast";
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

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, topProductsRes] = await Promise.all([
        api.get<any>(ENDPOINTS.customer.analytics.dashboard, undefined, true),
        api.get<any>(ENDPOINTS.customer.analytics.topProducts, undefined, true),
      ]);

      if (dashboardRes.success) {
        setDashboardData(dashboardRes.data);
      } else {
        toast.error(dashboardRes.message || "Failed to load dashboard data");
      }

      if (topProductsRes.success) {
        setTopProducts(topProductsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    total_spending: 0,
    transaction_count: 0,
    success_rate: 0,
  };

  const chartData = dashboardData?.chart_data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-brand-500">Analytics</h1>
        <div className="text-sm font-medium text-brand-500/50">
          Overview for this month
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gray-100"
            ></div>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Spending"
              value={`Rp ${summary.total_spending.toLocaleString("id-ID")}`}
              icon={AttachMoney}
              color="text-ocean-500 bg-ocean-500/10"
            />
            <StatsCard
              title="Total Transactions"
              value={summary.transaction_count}
              icon={ShoppingCart}
              color="text-orange-500 bg-orange-500/10"
            />
            <StatsCard
              title="Success Rate"
              value={`${summary.success_rate}%`}
              icon={CheckCircle}
              color="text-green-500 bg-green-500/10"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="rounded-2xl border border-brand-500/10 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-brand-500">
              <BarChart className="text-ocean-500" />
              Spending Trend
            </h3>
          </div>
          {loading ? (
            <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-gray-50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
            </div>
          ) : (
            <RevenueChart data={chartData} height={300} />
          )}
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1">
          <TopProductsList products={topProducts} loading={loading} />
        </div>
      </div>
    </div>
  );
}
