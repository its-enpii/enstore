"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import {
  AccountBalanceWalletRounded,
  AddRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createTopUp,
  getCustomerPaymentChannels,
  getBalance,
  type BalanceData,
} from "@/lib/api";

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 5000000];

export default function TopUpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingChannels(true);
      const [balRes, chRes] = await Promise.all([
        getBalance().catch(() => null),
        getCustomerPaymentChannels().catch(() => null),
      ]);
      if (balRes?.success) setBalance(balRes.data);
      if (chRes?.success) setPaymentChannels(chRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChannels(false);
    }
  };

  const finalAmount = amount || parseInt(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (finalAmount < 10000) {
      setError("Minimum top up is Rp 10,000");
      return;
    }
    if (finalAmount > 10000000) {
      setError("Maximum top up is Rp 10,000,000");
      return;
    }
    if (!selectedChannel) {
      setError("Please select a payment method");
      return;
    }

    try {
      setLoading(true);
      const res = await createTopUp({
        amount: finalAmount,
        payment_method: selectedChannel,
      });

      if (res.success) {
        const txCode = res.data.transaction.transaction_code;
        const payUrl = res.data.payment.payment_url;
        setSuccess({ code: txCode, url: payUrl });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create top up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  // Group payment channels
  const grouped = paymentChannels.reduce((acc: Record<string, any[]>, ch: any) => {
    const group = ch.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(ch);
    return acc;
  }, {});

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircleRounded className="text-emerald-500" fontSize="large" />
          </motion.div>
          <h2 className="text-xl font-black text-brand-500 dark:text-smoke-200">Top Up Created!</h2>
          <p className="text-brand-500/50 mt-2 text-sm font-bold">
            Transaction <span className="text-ocean-500">{success.code}</span> has been created. Complete your payment to add balance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <a
              href={success.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DashboardButton variant="primary" size="lg">
                Pay Now
              </DashboardButton>
            </a>
            <DashboardButton
              variant="secondary"
              size="lg"
              onClick={() => router.push("/reseller/transactions")}
            >
              View Transactions
            </DashboardButton>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <PageHeader
          title="Top Up Balance"
          emoji="💳"
          description="Add funds to your reseller wallet."
          breadcrumbs={[
            { label: "Dashboard", href: "/reseller/dashboard" },
            { label: "Top Up" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Amount Selection */}
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7">
              <h3 className="text-xs font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest mb-5">Select Amount</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(preset); setCustomAmount(""); }}
                    className={`py-4 rounded-2xl text-sm font-black transition-all ${
                      amount === preset
                        ? "bg-ocean-500 text-smoke-200 scale-105"
                        : "bg-cloud-200 dark:bg-brand-700/30 text-brand-500 dark:text-smoke-300 border border-brand-500/5 hover:border-ocean-500/30"
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>

              <DashboardInput
                type="number"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                placeholder="Custom amount (10,000 - 10,000,000)"
                icon={<span className="text-sm font-semibold">Rp</span>}
                fullWidth
              />
            </div>

            {/* Payment Method */}
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7">
              <h3 className="text-xs font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest mb-5">Payment Method</h3>

              {loadingChannels ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 bg-brand-500/5 rounded-2xl" />
                  ))}
                </div>
              ) : Object.entries(grouped).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([group, channels]) => (
                    <div key={group}>
                      <p className="text-[10px] font-black text-brand-500/30 uppercase tracking-widest mb-3">{group}</p>
                      <div className="space-y-2">
                        {(channels as any[]).map((ch: any) => (
                          <button
                            key={ch.code}
                            type="button"
                            onClick={() => setSelectedChannel(ch.code)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                              selectedChannel === ch.code
                                ? "bg-ocean-500/10 border-2 border-ocean-500"
                                : "bg-cloud-200 dark:bg-brand-700/30 border border-brand-500/5 hover:border-ocean-500/20"
                            }`}
                          >
                            {ch.icon_url && (
                              <img src={ch.icon_url} alt={ch.name} className="w-8 h-8 object-contain" />
                            )}
                            <div className="flex-1 text-left">
                              <p className="text-sm font-bold text-brand-500 dark:text-smoke-200">{ch.name}</p>
                              {ch.fee_customer && (ch.fee_customer.flat > 0 || ch.fee_customer.percent > 0) && (
                                <p className="text-[10px] text-brand-500/30 font-bold">
                                  Fee: {ch.fee_customer.flat > 0 ? formatCurrency(ch.fee_customer.flat) : ""} {ch.fee_customer.percent > 0 ? `${ch.fee_customer.percent}%` : ""}
                                </p>
                              )}
                            </div>
                            {selectedChannel === ch.code && (
                              <CheckCircleRounded className="text-ocean-500" fontSize="small" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-brand-500/30 text-sm text-center py-8">No payment methods available.</p>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold p-4 rounded-2xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <DashboardButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading || !finalAmount || !selectedChannel}
              loading={loading}
              icon={<AddRounded fontSize="small" />}
            >
              Top Up {finalAmount > 0 ? formatCurrency(finalAmount) : ""}
            </DashboardButton>
          </form>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center text-ocean-500">
                  <AccountBalanceWalletRounded />
                </div>
                <h3 className="text-xs font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest">Current Balance</h3>
              </div>
              <p className="text-2xl font-black text-brand-500 dark:text-smoke-200">
                {formatCurrency(balance?.available_balance ?? user?.balance ?? 0)}
              </p>
              {balance?.hold_amount ? (
                <p className="text-[10px] text-brand-500/30 font-bold mt-1 uppercase tracking-wider">
                  Hold: {formatCurrency(balance.hold_amount)}
                </p>
              ) : null}
            </div>

            {/* Summary */}
            {finalAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7"
              >
                <h3 className="text-xs font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-brand-500/30 uppercase tracking-widest">Top Up Amount</span>
                    <span className="font-bold text-brand-500 dark:text-smoke-200">{formatCurrency(finalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-brand-500/30 uppercase tracking-widest">Method</span>
                    <span className="font-bold text-brand-500 dark:text-smoke-200">{selectedChannel || "-"}</span>
                  </div>
                  <div className="border-t border-brand-500/5 my-2" />
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-brand-500/30 uppercase tracking-widest">New Balance</span>
                    <span className="font-black text-ocean-500 text-lg">
                      {formatCurrency((balance?.available_balance ?? user?.balance ?? 0) + finalAmount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
      </div>
    </div>
  );
}
