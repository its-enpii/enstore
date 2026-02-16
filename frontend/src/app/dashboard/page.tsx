"use client";

import React from "react";

import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import BalanceCard from "@/components/dashboard/BalanceCard";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  ShoppingCartRounded,
  AccountBalanceWalletRounded,
  NotificationsRounded,
  TrendingUpRounded,
  HistoryRounded,
  LocalOfferRounded,
  ChevronRightRounded,
  AddRounded
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Orders", value: "0", icon: <ShoppingCartRounded />, color: "ocean" as const },
    { title: "My Balance", value: `Rp ${user?.balance?.toLocaleString('id-ID') || '0'}`, icon: <AccountBalanceWalletRounded />, color: "brand" as const },
    { title: "Saved Items", value: "0", icon: <LocalOfferRounded />, color: "ocean" as const },
    { title: "Notifications", value: "0", icon: <NotificationsRounded />, color: "brand" as const },
  ];


  return (
    <>
        {/* Header */}
        <PageHeader 
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!👋`}
          description="Here's what's happening with your account today."
          actions={
            <Link 
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-smoke-200 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-ocean-500/10"
            >
              <ShoppingCartRounded fontSize="small" />
              <span>New Purchase</span>
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <StatCard key={idx} index={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">Recent Transactions</h2>
              <Link href="/dashboard/transactions" className="text-[10px] font-bold text-ocean-500 hover:underline inline-flex items-center gap-1">
                View All <ChevronRightRounded fontSize="small" />
              </Link>
            </div>
            
            <EmptyState
              icon={<HistoryRounded fontSize="large" />}
              title="No transactions yet"
              description="When you make a purchase, it will show up here."
              action={
                <Link href="/services">
                  <button className="px-6 py-2 bg-ocean-500 text-smoke-200 rounded-xl text-xs font-bold shadow-lg shadow-ocean-500/20">
                    Find Games
                  </button>
                </Link>
              }
            />
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-6">
            <BalanceCard
                balance={user?.balance ?? 0}
                userType="Retail"
                topUpHref="/dashboard/topup"
                historyHref="/dashboard/balance/history"
            />

            {/* Special Promo */}
            <div className="bg-linear-to-br from-ocean-500 to-brand-500 rounded-xl p-6 text-smoke-200 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-smoke-200/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">Flash Sale</span>
                <h3 className="text-xl font-bold mt-3">Get 20% Cashback</h3>
                <p className="text-smoke-200/60 text-sm mt-1 mb-6">On your first Mobile Legends diamond purchase!</p>
                <Link href="/services">
                <button className="w-full py-2.5 bg-smoke-200 text-brand-500/90 font-bold rounded-xl hover:bg-cloud-200 transition-colors">
                  Claim Now
                </button>
                </Link>
              </div>
              <TrendingUpRounded className="absolute -bottom-4 -right-4 text-smoke-200/10 text-9xl rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* Refer & Earn */}
            {/* <div className="bg-smoke-200 dark:bg-brand-800 p-6 rounded-xl border border-brand-500/5">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center text-ocean-500">
                    <LocalOfferRounded />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">Refer & Earn</h3>
                    <p className="text-xs text-brand-500/30">Invite friends to get balance</p>
                  </div>
               </div>
               <button className="w-full py-2 border-2 border-brand-500/5 text-brand-500/40 font-bold rounded-xl hover:bg-cloud-200 transition-colors">
                  Share Referral Link
               </button>
            </div> */}
          </div>
        </div>
    </>
  );
}
