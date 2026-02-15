"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Inventory2Rounded, 
  DateRangeRounded, 
  FileDownloadRounded 
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ProductsReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>(ENDPOINTS.admin.reports.products, {
        start_date: dateRange.start,
        end_date: dateRange.end
      }, true);
      
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load product report");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <DashboardLayout role="admin">
       <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black text-brand-500 flex items-center gap-2">
                   <Inventory2Rounded className="text-ocean-500" /> Product Performance
                </h1>
                <p className="text-brand-500/50 mt-1 font-bold">Top selling products and revenue analysis.</p>
             </div>
             
             <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-brand-500/10">
                    <DateRangeRounded className="text-brand-500/40" fontSize="small" />
                    <input 
                        type="date" 
                        name="start"
                        value={dateRange.start}
                        onChange={handleDateChange}
                        className="text-xs font-bold text-brand-500 outline-none w-24"
                    />
                    <span className="text-brand-500/30 font-bold">-</span>
                    <input 
                        type="date" 
                        name="end"
                        value={dateRange.end}
                        onChange={handleDateChange}
                        className="text-xs font-bold text-brand-500 outline-none w-24"
                    />
                </div>
             </div>
          </div>
          
          <div className="bg-smoke-200 rounded-[32px] border border-brand-500/5 overflow-hidden shadow-sm">
             {loading ? (
                <div className="p-12 text-center">
                   <div className="inline-block w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="text-brand-500/40 font-bold">Loading report...</p>
                </div>
             ) : data.length === 0 ? (
                <div className="p-20 text-center">
                   <Inventory2Rounded className="text-brand-500/10 text-6xl mb-4" />
                   <h3 className="text-xl font-bold text-brand-500">No Sales Data</h3>
                   <p className="text-brand-500/40 mt-1">Try adjusting the date range.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full">
                       <thead className="bg-brand-500/5 border-b border-brand-500/5">
                           <tr className="text-left">
                               <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest pl-8">Product Name</th>
                               <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Code</th>
                               <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-center">Sold</th>
                               <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right">Revenue</th>
                               <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right pr-8">Profit</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-brand-500/5">
                           {data.map((item: any, idx: number) => (
                               <tr key={idx} className="group hover:bg-white transition-colors">
                                   <td className="px-6 py-4 pl-8">
                                       <div className="font-bold text-brand-500">{item.name}</div>
                                   </td>
                                   <td className="px-6 py-4">
                                       <span className="bg-brand-500/5 text-brand-500/50 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wide">
                                           {item.digiflazz_code}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <span className="font-bold text-brand-500">
                                           {item.total_sales}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                       <span className="font-bold text-brand-500">
                                           Rp {Number(item.total_revenue || 0).toLocaleString('id-ID')}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-right pr-8">
                                       <span className="font-black text-emerald-500">
                                           Rp {Number(item.total_profit || 0).toLocaleString('id-ID')}
                                       </span>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
             )}
          </div>
       </div>
    </DashboardLayout>
  );
}
