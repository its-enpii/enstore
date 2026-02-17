"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/dashboard/PageHeader";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardButton from "@/components/dashboard/DashboardButton";
import {
  AddCardRounded,
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  PaymentRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import {
  createTopUp,
  getCustomerPaymentChannels,
  type TopUpResponse,
} from "@/lib/api/customer";
import { toast } from "react-hot-toast";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TopUpPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const res = await getCustomerPaymentChannels();
      if (res.success) {
        setPaymentChannels(res.data || []);
      }
    } catch (error) {
      console.error("Failed to load payment channels:", error);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handlePresetClick = (val: number) => {
    setAmount(val);
  };

  const handleTopUp = async () => {
    if (!amount || Number(amount) < 10000) {
      toast.error("Minimum top up amount is Rp 10.000");
      return;
    }
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setLoading(true);
      const res = await createTopUp({
        amount: Number(amount),
        payment_method: selectedMethod,
      });

      if (res.success) {
        toast.success("Top Up Initiated!");
        const paymentUrl = res.data.payment?.payment_url;
        if (paymentUrl) {
          window.location.href = paymentUrl; // Redirect to payment gateway
        } else {
          // Fallback if no URL (e.g. manual transfer instruction page?)
          // For now redirect to transaction detail
          router.push(
            `/dashboard/transactions/${res.data.transaction.transaction_code}`,
          );
        }
      } else {
        toast.error(res.message || "Failed to create top up");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Group payment channels
  const groupedChannels = (paymentChannels || []).reduce(
    (acc, channel) => {
      const groupName = channel.group || "Other";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(channel);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID").format(val);

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          title="Top Up Balance"
          emoji="➕"
          description="Add funds to your wallet securely."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Wallet", href: "/dashboard/balance" },
            { label: "Top Up" },
          ]}
        />

        <div className="space-y-8 rounded-2xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm dark:bg-brand-800">
          {/* Amount Section */}
          <div className="space-y-6">
            <label className="ml-1 block text-sm font-bold text-brand-500/90">
              Top Up Amount (IDR)
            </label>

            <DashboardInput
              type="number"
              value={amount.toString()}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              icon={
                <span className="text-lg font-bold text-brand-500/30">Rp</span>
              }
              fullWidth
              className="text-2xl font-bold"
            />

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => handlePresetClick(val)}
                  className={`rounded-xl border px-2 py-2 text-xs font-bold transition-all ${
                    amount === val
                      ? "border-ocean-500 bg-ocean-500 text-white shadow-lg shadow-ocean-500/20"
                      : "border-brand-500/10 bg-smoke-200 text-brand-500/90 hover:border-ocean-500 hover:text-ocean-500 dark:bg-brand-900/50"
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div>
            <label className="mb-6 ml-1 block text-sm font-bold tracking-widest text-brand-500/90 uppercase opacity-40">
              Select Payment Method
            </label>
            {loadingChannels ? (
              <div className="h-40 animate-pulse rounded-2xl bg-brand-500/5" />
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedChannels).map(
                  ([groupName, channels]) => (
                    <div key={groupName} className="space-y-4">
                      <h4 className="ml-1 flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-brand-500/30 uppercase">
                        {groupName}
                        <div className="h-px flex-1 bg-brand-500/5"></div>
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {(channels as any[]).map((channel: any) => (
                          <div
                            key={channel.code}
                            onClick={() => setSelectedMethod(channel.code)}
                            className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                              selectedMethod === channel.code
                                ? "border-ocean-500 bg-ocean-500/5"
                                : "border-brand-500/5 bg-smoke-200 hover:border-ocean-500/30 dark:bg-brand-900/50"
                            }`}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-500/5 bg-smoke-200 p-2 shadow-sm">
                              {/* Ideally use channel.icon_url */}
                              <PaymentRounded className="text-brand-500/20" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-brand-500/90">
                                {channel.name}
                              </p>
                              <p className="text-[10px] font-bold tracking-wider text-brand-500/40 uppercase">
                                {channel.group}
                              </p>
                            </div>
                            {selectedMethod === channel.code && (
                              <div className="absolute top-3 right-3 text-ocean-500">
                                <CheckCircleRounded fontSize="small" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}

                {paymentChannels.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-brand-500/10 bg-brand-500/5 py-10 text-center text-brand-500/40">
                    No payment channels available.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary & Action */}
          <div className="border-t border-brand-500/5 pt-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-brand-500/60">Total Payment</span>
              <span className="text-2xl font-bold text-ocean-500">
                Rp {formatCurrency(Number(amount) || 0)}
              </span>
            </div>

            <DashboardButton
              fullWidth
              variant="primary"
              onClick={handleTopUp}
              disabled={loading || !amount || !selectedMethod}
              loading={loading}
              icon={<ArrowForwardRounded />}
              className="py-4 text-lg"
            >
              Confirm & Pay
            </DashboardButton>
          </div>
        </div>
      </div>
    </>
  );
}
