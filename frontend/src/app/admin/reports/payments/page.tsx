"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  PaymentsRounded,
  AssessmentRounded,
  CalendarMonthRounded,
  FilterListRounded,
  DonutLargeRounded,
  TrendingUpRounded
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";

interface PaymentMethodStats {
  payment_method: string;
  total_transactions: number;
  total_revenue: number;
  total_fees: number;
  average_transaction: number;
}

export default function PaymentMethodReportPage() {
  const [data, setData] = useState<PaymentMethodStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaymentMethodStats[]>(ENDPOINTS.admin.reports.paymentMethods, {
        start_date: startDate,
        end_date: endDate,
      });

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

  const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.total_revenue), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">Payment Stats 🧾</h1>
            <p className="text-brand-500/50 mt-1 font-bold">Analysis of payment methods performance.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-cloud-200 p-1 rounded-xl border border-brand-500/5">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-brand-500/90 outline-none p-2"
                />
                <span className="text-brand-500/20 text-xs font-bold px-1">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-brand-500/90 outline-none p-2"
                />
             </div>
             <button 
               onClick={fetchReport}
               className="p-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 active:scale-95 transition-all shadow-lg shadow-ocean-500/20"
             >
                <FilterListRounded fontSize="small" />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
           <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
             <p className="text-red-500 font-bold">{error}</p>
             <button onClick={fetchReport} className="mt-4 text-sm font-bold text-ocean-500 uppercase">Coba Lagi</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Charts / Bars Section */}
            <div className="bg-smoke-200 p-8 rounded-xl border border-brand-500/5">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-smoke-200 rounded-xl flex items-center justify-center text-brand-500/90 shadow-sm border border-brand-500/5">
                      <DonutLargeRounded fontSize="small" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-brand-500/90">Method Popularity</h3>
                      <p className="text-xs font-bold text-brand-500/30 uppercase tracking-widest">Revenue share by method</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      {data.map((method, idx) => {
                        const percentage = totalRevenue > 0 ? (Number(method.total_revenue) / totalRevenue) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-2">
                             <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-brand-500/90 uppercase">{method.payment_method}</span>
                                <span className="text-xs font-bold text-brand-500/40">{percentage.toFixed(1)}%</span>
                             </div>
                             <div className="h-2 w-full bg-cloud-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-ocean-500 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                             </div>
                          </div>
                        );
                      })}
                      {data.length === 0 && (
                         <p className="text-brand-500/30 font-bold text-center py-10">No data available.</p>
                      )}
                   </div>

                   <div className="bg-smoke-200/50 p-6 rounded-3xl border border-brand-500/5 flex flex-col justify-center">
                      <div className="space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-ocean-500/10 text-ocean-500 rounded-xl flex items-center justify-center">
                               <TrendingUpRounded />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-brand-500/40 uppercase tracking-widest leading-none">Total Revenue</p>
                               <p className="text-xl font-bold text-brand-500/90 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-500/10 text-brand-500/90 rounded-xl flex items-center justify-center">
                               <PaymentsRounded />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-brand-500/40 uppercase tracking-widest leading-none">Total Admin Fees</p>
                               <p className="text-xl font-bold text-brand-500/90 mt-1">
                                 Rp {data.reduce((acc, curr) => acc + Number(curr.total_fees), 0).toLocaleString('id-ID')}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-smoke-200 p-8 rounded-xl border border-brand-500/5">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-smoke-200 rounded-xl flex items-center justify-center text-brand-500/90 shadow-sm border border-brand-500/5">
                      <AssessmentRounded fontSize="small" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-brand-500/90">Method Breakdown</h3>
                      <p className="text-xs font-bold text-brand-500/30 uppercase tracking-widest">Transaction & Profit metrics</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                         <tr className="text-left border-b border-brand-500/5">
                            <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-500/30 pl-4">Method Name</th>
                            <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-500/30 text-center">Transactions</th>
                            <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-500/30 text-right">Avg Transaction</th>
                            <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-500/30 text-right pr-4">Total Revenue</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-500/5">
                         {data.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-smoke-200/50 transition-colors">
                               <td className="py-4 pl-4">
                                  <span className="text-sm font-bold text-brand-500/90 uppercase">{row.payment_method}</span>
                               </td>
                               <td className="py-4 text-center">
                                  <span className="text-sm font-bold text-brand-500/60">{row.total_transactions}</span>
                               </td>
                               <td className="py-4 text-right">
                                  <span className="text-sm font-bold text-brand-500/60">Rp {Number(row.average_transaction).toLocaleString('id-ID')}</span>
                               </td>
                               <td className="py-4 text-right pr-4">
                                  <span className="text-sm font-bold text-ocean-500">Rp {Number(row.total_revenue).toLocaleString('id-ID')}</span>
                               </td>
                            </tr>
                         ))}
                         {data.length === 0 && (
                            <tr>
                               <td colSpan={4} className="py-12 text-center text-brand-500/20 font-bold uppercase tracking-widest text-xs">
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
