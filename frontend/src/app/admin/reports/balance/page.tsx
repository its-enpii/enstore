"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUpRounded,
  TrendingDownRounded,
  AccountBalanceWalletRounded,
  HistoryRounded,
  CalendarMonthRounded,
  FilterListRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";

interface BalanceSummary {
  total_credit: number;
  total_debit: number;
  credit_count: number;
  debit_count: number;
  net_balance: number;
}

interface BalanceMutationGroup {
  type: string;
  total_count: number;
  total_amount: number;
}

interface BalanceReportData {
  summary: BalanceSummary;
  details: BalanceMutationGroup[];
}

export default function BalanceReportPage() {
  const [data, setData] = useState<BalanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BalanceReportData>(
        ENDPOINTS.admin.reports.balance,
        {
          start_date: startDate,
          end_date: endDate,
        },
        true,
      );

      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Gagal memuat laporan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Balance Reports 💰
            </h1>
            <p className="mt-1 font-bold text-brand-500/50">
              Monitor capital flow and balance mutations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-brand-500/5 bg-cloud-200 p-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-none bg-transparent p-2 text-xs font-bold text-brand-500/90 outline-none"
              />
              <span className="px-1 text-xs font-bold text-brand-500/20">
                -
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-none bg-transparent p-2 text-xs font-bold text-brand-500/90 outline-none"
              />
            </div>
            <button
              onClick={fetchReport}
              className="rounded-xl bg-ocean-500 p-3 text-white shadow-lg shadow-ocean-500/20 transition-all hover:bg-ocean-600 active:scale-95"
            >
              <FilterListRounded fontSize="small" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="font-bold text-red-500">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-4 text-sm font-bold text-ocean-500 uppercase"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Total Credit */}
              <div className="group relative overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 p-6">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-colors group-hover:bg-emerald-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUpRounded />
                  </div>
                  <div>
                    <p className="text-[10px] leading-none font-bold tracking-widest text-brand-500/40 uppercase">
                      Total Credit (In)
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-brand-500/90">
                      Rp {data?.summary.total_credit.toLocaleString("id-ID")}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-tighter text-emerald-500 uppercase">
                      {data?.summary.credit_count} mutations
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Debit */}
              <div className="group relative overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 p-6">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-red-500/5 blur-2xl transition-colors group-hover:bg-red-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                    <TrendingDownRounded />
                  </div>
                  <div>
                    <p className="text-[10px] leading-none font-bold tracking-widest text-brand-500/40 uppercase">
                      Total Debit (Out)
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-brand-500/90">
                      Rp {data?.summary.total_debit.toLocaleString("id-ID")}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-tighter text-red-500 uppercase">
                      {data?.summary.debit_count} mutations
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Balance Change */}
              <div className="group relative overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 p-6">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-ocean-500/5 blur-2xl transition-colors group-hover:bg-ocean-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-500/10 text-ocean-500">
                    <AccountBalanceWalletRounded />
                  </div>
                  <div>
                    <p className="text-[10px] leading-none font-bold tracking-widest text-brand-500/40 uppercase">
                      Net Growth
                    </p>
                    <h3
                      className={`mt-1 text-xl font-bold ${data && data.summary.net_balance >= 0 ? "text-brand-500/90" : "text-red-500"}`}
                    >
                      Rp {data?.summary.net_balance.toLocaleString("id-ID")}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-tighter text-brand-500/30 uppercase">
                      Platform balance delta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/5 bg-smoke-200 text-brand-500/90 shadow-sm">
                  <HistoryRounded fontSize="small" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-500/90">
                    Mutation Breakdown
                  </h3>
                  <p className="text-xs font-bold tracking-widest text-brand-500/30 uppercase">
                    Aggregated by mutation type
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-500/5 text-left">
                      <th className="pb-4 pl-4 text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Mutation Type
                      </th>
                      <th className="pb-4 text-center text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Count
                      </th>
                      <th className="pr-4 pb-4 text-right text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-500/5">
                    {data?.details.map((row, idx) => (
                      <tr
                        key={idx}
                        className="group transition-colors hover:bg-smoke-200/50"
                      >
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${row.type === "credit" ? "bg-emerald-500" : "bg-red-500"}`}
                            ></div>
                            <span className="text-sm font-bold text-brand-500/90 uppercase">
                              {row.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-brand-500/60">
                            {row.total_count}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <span
                            className={`text-sm font-bold ${row.type === "credit" ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {row.type === "credit" ? "+" : "-"} Rp{" "}
                            {row.total_amount.toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data?.details.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-xs font-bold tracking-widest text-brand-500/20 uppercase"
                        >
                          No mutations recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
