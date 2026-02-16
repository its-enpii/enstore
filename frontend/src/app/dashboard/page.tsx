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
  AddRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Orders",
      value: "0",
      icon: <ShoppingCartRounded />,
      color: "ocean" as const,
    },
    {
      title: "My Balance",
      value: `Rp ${user?.balance?.toLocaleString("id-ID") || "0"}`,
      icon: <AccountBalanceWalletRounded />,
      color: "brand" as const,
    },
    {
      title: "Saved Items",
      value: "0",
      icon: <LocalOfferRounded />,
      color: "ocean" as const,
    },
    {
      title: "Notifications",
      value: "0",
      icon: <NotificationsRounded />,
      color: "brand" as const,
    },
  ];

  return (
    <>
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}!👋`}
        description="Here's what's happening with your account today."
        actions={
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-2xl bg-ocean-500 px-6 py-3 text-xs font-bold text-smoke-200 shadow-lg shadow-ocean-500/10 transition-all hover:bg-ocean-600"
          >
            <ShoppingCartRounded fontSize="small" />
            <span>New Purchase</span>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} index={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-500/90">
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-ocean-500 hover:underline"
            >
              View All <ChevronRightRounded fontSize="small" />
            </Link>
          </div>

          <EmptyState
            icon={<HistoryRounded fontSize="large" />}
            title="No transactions yet"
            description="When you make a purchase, it will show up here."
            action={
              <Link href="/services">
                <button className="rounded-xl bg-ocean-500 px-6 py-2 text-xs font-bold text-smoke-200 shadow-lg shadow-ocean-500/20">
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
          <div className="group relative overflow-hidden rounded-xl bg-linear-to-br from-ocean-500 to-brand-500 p-6 text-smoke-200">
            <div className="relative z-10">
              <span className="rounded-full bg-smoke-200/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md">
                Flash Sale
              </span>
              <h3 className="mt-3 text-xl font-bold">Get 20% Cashback</h3>
              <p className="mt-1 mb-6 text-sm text-smoke-200/60">
                On your first Mobile Legends diamond purchase!
              </p>
              <Link href="/services">
                <button className="w-full rounded-xl bg-smoke-200 py-2.5 font-bold text-brand-500/90 transition-colors hover:bg-cloud-200">
                  Claim Now
                </button>
              </Link>
            </div>
            <TrendingUpRounded className="absolute -right-4 -bottom-4 rotate-12 text-9xl text-smoke-200/10 transition-transform duration-500 group-hover:scale-110" />
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
