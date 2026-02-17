"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  AssessmentRounded,
  DateRangeRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("month"); // day, week, month

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hardcoded dates for demo, ideally use date picker
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const end = now.toISOString().split("T")[0];

      const res = await api.get(
        ENDPOINTS.admin.reports.sales,
        {
          start_date: start,
          end_date: end,
          group_by: period,
        },
        true,
      );
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load report");
      }
    } catch (err: any) {
      console.error("Failed to fetch report:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-500/90">
            <AssessmentRounded className="text-ocean-500" /> Sales Report
          </h1>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2 text-sm font-bold text-brand-500/90 outline-none"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2 text-sm font-bold text-white">
              <FileDownloadRounded fontSize="small" /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="mb-4 font-bold text-red-500">{error}</p>
            <button
              onClick={fetchReport}
              className="rounded-xl bg-red-500 px-6 py-2 font-bold text-white transition-colors hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-4">
                <p className="text-xs font-bold text-brand-500/40 uppercase">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-ocean-500">
                  Rp{" "}
                  {Number(data?.summary?.total_revenue || 0).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-4">
                <p className="text-xs font-bold text-brand-500/40 uppercase">
                  Total Profit
                </p>
                <p className="text-xl font-bold text-emerald-500">
                  Rp{" "}
                  {Number(data?.summary?.total_profit || 0).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-4">
                <p className="text-xs font-bold text-brand-500/40 uppercase">
                  Transactions
                </p>
                <p className="text-xl font-bold text-brand-500/90">
                  {data?.summary?.total_transactions || 0}
                </p>
              </div>
              <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-4">
                <p className="text-xs font-bold text-brand-500/40 uppercase">
                  Avg. Transaction
                </p>
                <p className="text-xl font-bold text-brand-500/90">
                  Rp{" "}
                  {Number(
                    data?.summary?.average_transaction || 0,
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8 rounded-xl border border-brand-500/5 bg-white p-6 dark:bg-brand-900/50">
              <h3 className="mb-6 text-lg font-bold text-brand-500/90">
                Revenue & Profit Trend
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data?.details || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="period"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_revenue"
                      name="Revenue"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="total_profit"
                      name="Profit"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-500/5 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-brand-500/40 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-brand-500/40 uppercase">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-brand-500/40 uppercase">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-brand-500/40 uppercase">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-500/5">
                {data?.details?.length > 0 ? (
                  data.details.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-smoke-200/50">
                      <td className="px-4 py-3 text-sm font-bold text-brand-500/90">
                        {item.period}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-brand-500/90">
                        {item.total_transactions}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-ocean-500">
                        Rp{" "}
                        {Number(item.total_revenue || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-500">
                        Rp{" "}
                        {Number(item.total_profit || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm font-bold text-brand-500/40"
                    >
                      No sales data found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
