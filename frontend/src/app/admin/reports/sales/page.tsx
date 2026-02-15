"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  AssessmentRounded, 
  DateRangeRounded, 
  FileDownloadRounded 
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";

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
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      
      const res = await api.get(ENDPOINTS.admin.reports.sales, {
        start_date: start,
        end_date: end,
        group_by: period
      }, true);
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
             <h1 className="text-2xl font-black text-brand-500 flex items-center gap-2">
                <AssessmentRounded className="text-ocean-500" /> Sales Report
             </h1>
             <div className="flex gap-2">
                <select 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white border border-brand-500/10 rounded-xl px-4 py-2 text-sm font-bold text-brand-500 outline-none"
                >
                   <option value="day">Today</option>
                   <option value="week">This Week</option>
                   <option value="month">This Month</option>
                </select>
                <button className="bg-ocean-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                   <FileDownloadRounded fontSize="small" /> Export CSV
                </button>
             </div>
          </div>
          
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : error ? (
             <div className="bg-red-500/10 p-8 rounded-[32px] border border-red-500/20 text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button 
                  onClick={fetchReport}
                  className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
             </div>
          ) : (
             <div className="bg-smoke-200 p-8 rounded-[32px] border border-brand-500/5">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                   <div className="bg-white p-4 rounded-xl border border-brand-500/5">
                      <p className="text-xs font-bold text-brand-500/40 uppercase">Total Revenue</p>
                      <p className="text-xl font-black text-ocean-500">Rp {(data?.summary?.total_revenue || 0).toLocaleString('id-ID')}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-brand-500/5">
                      <p className="text-xs font-bold text-brand-500/40 uppercase">Total Profit</p>
                      <p className="text-xl font-black text-emerald-500">Rp {(data?.summary?.total_profit || 0).toLocaleString('id-ID')}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-brand-500/5">
                      <p className="text-xs font-bold text-brand-500/40 uppercase">Transactions</p>
                      <p className="text-xl font-black text-brand-500">{data?.summary?.total_transactions || 0}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-brand-500/5">
                      <p className="text-xs font-bold text-brand-500/40 uppercase">Avg. Transaction</p>
                      <p className="text-xl font-black text-brand-500">Rp {(data?.summary?.average_transaction || 0).toLocaleString('id-ID')}</p>
                   </div>
                </div>

                {/* Table */}
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-brand-500/5 text-left">
                         <th className="px-4 py-3 text-xs font-bold uppercase text-brand-500/40">Date</th>
                         <th className="px-4 py-3 text-xs font-bold uppercase text-brand-500/40">Transactions</th>
                         <th className="px-4 py-3 text-xs font-bold uppercase text-brand-500/40">Revenue</th>
                         <th className="px-4 py-3 text-xs font-bold uppercase text-brand-500/40">Profit</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-500/5">
                      {data?.details?.length > 0 ? (
                        data.details.map((item: any, idx: number) => (
                         <tr key={idx} className="hover:bg-white/50">
                            <td className="px-4 py-3 text-sm font-bold text-brand-500">{item.period}</td>
                            <td className="px-4 py-3 text-sm font-bold text-brand-500">{item.total_transactions}</td>
                            <td className="px-4 py-3 text-sm font-bold text-ocean-500">Rp {(item.total_revenue || 0).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-sm font-bold text-emerald-500">Rp {(item.total_profit || 0).toLocaleString('id-ID')}</td>
                         </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-brand-500/40 font-bold text-sm">
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
