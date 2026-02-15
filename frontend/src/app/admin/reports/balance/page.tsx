"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUpRounded, 
  TrendingDownRounded, 
  AccountBalanceWalletRounded,
  HistoryRounded,
  CalendarMonthRounded,
  FilterListRounded
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
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BalanceReportData>(ENDPOINTS.admin.reports.balance, {
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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-500">Balance Reports 💰</h1>
            <p className="text-brand-500/50 mt-1 font-bold">Monitor capital flow and balance mutations.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-cloud-200 p-1 rounded-xl border border-brand-500/5">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-brand-500 outline-none p-2"
                />
                <span className="text-brand-500/20 text-xs font-black px-1">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-brand-500 outline-none p-2"
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
             <button onClick={fetchReport} className="mt-4 text-sm font-black text-ocean-500 uppercase">Coba Lagi</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Total Credit */}
               <div className="bg-smoke-200 p-6 rounded-[32px] border border-brand-500/5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                  <div className="relative flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <TrendingUpRounded />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-brand-500/40 uppercase tracking-widest leading-none">Total Credit (In)</p>
                        <h3 className="text-xl font-black text-brand-500 mt-1">
                           Rp {data?.summary.total_credit.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">
                           {data?.summary.credit_count} mutations
                        </p>
                     </div>
                  </div>
               </div>

               {/* Total Debit */}
               <div className="bg-smoke-200 p-6 rounded-[32px] border border-brand-500/5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
                   <div className="relative flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                        <TrendingDownRounded />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-brand-500/40 uppercase tracking-widest leading-none">Total Debit (Out)</p>
                        <h3 className="text-xl font-black text-brand-500 mt-1">
                           Rp {data?.summary.total_debit.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">
                           {data?.summary.debit_count} mutations
                        </p>
                     </div>
                  </div>
               </div>

               {/* Net Balance Change */}
               <div className="bg-smoke-200 p-6 rounded-[32px] border border-brand-500/5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-ocean-500/5 rounded-full blur-2xl group-hover:bg-ocean-500/10 transition-colors"></div>
                  <div className="relative flex items-center gap-4">
                     <div className="w-12 h-12 bg-ocean-500/10 text-ocean-500 rounded-2xl flex items-center justify-center">
                        <AccountBalanceWalletRounded />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-brand-500/40 uppercase tracking-widest leading-none">Net Growth</p>
                        <h3 className={`text-xl font-black mt-1 ${data && data.summary.net_balance >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                           Rp {data?.summary.net_balance.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-[10px] font-bold text-brand-500/30 mt-1 uppercase tracking-tighter">
                           Platform balance delta
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Table Section */}
            <div className="bg-smoke-200 p-8 rounded-[32px] border border-brand-500/5">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-500 shadow-sm border border-brand-500/5">
                      <HistoryRounded fontSize="small" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-brand-500">Mutation Breakdown</h3>
                      <p className="text-xs font-bold text-brand-500/30 uppercase tracking-widest">Aggregated by mutation type</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                         <tr className="text-left border-b border-brand-500/5">
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-500/30 pl-4">Mutation Type</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-500/30 text-center">Count</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-500/30 text-right pr-4">Total Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-500/5">
                         {data?.details.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-white/50 transition-colors">
                               <td className="py-4 pl-4">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${row.type === 'credit' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                     <span className="text-sm font-black text-brand-500 uppercase">{row.type}</span>
                                  </div>
                               </td>
                               <td className="py-4 text-center">
                                  <span className="text-sm font-bold text-brand-500/60">{row.total_count}</span>
                               </td>
                               <td className="py-4 text-right pr-4">
                                  <span className={`text-sm font-black ${row.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                     {row.type === 'credit' ? '+' : '-'} Rp {row.total_amount.toLocaleString('id-ID')}
                                  </span>
                               </td>
                            </tr>
                         ))}
                         {data?.details.length === 0 && (
                            <tr>
                               <td colSpan={3} className="py-12 text-center text-brand-500/20 font-bold uppercase tracking-widest text-xs">
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
