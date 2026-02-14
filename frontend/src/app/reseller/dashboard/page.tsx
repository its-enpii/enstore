
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
import { useAuth } from "@/context/AuthContext";

export default function ResellerDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Available Balance", value: `Rp ${user?.balance?.toLocaleString('id-ID') || '0'}`, icon: <AccountBalanceWalletRounded />, color: "bg-indigo-500", light: "bg-indigo-50", dark: "dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { title: "Today's Sales", value: "Rp 0", icon: <ShoppingCartRounded />, color: "bg-emerald-500", light: "bg-emerald-50", dark: "dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { title: "Monthly Profit", value: "Rp 0", icon: <TrendingUpRounded />, color: "bg-purple-500", light: "bg-purple-50", dark: "dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    { title: "Active Orders", value: "0", icon: <AssessmentRounded />, color: "bg-amber-500", light: "bg-amber-50", dark: "dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <DashboardLayout role="reseller">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reseller Panel 💼</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Hello, {user?.name}. Monitor your sales performance and balance.</p>
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
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase italic">
                <span>Updated just now</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Sales</h2>
                <Link href="/transactions" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                  View All Orders <ChevronRightRounded fontSize="small" />
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ShoppingCartRounded className="text-slate-200 dark:text-slate-600" fontSize="large" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No sales data found</h3>
                    <p className="text-slate-500 mt-2">Start selling game products to see your performance here.</p>
                 </div>
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
                   <span className="text-xs font-bold uppercase tracking-widest opacity-60 italic">{user?.customer_type} User</span>
                </div>
                <p className="text-xs opacity-80">Available Wallet Balance</p>
                <p className="text-2xl font-black mt-1">Rp {user?.balance?.toLocaleString('id-ID') || '0'}</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                   <Link href="/reseller/topup" className="py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95">
                      <AddRounded fontSize="inherit" /> Top Up
                   </Link>
                   <Link href="/reseller/balance/history" className="py-2.5 bg-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 backdrop-blur-md transition-transform hover:scale-105 active:scale-95">
                      History
                   </Link>
                </div>
             </div>

             {/* Recent Balance Mutations */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Balance Mutations</h3>
                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                   <p className="text-xs text-slate-400 font-medium">No recent mutations</p>
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
