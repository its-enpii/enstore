"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  SearchRounded,
  CheckCircleRounded,
  AutorenewRounded,
  SportsEsportsRounded,
  SupportAgentRounded,
  TimerRounded,
  ErrorRounded,
  ReceiptRounded,
  PaymentsRounded,
  ChevronRightRounded,
  ReplayRounded,
  AccountBalanceWalletRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";

import { getTransactionStatus, type TransactionStatus } from "@/lib/api";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { toast } from "react-hot-toast";

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
    if (!invoiceId.trim()) {
        toast.error("Please enter an Invoice ID");
        return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setTransaction(null);
    
    try {
      const res = await getTransactionStatus(invoiceId.trim());
      if (res.success) {
        setTransaction(res.data);
      } else {
        const msg = res.message || "Transaction not found";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to track order";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Revised Step Logic for UI based on common flows:
  // 1. Pending: Created -> Waiting Payment
  // 2. Processing: Paid -> sending to provider
  // 3. Success: Done / Failed / Refunded
  const getSteps = () => {
    if (transaction?.status === "refunded" || transaction?.refund?.is_refunded) {
      return [
        { id: "pending", label: "Pending", icon: <PaymentsRounded /> },
        { id: "processing", label: "Processing", icon: <AutorenewRounded /> },
        { id: "refunded", label: "Refunded", icon: <ReplayRounded /> },
      ];
    }
    return [
      { id: "pending", label: "Pending", icon: <PaymentsRounded /> },
      { id: "processing", label: "Processing", icon: <AutorenewRounded /> },
      { id: "success", label: "Success", icon: <CheckCircleRounded /> },
    ];
  };

  const steps = getSteps();

  const getCurrentStepIndex = () => {
    if (!transaction) return -1;
    const s = transaction.status;
    if (s === "pending") return 0;
    if (s === "processing") return 1;
    if (s === "success") return 3; // Finished
    if (s === "refunded") return 3; // Finished (refunded)
    if (s === "failed" || s === "expired") return 2;
    return 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  return (
    <section className="min-h-screen bg-cloud-200 py-28">
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
          <ReceiptRounded style={{ fontSize: 200 }} />
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-0">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center">
            <h1 className="mb-6 md:mb-8 font-sans text-3xl font-bold tracking-tight text-brand-500/90 sm:text-4xl lg:text-6xl lg:leading-[1.1]">
              Track <span className="text-ocean-500">Your Order</span>
            </h1>
            <p className="mb-12 max-w-xl text-center text-sm tracking-wide text-brand-500/40 sm:text-base">
              Enter your invoice ID to see real-time status of your gaming
              top-up
            </p>
          </div>

          {/* Search Card */}
          <div className="rounded-[48px] bg-smoke-200 p-6 shadow-enstore md:p-8">
            <form
              onSubmit={handleTrack}
              className="flex flex-col items-center gap-6 sm:flex-row"
            >
              <Input
                icon={<ReceiptRounded />}
                placeholder="ENS/2026..."
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="border border-brand-500/5"
                fullWidth={true}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleTrack()}
                disabled={loading}
                className="w-full rounded-2xl py-4 sm:w-auto"
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
                  className="mt-10 py-20 text-center"
                >
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500"></div>
                  <p className="mt-4 text-brand-500/40">
                    Locating your transaction...
                  </p>
                </motion.div>
              )}

              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-10 rounded-3xl bg-red-50 py-10 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <PaymentsRounded style={{ fontSize: 32 }} />
                  </div>
                  <h3 className="text-lg font-bold text-red-600">
                    Order Not Found
                  </h3>
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
                  <div className="relative mb-14 flex items-center justify-between px-4 sm:px-10">
                    {/* Connection Line */}
                    <div className="absolute top-0 right-10 left-10 h-1 translate-y-[26px] px-10">
                      <motion.div
                        className={`h-full ${
                          transaction.status === "refunded" || transaction.refund?.is_refunded
                            ? "bg-amber-500"
                            : ["failed", "expired"].includes(transaction.status)
                              ? "bg-red-500"
                              : "bg-ocean-500"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{
                          width:
                            transaction.status === "success" ||
                            transaction.status === "refunded" ||
                            ["failed", "expired"].includes(transaction.status)
                              ? "100%"
                              : transaction.status === "processing"
                                ? "50%"
                                : "0%",
                        }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>

                    {steps.map((step, idx) => {
                      const currentStep = getCurrentStepIndex();
                      const status = transaction.status; // pending, processing, success, failed, expired
                      const isFailedStatus = ["failed", "expired"].includes(
                        status,
                      );
                      const isRefundedStatus = status === "refunded" || transaction.refund?.is_refunded;

                      // Default Pending Style
                      let styles = {
                        color: "text-brand-500/30",
                        bg: "bg-cloud-200 text-brand-500/20",
                        icon: step.icon,
                        label: step.label,
                      };

                      const isCompleted =
                        idx < currentStep ||
                        (idx === currentStep && (status === "success" || status === "refunded"));
                      const isCurrent =
                        idx === currentStep && status !== "success" && status !== "refunded";

                      if (isCompleted) {
                        if (isRefundedStatus && idx === 2) {
                          styles.color = "text-amber-500";
                          styles.bg = "bg-amber-50 border border-amber-300 text-amber-500";
                        } else {
                          styles.color = "text-ocean-500";
                          styles.bg = "bg-ocean-50 border border-ocean-200 text-ocean-500";
                        }
                      } else if (isCurrent) {
                        if (isFailedStatus && idx === 2) {
                          styles.color = "text-red-500";
                          styles.bg =
                            "bg-smoke-200 border-2 border-red-500 text-red-500";
                          styles.icon = <ErrorRounded />;
                          styles.label =
                            status === "expired" ? "Expired" : "Failed";
                        } else {
                          styles.color = "text-ocean-500";
                          styles.bg =
                            "bg-smoke-200 border-2 border-ocean-500 text-ocean-500";
                        }
                      }

                      return (
                        <div
                          key={step.id}
                          className="relative z-10 flex flex-col items-center gap-2 px-2"
                        >
                          <motion.div
                            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-500 ${styles.bg}`}
                          >
                            {styles.icon}
                          </motion.div>
                          <span
                            className={`text-sm font-medium ${styles.color}`}
                          >
                            {styles.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Refund Banner */}
                  {(transaction.status === "refunded" || transaction.refund?.is_refunded) && transaction.refund && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                          <AccountBalanceWalletRounded />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-amber-700">
                            Dana Telah Dikembalikan
                          </h3>
                          <p className="mb-3 text-sm text-amber-600/80">
                            Transaksi ini telah di-refund. Dana telah dikreditkan ke saldo akun Anda.
                          </p>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium uppercase text-amber-500/60">
                                Jumlah Refund
                              </p>
                              <p className="text-lg font-bold text-amber-700">
                                Rp. {formatPrice(transaction.refund.refund_amount ?? 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-amber-500/60">
                                Metode Refund
                              </p>
                              <p className="text-sm font-bold capitalize text-amber-700">
                                Saldo Akun
                              </p>
                            </div>
                            {transaction.refund.refunded_at && (
                              <div>
                                <p className="text-xs font-medium uppercase text-amber-500/60">
                                  Tanggal Refund
                                </p>
                                <p className="text-sm font-bold text-amber-700">
                                  {new Date(transaction.refund.refunded_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Order Card */}
                  <div className="mb-8 rounded-3xl border border-brand-500/5 bg-cloud-200 p-6 text-left sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-smoke-200">
                          <Image
                            src={
                              transaction.product.image ||
                              "/assets/placeholder.png"
                            }
                            alt={transaction.product.name}
                            fill
                            className="rounded-full object-cover p-2"
                          />
                        </div>
                        <div>
                          <h3 className="mb-1 text-2xl font-bold text-brand-500/90">
                            {transaction.product.name}
                          </h3>
                          <p className="text-sm font-medium text-ocean-500">
                            {transaction.product.item}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-ocean-500/20 bg-ocean-500/10 px-4 py-2 text-ocean-500">
                        <TimerRounded className="h-4! w-4!" />
                        <span className="text-xs">
                          Estimate Delivery: 5 mins
                        </span>
                      </div>
                    </div>

                    <div className="my-8 h-px w-full rounded-full bg-brand-500/5" />

                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                      <div className="flex-1">
                        <p className="mb-2 text-xs font-medium text-brand-500/40 uppercase">
                          Target Info
                        </p>
                        <div className="font-bold text-brand-500/90">
                          {/* Display first customer data field dynamically or fallback */}
                          {Object.values(
                            transaction.product.customer_data || {},
                          )[0] ||
                            transaction.sn ||
                            "-"}

                          {transaction.product.customer_data?.zone_id && (
                            <span>
                              &nbsp; (
                              {transaction.product.customer_data.zone_id})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="mb-2 text-xs font-medium text-brand-500/40 uppercase">
                          Item Name
                        </p>
                        <div className="font-bold text-brand-500/90">
                          {transaction.product.item}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="mb-2 text-xs font-medium text-brand-500/40 uppercase">
                          Payment Method
                        </p>
                        <div className="font-bold text-brand-500/90 capitalize">
                          {transaction.payment.payment_method}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="mb-2 text-xs font-medium text-brand-500/40 uppercase">
                          Transaction Value
                        </p>
                        <div className="font-bold text-brand-500/90">
                          Rp. {formatPrice(transaction.pricing.total)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="mb-4 text-sm text-brand-500/40">
                      Having trouble with your order?
                    </p>
                    <Link
                      href="/contact"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-ocean-500"
                    >
                      <SupportAgentRounded className="h-4! w-4!" />
                      Chat with Live Support
                      <ChevronRightRounded className="h-4! w-4!" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
