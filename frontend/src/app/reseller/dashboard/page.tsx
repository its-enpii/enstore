
"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  TrendingUpRounded,
  AccountBalanceWalletRounded, 
  ShoppingCartRounded, 
  AssessmentRounded,
  HistoryRounded,
  ChevronRightRounded,
  AddRounded,
  NorthEastRounded,
  CheckCircleRounded
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";

export default function ResellerDashboard() {
  const stats = [
    { title: "Available Balance", value: "Rp 2.450.000", icon: <AccountBalanceWalletRounded />, color: "bg-indigo-500", light: "bg-indigo-50", dark: "dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { title: "Today's Sales", value: "Rp 540.000", icon: <ShoppingCartRounded />, color: "bg-emerald-500", light: "bg-emerald-50", dark: "dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { title: "Monthly Profit", value: "Rp 1.250.000", icon: <TrendingUpRounded />, color: "bg-purple-500", light: "bg-purple-50", dark: "dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    { title: "Active Orders", value: "12", icon: <AssessmentRounded />, color: "bg-amber-500", light: "bg-amber-50", dark: "dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <DashboardLayout role="reseller">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reseller Panel 💼</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your sales performance and balance.</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/reseller/topup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <AddRounded fontSize="small" />
              <span>Top Up Balance</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.light} ${stat.dark} rounded-xl flex items-center justify-center ${stat.text} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase italic">
                <NorthEastRounded fontSize="inherit" />
                <span>+12.5% vs yesterday</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sales Chart Placeholder */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-slate-900 dark:text-white">Sales Analytics</h2>
                  <select className="bg-slate-50 dark:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border-0 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
               </div>
               <div className="h-64 flex items-end justify-between gap-2 px-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div key={i} className="flex-1 space-y-2 text-center group">
                      <div className="relative h-48 w-full bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden flex items-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.1 + 0.5, type: "spring" }}
                          className="w-full bg-linear-to-t from-indigo-500 to-purple-500 rounded-t-lg group-hover:from-indigo-400 group-hover:to-purple-400 transition-all cursor-pointer"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Sales</h2>
                <Link href="/transactions" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                  View All Orders <ChevronRightRounded fontSize="small" />
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Weekly Diamond Pass</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">ENS20260214-99{i}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-bold rounded-full uppercase">
                             <CheckCircleRounded fontSize="inherit" />
                             <span>Success</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">Rp 28.500</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">Rp 1.500</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
             {/* Quick Topup / Card */}
             <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <AccountBalanceWalletRounded />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest opacity-60 italic">Reseller Plus</span>
                </div>
                <p className="text-xs opacity-80">Connected Wallet Balance</p>
                <p className="text-2xl font-black mt-1">Rp 2.450.000</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                   <button className="py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1">
                      <AddRounded fontSize="inherit" /> Top Up
                   </button>
                   <button className="py-2.5 bg-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 backdrop-blur-md">
                      History
                   </button>
                </div>
             </div>

             {/* Recent Balance Mutations */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Balance Mutations</h3>
                <div className="space-y-4">
                   {[1, 2].map(i => (
                     <div key={i} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === 1 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>
                           <HistoryRounded fontSize="small" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Top Up Balance Confirmed</p>
                           <p className="text-[10px] text-slate-400 mt-0.5">Feb 14, 2026 • 12:45</p>
                        </div>
                        <p className={`text-xs font-bold ${i === 1 ? 'text-emerald-500' : 'text-red-500'}`}>{i === 1 ? '+500k' : '-28k'}</p>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   View Full History
                </button>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
