"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Link from "next/link";
import {
  ReceiptLongRounded,
  ContentCopyRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  PaymentRounded,
  InventoryRounded,
  OpenInNewRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import { getTransactionDetail, type CustomerTransaction } from "@/lib/api/customer";
import { toast } from "react-hot-toast";

export default function TransactionDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [transaction, setTransaction] = useState<CustomerTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) loadDetail();
  }, [code]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getTransactionDetail(code);
      if (res.success) setTransaction(res.data);
      else toast.error(res.message || "Transaction not found");
    } catch (err) {
      console.error("Failed to load transaction:", err);
      toast.error("Failed to load transaction");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const formatDateTime = (s: string) => new Date(s).toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-brand-500/5 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] p-8 border border-brand-500/5 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-brand-500/5 rounded-full" />)}
            </div>
            <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] p-8 border border-brand-500/5 space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-brand-500/5 rounded-full" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!transaction) {
    return (
      <>
        <div className="py-20 text-center">
          <p className="text-brand-500/40 font-bold text-sm">Transaction not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Transaction Detail"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Transactions", href: "/dashboard/transactions" },
            { label: code },
          ]}
          actions={
            <div className="flex items-center gap-3">
              {/* Invoice link (disabled/hidden if not implemented yet, or enable if ready) */}
              {/* 
              <Link
                href={`/dashboard/transactions/${code}/invoice`}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10"
              >
                <FileDownloadRounded fontSize="small" /> Invoice
              </Link>
              */}
              <div className="flex items-center gap-2">
                <StatusBadge status={transaction.status} size="md" />
                <StatusBadge status={transaction.payment_status} size="md" label={transaction.payment_status} />
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center text-ocean-500">
                <ReceiptLongRounded />
              </div>
              <h3 className="text-sm font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest">Order Details</h3>
            </div>

            <div className="space-y-4">
              <InfoRow label="Transaction Code">
                <div className="flex items-center gap-2">
                  <span className="font-black text-brand-500 dark:text-smoke-200">{transaction.transaction_code}</span>
                  <button onClick={copyCode} className="text-brand-500/30 hover:text-ocean-500 transition-colors">
                    {copied ? <CheckCircleRounded fontSize="small" className="text-emerald-500" /> : <ContentCopyRounded fontSize="small" />}
                  </button>
                </div>
              </InfoRow>
              <InfoRow label="Type">
                <StatusBadge status={transaction.transaction_type === "topup" ? "info" : "neutral"} label={transaction.transaction_type} />
              </InfoRow>
              <InfoRow label="Product">
                <span className="font-bold text-brand-500 dark:text-smoke-200">{transaction.product_name}</span>
              </InfoRow>
              {transaction.product_code && (
                <InfoRow label="SKU Code">
                  <span className="font-mono text-xs text-brand-500/50">{transaction.product_code}</span>
                </InfoRow>
              )}
              <InfoRow label="Date">
                <span className="text-brand-500/60 dark:text-smoke-300">{formatDateTime(transaction.created_at)}</span>
              </InfoRow>
              {transaction.sn && (
                <InfoRow label="Serial Number">
                  <span className="font-mono text-emerald-600 font-bold">{transaction.sn}</span>
                </InfoRow>
              )}
              {transaction.note && (
                <InfoRow label="Note">
                  <span className="text-brand-500/50">{transaction.note}</span>
                </InfoRow>
              )}
              {transaction.customer_data && Object.keys(transaction.customer_data).length > 0 && (
                <InfoRow label="Target">
                  <div className="space-y-1">
                    {Object.entries(transaction.customer_data).map(([key, val]) => (
                      <p key={key} className="text-xs text-brand-500/50">
                        <span className="font-bold uppercase">{key.replace(/_/g, " ")}:</span> {val}
                      </p>
                    ))}
                  </div>
                </InfoRow>
              )}
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                <PaymentRounded />
              </div>
              <h3 className="text-sm font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest">Payment</h3>
            </div>

            <div className="space-y-4">
              <InfoRow label="Method">
                <span className="font-bold text-brand-500 dark:text-smoke-200">{transaction.payment_method || transaction.payment?.payment_method}</span>
              </InfoRow>
              <InfoRow label="Product Price">
                <span className="font-bold text-brand-500/60">{formatCurrency(transaction.product_price)}</span>
              </InfoRow>
              <InfoRow label="Admin Fee">
                <span className="font-bold text-brand-500/60">{formatCurrency(transaction.admin_fee)}</span>
              </InfoRow>
              <div className="border-t border-brand-500/5 my-2" />
              <InfoRow label="Total">
                <span className="text-lg font-black text-brand-500 dark:text-smoke-200">{formatCurrency(transaction.total_price)}</span>
              </InfoRow>

              {transaction.payment?.payment_url && transaction.payment_status === "pending" && (
                <a
                  href={transaction.payment.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-ocean-500 text-smoke-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-ocean-600 transition-colors"
                >
                  <OpenInNewRounded fontSize="small" /> Pay Now
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Transaction Logs */}
        {transaction.logs && transaction.logs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center text-ocean-500">
                <AccessTimeRounded />
              </div>
              <h3 className="text-sm font-black text-brand-500 dark:text-smoke-200 uppercase tracking-widest">Activity Log</h3>
            </div>
            <div className="space-y-4 relative before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-0.5 before:bg-brand-500/5">
              {transaction.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-lg bg-ocean-500/10 flex items-center justify-center text-ocean-500 shrink-0 z-10">
                    <CheckCircleRounded fontSize="small" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-500 dark:text-smoke-200">{log.description}</p>
                    <p className="text-[10px] text-brand-500/30 font-bold uppercase tracking-wider mt-0.5">{formatDateTime(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
            <div className="text-center py-8">
               <p className="text-sm text-brand-500/40 italic">No history available</p>
            </div>
        )}
      </div>
</>
  );
}

// Helper component
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-black text-brand-500/30 uppercase tracking-widest shrink-0 pt-1">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
