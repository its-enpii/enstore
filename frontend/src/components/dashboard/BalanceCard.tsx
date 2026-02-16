"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AccountBalanceWalletRounded,
  AddRounded,
  HistoryRounded,
} from "@mui/icons-material";

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
      className="relative overflow-hidden rounded-xl bg-ocean-600 p-6 text-smoke-200 shadow-lg"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full border-40 border-smoke-200" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-30 border-smoke-200" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-smoke-200/20 backdrop-blur-md">
            <AccountBalanceWalletRounded />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">
            {userType} User
          </span>
        </div>

        <p className="text-xs font-medium opacity-80">Available Balance</p>
        <p className="mt-1 text-3xl font-bold">
          Rp {balance?.toLocaleString("id-ID") || "0"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href={topUpHref}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-smoke-200 py-3 text-xs font-bold text-ocean-600 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <AddRounded fontSize="inherit" /> Top Up
          </Link>
          <Link
            href={historyHref}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-smoke-200/20 py-3 text-xs font-bold text-smoke-200 backdrop-blur-md transition-transform hover:scale-[1.02] active:scale-95"
          >
            <HistoryRounded fontSize="inherit" /> History
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
