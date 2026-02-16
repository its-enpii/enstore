"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PaymentsRounded,
  AssessmentRounded,
  CalendarMonthRounded,
  FilterListRounded,
  DonutLargeRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";
import { PaymentMethodStats } from "@/lib/api/types";

export default function PaymentMethodReportPage() {
  const [data, setData] = useState<PaymentMethodStats[]>([]);
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
      const res = await api.get<PaymentMethodStats[]>(
        ENDPOINTS.admin.reports.paymentMethods,
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

  const totalRevenue = data.reduce(
    (acc, curr) => acc + Number(curr.total_revenue),
    0,
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Payment Stats 🧾
            </h1>
            <p className="mt-1 font-bold text-brand-500/50">
              Analysis of payment methods performance.
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
            {/* Visual Charts / Bars Section */}
            <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/5 bg-smoke-200 text-brand-500/90 shadow-sm">
                  <DonutLargeRounded fontSize="small" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-500/90">
                    Method Popularity
                  </h3>
                  <p className="text-xs font-bold tracking-widest text-brand-500/30 uppercase">
                    Revenue share by method
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="space-y-6">
                  {data.map((method, idx) => {
                    const percentage =
                      totalRevenue > 0
                        ? (Number(method.total_revenue) / totalRevenue) * 100
                        : 0;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-bold text-brand-500/90 uppercase">
                            {method.payment_method}
                          </span>
                          <span className="text-xs font-bold text-brand-500/40">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-cloud-200">
                          <div
                            className="h-full rounded-full bg-ocean-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {data.length === 0 && (
                    <p className="py-10 text-center font-bold text-brand-500/30">
                      No data available.
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-center rounded-3xl border border-brand-500/5 bg-smoke-200/50 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-500">
                        <TrendingUpRounded />
                      </div>
                      <div>
                        <p className="text-[10px] leading-none font-bold tracking-widest text-brand-500/40 uppercase">
                          Total Revenue
                        </p>
                        <p className="mt-1 text-xl font-bold text-brand-500/90">
                          Rp {(totalRevenue ?? 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500/90">
                        <PaymentsRounded />
                      </div>
                      <div>
                        <p className="text-[10px] leading-none font-bold tracking-widest text-brand-500/40 uppercase">
                          Total Admin Fees
                        </p>
                        <p className="mt-1 text-xl font-bold text-brand-500/90">
                          Rp{" "}
                          {data
                            .reduce(
                              (acc, curr) => acc + Number(curr.total_fees),
                              0,
                            )
                            .toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/5 bg-smoke-200 text-brand-500/90 shadow-sm">
                  <AssessmentRounded fontSize="small" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-500/90">
                    Method Breakdown
                  </h3>
                  <p className="text-xs font-bold tracking-widest text-brand-500/30 uppercase">
                    Transaction & Profit metrics
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-500/5 text-left">
                      <th className="pb-4 pl-4 text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Method Name
                      </th>
                      <th className="pb-4 text-center text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Transactions
                      </th>
                      <th className="pb-4 text-right text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Avg Transaction
                      </th>
                      <th className="pr-4 pb-4 text-right text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Total Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-500/5">
                    {data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="group transition-colors hover:bg-smoke-200/50"
                      >
                        <td className="py-4 pl-4">
                          <span className="text-sm font-bold text-brand-500/90 uppercase">
                            {row.payment_method}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-brand-500/60">
                            {row.total_transactions}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-bold text-brand-500/60">
                            Rp{" "}
                            {Number(
                              row.average_transaction ?? 0,
                            ).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <span className="text-sm font-bold text-ocean-500">
                            Rp{" "}
                            {Number(row.total_revenue ?? 0).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-xs font-bold tracking-widest text-brand-500/20 uppercase"
                        >
                          No payment data recorded for this period.
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
