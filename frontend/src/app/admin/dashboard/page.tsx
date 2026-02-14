
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
  CheckCircleRounded,
  PendingActionsRounded,
  NotificationsActiveRounded,
  ChevronRightRounded,
  NorthEastRounded,
  HistoryRounded
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { api, ENDPOINTS } from "@/lib/api";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(ENDPOINTS.admin.dashboard, undefined, true);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      title: "Revenue (MTD)", 
      value: data ? `Rp ${data.overview.total_revenue.toLocaleString('id-ID')}` : "Rp 0", 
      icon: <TrendingUpRounded />, 
      color: "bg-indigo-600", 
      text: "text-indigo-600", 
      growth: data?.overview.revenue_growth || 0,
      progress: 75 
    },
    { 
      title: "Total Transactions", 
      value: data ? data.overview.total_transactions.toLocaleString('id-ID') : "0", 
      icon: <ShoppingCartRounded />, 
      color: "bg-purple-600", 
      text: "text-purple-600", 
      growth: data?.overview.transaction_growth || 0,
      progress: 62 
    },
    { 
      title: "Active Users", 
      value: data ? data.users.active_users.toLocaleString('id-ID') : "0", 
      icon: <PeopleRounded />, 
      color: "bg-emerald-600", 
      text: "text-emerald-600", 
      growth: 12,
      progress: 88 
    },
    { 
      title: "System Balance", 
      value: "Rp 0", 
      icon: <AccountBalanceWalletRounded />, 
      color: "bg-amber-600", 
      text: "text-amber-600", 
      growth: 0,
      progress: 45 
    },
  ];

  const alerts = [
    { title: `${data?.transactions.pending || 0} Pending Transactions`, type: "warning", icon: <PendingActionsRounded fontSize="small" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { title: "Digiflazz Balance Low", type: "error", icon: <WarningRounded fontSize="small" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10" },
    { title: "Reseller Applications", type: "info", icon: <NotificationsActiveRounded fontSize="small" />, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
         <div className="h-96 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview 🛡️</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Control center for Enstore platform management.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Digiflazz: Connected</span>
             </div>
             <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Tripay: Active</span>
             </div>
          </div>
        </div>

        {/* Alerts / Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`${alert.bg} ${alert.color} px-4 py-3 rounded-xl flex items-center justify-between border border-white/20`}>
              <div className="flex items-center gap-2">
                {alert.icon}
                <span className="text-xs font-bold uppercase tracking-wide">{alert.title}</span>
              </div>
              <ChevronRightRounded fontSize="small" className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className={`w-10 h-10 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                    {stat.icon}
                 </div>
                 <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.growth >= 0 ? 'text-emerald-500' : 'text-red-500'} uppercase italic`}>
                    <NorthEastRounded fontSize="inherit" className={stat.growth < 0 ? 'rotate-90' : ''} />
                    <span>{Math.abs(stat.growth)}%</span>
                 </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Target Reach</span>
                  <span>{stat.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${stat.progress}%` }}
                     transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                     className={`h-full ${stat.color}`}
                   />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Section 1: Recent Transactions Area */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Transactions</h2>
                <Link href="/admin/transactions" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                  View Management
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                 <div className="p-12 text-center">
                    <HistoryRounded className="text-slate-200 text-6xl mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Real-time transaction log will appear here.</p>
                 </div>
              </div>
           </div>

           {/* Section 2: Best Products & Profit */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Performance</h2>
                <Link href="/admin/products" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                  Catalog Management
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <div className="space-y-6">
                    {data?.products.top_selling.length > 0 ? (
                      data.products.top_selling.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                           <div className="flex justify-between">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                              <p className="text-xs font-semibold text-slate-400">{item.total_sold} Sales</p>
                           </div>
                           <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((item.total_sold / 100) * 100, 100)}%` }}
                                transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                                className="h-full bg-indigo-500"
                              />
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-slate-400 text-sm">No sales data recorded yet.</p>
                    )}
                 </div>

                 <div className="mt-10 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-400/20">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                          <AssessmentRounded />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Estimated Profit (MTD)</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">Rp {data?.revenue.total_profit.toLocaleString('id-ID') || '0'}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
