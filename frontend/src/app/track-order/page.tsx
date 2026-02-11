"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  SearchRounded,
  ReceiptLongRounded,
  CheckCircleRounded,
  PendingRounded,
  AutorenewRounded,
  SportsEsportsRounded,
  SupportAgentRounded,
  TimerRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";

import { getTransactionStatus, type TransactionStatus } from "@/lib/api";

export default function TrackOrderPage() {
  const [invoiceId, setInvoiceId] = useState("");
  const [transaction, setTransaction] = useState<TransactionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!invoiceId.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setTransaction(null);

    try {
      const res = await getTransactionStatus(invoiceId.trim());
      if (res.success) {
        setTransaction(res.data);
      } else {
        setError(res.message || "Transaction not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to track order");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine active step
  const getStepStatus = (step: "pending" | "processing" | "success") => {
    if (!transaction) return "inactive";
    const currentStatus = transaction.status; // pending, processing, success, failed, expired

    // Map backend status to stepper
    // Assuming backend returns: 'pending' (unpaid), 'processing' (paid but not completed), 'success', 'failed'
    
    // Logic for "Pending" step (Payment)
    if (step === "pending") {
       return "completed"; // Always start here essentially, or checked if created
    }
    
    // Logic for "Processing" step
    if (step === "processing") {
       if (currentStatus === "pending") return "current"; // Waiting for payment
       if (currentStatus === "processing") return "current"; // Paid, processing
       if (currentStatus === "success" || currentStatus === "failed") return "completed";
       return "inactive";
    }

    // Logic for "Success" step
    if (step === "success") {
       if (currentStatus === "success") return "completed";
       if (currentStatus === "failed" || currentStatus === "expired") return "error";
       return "inactive";
    }

    return "inactive";
  };
  
  // Revised Step Logic for UI based on common flows:
  // 1. Pending: Created -> Waiting Payment
  // 2. Processing: Paid -> sending to provider
  // 3. Success: Done
  const steps = [
    { id: "pending", label: "Pending", icon: <PendingRounded /> },
    { id: "processing", label: "Processing", icon: <AutorenewRounded /> },
    { id: "success", label: "Success", icon: <CheckCircleRounded /> },
  ];

  const getCurrentStepIndex = () => {
      if (!transaction) return -1;
      const s = transaction.status;
      if (s === 'pending') return 0; // Highlight Step 1
      if (s === 'processing') return 1; // Highlight Step 2
      if (s === 'success') return 3; // Finished
      if (s === 'failed' || s === 'expired') return 3; // Finished (err)
      return 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  return (
    <section className="min-h-screen bg-cloud-200 pt-32 pb-20">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
           className="absolute top-20 left-10 text-cloud-300/50 opacity-20"
           animate={{ rotate: 360 }}
           transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        >
             <SportsEsportsRounded style={{ fontSize: 300 }} />
        </motion.div>
        <motion.div
           className="absolute top-40 right-10 text-cloud-300/50 opacity-20"
           animate={{ rotate: -360 }}
           transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
             <ReceiptLongRounded style={{ fontSize: 200 }} />
        </motion.div>
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-500/90 lg:text-5xl">
            Track <span className="text-ocean-500">Your Order</span>
          </h1>
          <p className="mb-12 text-lg text-brand-500/40">
            Enter your invoice ID to see real-time status of your gaming top-up
          </p>

          {/* Search Card */}
          <div className="rounded-[40px] bg-white p-4 shadow-xl shadow-brand-500/5 sm:p-10">
            <form onSubmit={handleTrack} className="mb-8 items-center gap-4 flex flex-col sm:flex-row">
              <div className="relative w-full flex-1">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30">
                    <ReceiptLongRounded />
                 </div>
                 <input 
                    type="text"
                    placeholder="EN/TU/2026..."
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full rounded-2xl border border-brand-500/10 bg-cloud-100 py-4 pl-12 pr-4 text-brand-500 font-medium placeholder:text-brand-500/30 focus:border-ocean-500 focus:outline-none focus:ring-4 focus:ring-ocean-500/10"
                 />
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => handleTrack()}
                disabled={loading}
                className="w-full sm:w-auto py-4 rounded-2xl"
                icon={loading ? undefined : <SearchRounded />}
              >
                  {loading ? "Searching..." : "Track Order"}
              </Button>
            </form>

            <AnimatePresence mode="wait">
              {loading && (
                 <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="py-20 text-center"
                 >
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500"></div>
                    <p className="mt-4 text-brand-500/40">Locating your transaction...</p>
                 </motion.div>
              )}

              {error && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl bg-red-50 py-10 text-center"
                  >
                     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                        <PendingRounded style={{ fontSize: 32 }} />
                     </div>
                     <h3 className="text-lg font-bold text-red-600">Order Not Found</h3>
                     <p className="text-red-500/60">{error}</p>
                  </motion.div>
              )}

              {transaction && !loading && (
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-10"
                >
                   {/* Stepper */}
                   <div className="mb-12 relative flex items-center justify-between px-4 sm:px-10">
                      {/* Connection Line */}
                      <div className="absolute top-1/2 left-10 right-10 h-1 -translate-y-1/2 bg-cloud-200">
                         <motion.div 
                            className="h-full bg-ocean-500"
                            initial={{ width: "0%" }}
                            animate={{ 
                               width: transaction.status === 'success' ? "100%" : 
                                      transaction.status === 'processing' ? "50%" : "0%" 
                            }}
                            transition={{ duration: 1, delay: 0.2 }}
                         />
                      </div>

                      {steps.map((step, idx) => {
                         const currentStep = getCurrentStepIndex();
                         const isCompleted = idx < currentStep || (idx === currentStep && transaction.status === 'success');
                         const isCurrent = idx === currentStep && transaction.status !== 'success';
                         const labelColor = isCompleted || isCurrent ? "text-ocean-500" : "text-brand-500/30";
                         const bgColor = isCompleted ? "bg-ocean-500 text-white" : isCurrent ? "bg-white border-2 border-ocean-500 text-ocean-500" : "bg-cloud-200 text-brand-500/20";
                         
                         return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
                               <motion.div 
                                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 ${bgColor}`}
                               >
                                  {step.icon}
                               </motion.div>
                               <span className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>
                                  {step.label}
                               </span>
                            </div>
                         );
                      })}
                   </div>

                   {/* Order Card */}
                   <div className="rounded-[32px] bg-cloud-100/50 p-6 sm:p-8 text-left">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-2 border border-brand-500/5">
                               <Image 
                                  src={transaction.product.image || "/assets/placeholder.png"} 
                                  alt={transaction.product.name}
                                  fill
                                  className="object-contain p-1"
                               />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold text-brand-500/90">{transaction.product.name}</h3>
                               <p className="text-sm font-medium text-ocean-500">{transaction.product.item}</p>
                            </div>
                         </div>
                         
                         <div className="inline-flex items-center gap-2 rounded-full bg-ocean-500/10 px-4 py-2 text-ocean-500 border border-ocean-500/20">
                            <TimerRounded fontSize="small" />
                            <span className="text-xs font-bold">Estimate Delivery: 5 mins</span>
                         </div>
                      </div>

                      <div className="my-8 h-px w-full bg-brand-500/5" />

                      <div className="grid grid-cols-1 gap-y-6 gap-x-12 sm:grid-cols-2">
                         <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-500/30">Target Info</p>
                            <p className="font-bold text-brand-500/90 break-all">
                               {/* Display first customer data field dynamically or fallback */}
                               {Object.values(transaction.product.customer_data || {})[0] || transaction.sn || "-"}
                            </p>
                            {transaction.product.customer_data?.zone_id && (
                               <span className="text-xs text-brand-500/50">({transaction.product.customer_data.zone_id})</span>
                            )}
                         </div>
                         
                         <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-500/30">Item Name</p>
                            <p className="font-bold text-brand-500/90">{transaction.product.item}</p>
                         </div>

                         <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-500/30">Payment Method</p>
                            <p className="font-bold text-brand-500/90 capitalize">{transaction.payment.payment_method}</p>
                         </div>

                         <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-500/30">Transaction Value</p>
                            <p className="font-bold text-brand-500/90">Rp. {formatPrice(transaction.pricing.total)}</p>
                         </div>
                      </div>
                   </div>

                   <p className="mt-10 mb-4 text-sm text-brand-500/40">Having trouble with your order?</p>
                   <Button variant="white" className="mx-auto text-ocean-500" icon={<SupportAgentRounded />}>
                      Chat with Live Support
                   </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
