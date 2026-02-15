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
import { motion, AnimatePresence } from "motion/react";
import { createTopUp, getCustomerPaymentChannels, type TopUpResponse } from "@/lib/api/customer";
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
            setPaymentChannels(res.data);
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
        const paymentUrl = res.data.payment.payment_url;
        if (paymentUrl) {
            window.location.href = paymentUrl; // Redirect to payment gateway
        } else {
             // Fallback if no URL (e.g. manual transfer instruction page?)
             // For now redirect to transaction detail
             router.push(`/dashboard/transactions/${res.data.transaction.transaction_code}`);
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

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID").format(val);

  return (
<>
      <div className="space-y-8 max-w-3xl mx-auto">
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

        <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-8 space-y-8">
           {/* Amount Section */}
           <div>
              <label className="block text-sm font-bold text-brand-500 mb-3 ml-1">Top Up Amount (IDR)</label>
              <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-brand-500/30 text-lg">Rp</span>
                 <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-brand-900/50 rounded-2xl border-2 border-transparent focus:border-ocean-500 outline-none font-black text-2xl text-brand-500 transition-all placeholder:text-brand-500/10"
                    placeholder="0"
                    min={10000}
                 />
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                 {PRESET_AMOUNTS.map((val) => (
                    <button
                       key={val}
                       onClick={() => handlePresetClick(val)}
                       className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                          amount === val 
                             ? "bg-ocean-500 text-white border-ocean-500 shadow-lg shadow-ocean-500/20" 
                             : "bg-white dark:bg-brand-900/50 text-brand-500 border-brand-500/10 hover:border-ocean-500 hover:text-ocean-500"
                       }`}
                    >
                       {formatCurrency(val)}
                    </button>
                 ))}
              </div>
           </div>

           {/* Payment Method Section */}
           <div>
              <label className="block text-sm font-bold text-brand-500 mb-3 ml-1">Select Payment Method</label>
              {loadingChannels ? (
                 <div className="h-40 bg-brand-500/5 rounded-2xl animate-pulse" />
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentChannels.map((channel: any) => (
                       <div 
                          key={channel.code}
                          onClick={() => setSelectedMethod(channel.code)}
                          className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                             selectedMethod === channel.code
                                ? "border-ocean-500 bg-ocean-500/5"
                                : "border-brand-500/5 bg-white dark:bg-brand-900/50 hover:border-ocean-500/30"
                          }`}
                       >
                          <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center border border-brand-500/5">
                             {/* Ideally use channel.icon_url */}
                             <PaymentRounded className="text-brand-500/20" /> 
                          </div>
                          <div>
                             <p className="font-bold text-sm text-brand-500">{channel.name}</p>
                             <p className="text-[10px] text-brand-500/40 font-bold uppercase tracking-wider">{channel.group}</p>
                          </div>
                          {selectedMethod === channel.code && (
                             <div className="absolute top-3 right-3 text-ocean-500">
                                <CheckCircleRounded fontSize="small" />
                             </div>
                          )}
                       </div>
                    ))}
                    {paymentChannels.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-brand-500/40 bg-brand-500/5 rounded-2xl border border-dashed border-brand-500/20">
                            No payment channels available.
                        </div>
                    )}
                 </div>
              )}
           </div>

           {/* Summary & Action */}
           <div className="pt-6 border-t border-brand-500/5">
              <div className="flex justify-between items-center mb-6">
                 <span className="font-bold text-brand-500/60">Total Payment</span>
                 <span className="font-black text-2xl text-ocean-500">Rp {formatCurrency(Number(amount) || 0)}</span>
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
