"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AccountBalanceWalletRounded, AddRounded, HistoryRounded } from "@mui/icons-material";

interface BalanceCardProps {
  balance: number;
  userType?: string;
  topUpHref?: string;
  historyHref?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  userType = "reseller",
  topUpHref = "/reseller/topup",
  historyHref = "/reseller/balance/history",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-ocean-500 rounded-[28px] p-7 text-smoke-200 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 border-40 border-smoke-200 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 border-30 border-smoke-200 rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-smoke-200/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <AccountBalanceWalletRounded />
          </div>
          <span className="text-[10px] font-black opacity-60">
            {userType} User
          </span>
        </div>

        <p className="text-xs opacity-80 font-bold">Available Balance</p>
        <p className="text-3xl font-black mt-1">
          Rp {balance?.toLocaleString("id-ID") || "0"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href={topUpHref}
            className="py-3 bg-smoke-200 text-ocean-500 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
          >
            <AddRounded fontSize="inherit" /> Top Up
          </Link>
          <Link
            href={historyHref}
            className="py-3 bg-smoke-200/20 text-smoke-200 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 backdrop-blur-md hover:scale-105 active:scale-95 transition-transform"
          >
            <HistoryRounded fontSize="inherit" /> History
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
