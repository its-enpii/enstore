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
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(
    null,
  );

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
  const grouped = (paymentChannels || []).reduce(
    (acc: Record<string, any[]>, ch: any) => {
      const group = ch.group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(ch);
      return acc;
    },
    {},
  );

  if (success) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CheckCircleRounded className="text-emerald-500" fontSize="large" />
        </motion.div>
        <h2 className="text-xl font-bold text-brand-500/90 dark:text-smoke-200">
          Top Up Created!
        </h2>
        <p className="mt-2 text-sm font-bold text-brand-500/50">
          Transaction <span className="text-ocean-500">{success.code}</span> has
          been created. Complete your payment to add balance.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={success.url} target="_blank" rel="noopener noreferrer">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 lg:col-span-2">
          {/* Amount Selection */}
          <div className="rounded-2xl border border-brand-500/5 bg-smoke-200 p-7 shadow-sm dark:bg-brand-800">
            <h3 className="mb-5 text-xs font-bold tracking-widest text-brand-500/90 uppercase dark:text-smoke-200">
              Select Amount
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount("");
                  }}
                  className={`rounded-2xl py-4 text-sm font-bold transition-all ${
                    amount === preset
                      ? "scale-105 bg-ocean-500 text-smoke-200"
                      : "border border-brand-500/5 bg-cloud-200 text-brand-500/90 hover:border-ocean-500/30 dark:bg-brand-700/30 dark:text-smoke-300"
                  }`}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>

            <DashboardInput
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(0);
              }}
              placeholder="Custom amount (10,000 - 10,000,000)"
              icon={<span className="text-sm font-semibold">Rp</span>}
              fullWidth
            />
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-brand-500/5 bg-smoke-200 p-7 shadow-sm dark:bg-brand-800">
            <h3 className="mb-5 text-xs font-bold tracking-widest text-brand-500/90 uppercase dark:text-smoke-200">
              Payment Method
            </h3>

            {loadingChannels ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-brand-500/5" />
                ))}
              </div>
            ) : Object.entries(grouped).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([group, channels]) => (
                  <div key={group}>
                    <p className="mb-3 text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                      {group}
                    </p>
                    <div className="space-y-2">
                      {(channels as any[]).map((ch: any) => (
                        <button
                          key={ch.code}
                          type="button"
                          onClick={() => setSelectedChannel(ch.code)}
                          className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all ${
                            selectedChannel === ch.code
                              ? "border-2 border-ocean-500 bg-ocean-500/10"
                              : "border border-brand-500/5 bg-cloud-200 hover:border-ocean-500/20 dark:bg-brand-700/30"
                          }`}
                        >
                          {ch.icon_url && (
                            <img
                              src={ch.icon_url}
                              alt={ch.name}
                              className="h-8 w-8 object-contain"
                            />
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-brand-500/90 dark:text-smoke-200">
                              {ch.name}
                            </p>
                            {ch.fee_customer &&
                              (ch.fee_customer.flat > 0 ||
                                ch.fee_customer.percent > 0) && (
                                <p className="text-[10px] font-bold text-brand-500/30">
                                  Fee:{" "}
                                  {ch.fee_customer.flat > 0
                                    ? formatCurrency(ch.fee_customer.flat)
                                    : ""}{" "}
                                  {ch.fee_customer.percent > 0
                                    ? `${ch.fee_customer.percent}%`
                                    : ""}
                                </p>
                              )}
                          </div>
                          {selectedChannel === ch.code && (
                            <CheckCircleRounded
                              className="text-ocean-500"
                              fontSize="small"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-brand-500/30">
                No payment methods available.
              </p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600"
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
          <div className="rounded-2xl border border-brand-500/5 bg-smoke-200 p-7 shadow-sm dark:bg-brand-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-500">
                <AccountBalanceWalletRounded />
              </div>
              <h3 className="text-xs font-bold tracking-widest text-brand-500/90 uppercase dark:text-smoke-200">
                Current Balance
              </h3>
            </div>
            <p className="text-2xl font-bold text-brand-500/90 dark:text-smoke-200">
              {formatCurrency(balance?.available_balance ?? user?.balance?.balance ?? 0)}
            </p>
            {balance?.bonus_balance ? (
              <p className="mt-1 text-[10px] font-bold tracking-wider text-brand-500/30 uppercase">
                Bonus: {formatCurrency(balance.bonus_balance)}
              </p>
            ) : null}
          </div>

          {/* Summary */}
          {finalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-brand-500/5 bg-smoke-200 p-7 shadow-sm dark:bg-brand-800"
            >
              <h3 className="mb-4 text-xs font-bold tracking-widest text-brand-500/90 uppercase dark:text-smoke-200">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                    Top Up Amount
                  </span>
                  <span className="font-bold text-brand-500/90 dark:text-smoke-200">
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                    Method
                  </span>
                  <span className="font-bold text-brand-500/90 dark:text-smoke-200">
                    {selectedChannel || "-"}
                  </span>
                </div>
                <div className="my-2 border-t border-brand-500/5" />
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                    New Balance
                  </span>
                  <span className="text-lg font-bold text-ocean-500">
                    {formatCurrency(
                      (balance?.available_balance ?? user?.balance?.balance ?? 0) +
                        finalAmount,
                    )}
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
