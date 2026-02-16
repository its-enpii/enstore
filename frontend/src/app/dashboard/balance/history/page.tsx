"use client";

import { useState, useEffect } from "react";

import PageHeader from "@/components/dashboard/PageHeader";
import {
  TrendingUpRounded,
  TrendingDownRounded,
  ReceiptLongRounded,
  FilterListRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { getBalanceMutations, type BalanceMutation } from "@/lib/api/customer";
import { toast } from "react-hot-toast";

export default function BalanceHistoryPage() {
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getBalanceMutations(100);
      if (res.success) {
        setMutations(res.data);
      }
    } catch (error) {
      console.error("Failed to load mutation history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMutations = mutations.filter((m) => {
    if (filterType === "all") return true;
    return m.type === filterType;
  });

  return (
<>
      <div className="space-y-8">
        <PageHeader
          title="Mutation History"
          emoji="📊"
          description="View all balance transactions and movements."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Wallet", href: "/dashboard/balance" },
            { label: "History" },
          ]}
        />

        <div className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-8">
           {/* Filters */}
           <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                 { id: "all", label: "All Transactions" },
                 { id: "credit", label: "Income / Top Up" },
                 { id: "debit", label: "Expenses / Withdraw" },
              ].map((filter) => (
                 <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id as any)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                       filterType === filter.id
                          ? "bg-ocean-500 text-white border-ocean-500 shadow-lg shadow-ocean-500/20"
                          : "bg-smoke-200 dark:bg-brand-900/50 text-brand-500/90 border-brand-500/10 hover:border-ocean-500 hover:text-ocean-500"
                    }`}
                 >
                    {filter.label}
                 </button>
              ))}
           </div>

           {/* List */}
           {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-brand-500/5 rounded-xl" />)}
              </div>
           ) : filteredMutations.length === 0 ? (
              <div className="text-center py-20 bg-brand-500/5 rounded-2xl border border-dashed border-brand-500/20">
                <ReceiptLongRounded sx={{ fontSize: 64, opacity: 0.3, marginBottom: 2 }} />
                <h3 className="text-lg font-bold text-brand-500/60">No transactions found</h3>
                <p className="text-sm text-brand-500/40 mt-1">Try adjusting your filters or top up your balance.</p>
              </div>
           ) : (
              <div className="space-y-4">
                <AnimatePresence>
                   {filteredMutations.map((mutation) => (
                      <motion.div 
                        key={mutation.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 bg-smoke-200 dark:bg-brand-900/50 rounded-2xl border border-brand-500/5 hover:border-ocean-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mutation.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {mutation.type === 'credit' ? <TrendingUpRounded /> : <TrendingDownRounded />}
                           </div>
                           <div>
                              <p className="font-bold text-brand-500/90 dark:text-smoke-200 group-hover:text-ocean-500 transition-colors">{mutation.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <p className="text-xs text-brand-500/40 font-medium">{formatDate(mutation.created_at)}</p>
                                 {mutation.transaction?.transaction_code && (
                                    <span className="text-[10px] bg-brand-500/5 px-2 py-0.5 rounded text-brand-500/60 font-mono font-bold">
                                       #{mutation.transaction.transaction_code}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`font-bold text-lg ${mutation.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {mutation.type === 'credit' ? '+' : '-'}{formatCurrency(mutation.amount)}
                           </p>
                           <p className="text-[10px] text-brand-500/30 font-bold mt-0.5">Balance: {formatCurrency(mutation.balance_after)}</p>
                        </div>
                      </motion.div>
                   ))}
                </AnimatePresence>
              </div>
           )}
        </div>
      </div>
</>
  );
}
