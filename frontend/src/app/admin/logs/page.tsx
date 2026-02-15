"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  HistoryRounded,
  SearchRounded,
  DeleteSweepRounded,
  FilterListRounded
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
    search: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [params.page, params.search]); // Use params directly in useEffect

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(ENDPOINTS.admin.activityLogs.list, params, true);
      if (res.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const cleanLogs = async () => {
    if (!confirm("Are you sure? This will delete logs older than 30 days.")) return;
    setCleaning(true);
    try {
      const res = await api.post(ENDPOINTS.admin.activityLogs.clean, { days: 30 }, true);
      if (res.success) {
        toast.success("Logs cleaned successfully");
        fetchLogs();
      } else {
        toast.error("Failed to clean logs");
      }
    } catch (err) {
      console.error("Failed to clean logs:", err);
      toast.error("Failed to clean logs");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-500 flex items-center gap-2">
              <HistoryRounded className="text-ocean-500" /> Activity Logs
            </h1>
            <p className="text-brand-500/50 mt-1 font-bold">Monitor admin and system activities.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={cleanLogs}
              disabled={cleaning}
              className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2 group disabled:opacity-50"
            >
              <DeleteSweepRounded fontSize="small" className="group-hover:scale-110 transition-transform" /> 
              {cleaning ? "Cleaning..." : "Clean Old Logs"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-smoke-200 p-4 rounded-2xl border border-brand-500/5 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={params.search}
                onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm font-bold text-brand-500 outline-none border border-transparent focus:border-ocean-500/20 focus:ring-4 focus:ring-ocean-500/5 transition-all"
              />
              <SearchRounded className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500/30" fontSize="small" />
           </div>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white rounded-xl text-brand-500/60 hover:text-ocean-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-transparent hover:border-brand-500/5 transition-all">
                 <FilterListRounded fontSize="small" /> Filters
              </button>
           </div>
        </div>

        {/* Logs Table */}
        <div className="bg-smoke-200 rounded-[32px] border border-brand-500/5 overflow-hidden">
           {loading ? (
              <div className="p-12 flex justify-center">
                 <div className="w-8 h-8 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
           ) : (
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-brand-500/5 text-left">
                       <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-500/50">Timestamp</th>
                       <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-500/50">Action</th>
                       <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-500/50">User</th>
                       <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-500/50">Details</th>
                       <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-500/50">IP Address</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-brand-500/5">
                    {logs.length > 0 ? (
                       logs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-white/50 transition-colors group">
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-brand-500/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                   {new Date(log.created_at).toLocaleDateString('id-ID')}
                                </p>
                                <p className="text-sm font-black text-brand-500">
                                   {new Date(log.created_at).toLocaleTimeString('id-ID')}
                                </p>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-ocean-500/10 text-ocean-500`}>
                                   {log.action}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-[10px] font-bold text-brand-500">
                                      {log.user?.name?.charAt(0) || "?"}
                                   </div>
                                   <p className="text-sm font-bold text-brand-500">{log.user?.name || "System"}</p>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-medium text-brand-500/70 truncate max-w-[200px]" title={log.description}>
                                   {log.description}
                                </p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-mono font-bold text-brand-500/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                   {log.ip_address || "-"}
                                </p>
                             </td>
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-brand-500/40 text-sm font-bold uppercase tracking-widest">
                             No activity logs found.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
