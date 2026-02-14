
"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  ShoppingCartRounded, 
  AccountBalanceWalletRounded, 
  NotificationsRounded, 
  TrendingUpRounded,
  HistoryRounded,
  LocalOfferRounded,
  ChevronRightRounded
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Orders", value: "0", icon: <ShoppingCartRounded />, color: "bg-indigo-500", light: "bg-indigo-50", dark: "dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { title: "My Balance", value: `Rp ${user?.balance?.toLocaleString('id-ID') || '0'}`, icon: <AccountBalanceWalletRounded />, color: "bg-emerald-500", light: "bg-emerald-50", dark: "dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { title: "Saved Items", value: "0", icon: <LocalOfferRounded />, color: "bg-purple-500", light: "bg-purple-50", dark: "dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    { title: "Notifications", value: "0", icon: <NotificationsRounded />, color: "bg-amber-500", light: "bg-amber-50", dark: "dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <DashboardLayout role="retail">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening with your account today.</p>
          </div>
          <Link 
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <ShoppingCartRounded fontSize="small" />
            <span>New Purchase</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.light} ${stat.dark} rounded-xl flex items-center justify-center ${stat.text}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                View All <ChevronRightRounded fontSize="small" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
               <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HistoryRounded className="text-slate-300" fontSize="large" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">No transactions yet</h3>
                  <p className="text-sm text-slate-500 mt-1">When you make a purchase, it will show up here.</p>
               </div>
            </div>
          </div>

          {/* Special Offers / Banners */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Promo</h2>
            <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Flash Sale</span>
                <h3 className="text-xl font-bold mt-3">Get 20% Cashback</h3>
                <p className="text-indigo-100 text-sm mt-1 mb-6">On your first Mobile Legends diamond purchase this month!</p>
                <button className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                  Claim Now
                </button>
              </div>
              <TrendingUpRounded className="absolute -bottom-4 -right-4 text-white/10 text-9xl rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                    <LocalOfferRounded />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Refer & Earn</h3>
                    <p className="text-xs text-slate-500">Invite friends to get balance</p>
                  </div>
               </div>
               <button className="w-full py-2 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Share Referral Link
               </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
