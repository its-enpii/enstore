"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getTransactionDetail, 
  getProfile,
  type CustomerTransaction,
  type CustomerProfile 
} from "@/lib/api";
import { 
  PrintRounded, 
  ArrowBackRounded, 
  FileDownloadRounded,
  CheckCircleRounded
} from "@mui/icons-material";
import { motion } from "motion/react";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [transaction, setTransaction] = useState<CustomerTransaction | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      loadData();
    }
  }, [code]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transRes, profRes] = await Promise.all([
        getTransactionDetail(code),
        getProfile()
      ]);

      if (transRes.success) setTransaction(transRes.data);
      if (profRes.success) setProfile(profRes.data);
    } catch (err) {
      console.error("Failed to load invoice data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-smoke-200 flex items-center justify-center p-8">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-10 bg-cloud-300 rounded-xl w-48 mx-auto" />
          <div className="h-[600px] bg-smoke-200 rounded-3xl shadow-sm border border-brand-500/5" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-smoke-200 flex flex-col items-center justify-center p-8">
        <p className="text-brand-500/40 font-bold mb-4">Invoice not found.</p>
        <button onClick={() => router.back()} className="text-ocean-500 font-bold flex items-center gap-2">
          <ArrowBackRounded fontSize="small" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smoke-200 print:bg-smoke-200 p-4 md:p-8">
      {/* Top Bar - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-500/60 hover:text-brand-500 transition-colors"
        >
          <ArrowBackRounded fontSize="small" /> Back to detail
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-smoke-200 rounded-xl text-xs font-black hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10"
          >
            <PrintRounded fontSize="small" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-smoke-200 rounded-[32px] shadow-2xl shadow-brand-500/5 border border-brand-500/5 overflow-hidden print:shadow-none print:border-0 print:rounded-none"
      >
        {/* Header */}
        <div className="bg-brand-500 p-8 md:p-12 text-smoke-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">INVOICE</h1>
            <p className="text-smoke-200/60 font-bold text-sm">{transaction.transaction_code}</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-xl font-black italic">En<span className="text-ocean-400">Store</span></h2>
            <p className="text-white/60 text-xs mt-1 font-medium">The Professional Standard for Top-Ups</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Info Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-brand-500/30">Billed To</h3>
              <div>
                <p className="font-black text-brand-500 text-lg">{profile?.name || "Customer"}</p>
                <p className="text-sm text-brand-500/60 mt-1 font-medium">{profile?.email}</p>
                <p className="text-sm text-brand-500/60 font-medium">{profile?.phone}</p>
              </div>
            </div>
            <div className="space-y-4 text-left md:text-right">
              <h3 className="text-[10px] font-black text-brand-500/30">Invoice Details</h3>
              <div className="space-y-1.5 font-medium text-sm">
                <p className="text-brand-500/60 font-bold">Date: <span className="text-brand-500 font-bold ml-2">{formatDate(transaction.created_at)}</span></p>
                <p className="text-brand-500/60 font-bold">Method: <span className="text-brand-500 font-bold ml-2">{transaction.payment_method}</span></p>
                <div className="flex justify-start md:justify-end gap-2 pt-2">
                   <StatusBadge status={transaction.status} size="sm" />
                   <StatusBadge status={transaction.payment_status} size="sm" label={transaction.payment_status} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-500/5">
                  <th className="pb-4 text-[10px] font-black text-brand-500/30">Description</th>
                  <th className="pb-4 text-[10px] font-black text-brand-500/30 text-right">Price</th>
                  <th className="pb-4 text-[10px] font-black text-brand-500/30 text-right">Qty</th>
                  <th className="pb-4 text-[10px] font-black text-brand-500/30 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-500/5">
                <tr>
                  <td className="py-6">
                    <p className="font-black text-brand-500">{transaction.product_name}</p>
                    <p className="text-xs text-brand-500/40 mt-1 font-bold">Code: {transaction.product_code || '-'}</p>
                    {transaction.customer_data && (
                       <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(transaction.customer_data).map(([k, v]) => (
                            <span key={k} className="px-2.5 py-1 bg-cloud-200 rounded-lg text-[10px] font-black text-brand-500/60 uppercase tracking-wider">
                              {k}: {v}
                            </span>
                          ))}
                       </div>
                    )}
                  </td>
                  <td className="py-6 text-right font-bold text-brand-500/60 text-sm whitespace-nowrap">{formatCurrency(transaction.product_price)}</td>
                  <td className="py-6 text-right font-bold text-brand-500/60 text-sm whitespace-nowrap">1</td>
                  <td className="py-6 text-right font-black text-brand-500 text-sm whitespace-nowrap">{formatCurrency(transaction.product_price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end pt-8 border-t border-brand-500/5">
            <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-brand-500/40">Subtotal</span>
                <span className="font-bold text-brand-500/60">{formatCurrency(transaction.product_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-brand-500/40">Admin Fee</span>
                <span className="font-bold text-brand-500/60">{formatCurrency(transaction.admin_fee)}</span>
              </div>
              <div className="pt-4 border-t border-brand-500/5 flex justify-between">
                <span className="text-lg font-black text-brand-500">Total Price</span>
                <span className="text-xl font-black text-ocean-500">{formatCurrency(transaction.total_price)}</span>
              </div>
            </div>
          </div>

          {/* SN Note if transaction is success */}
          {transaction.status === 'success' && transaction.sn && (
             <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                   <CheckCircleRounded />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Serial Number / Voucher Code</p>
                  <p className="text-lg font-black text-emerald-600 break-all">{transaction.sn}</p>
                </div>
             </div>
          )}

          {/* Footer */}
          <div className="pt-12 border-t border-brand-500/5 text-center sm:text-left">
            <h4 className="text-sm font-black text-brand-500 mb-2">Thank you for your business!</h4>
            <p className="text-xs text-brand-500/40 font-medium max-w-lg leading-relaxed">
              If you have any questions about this invoice, please contact our support team. 
              This is a computer generated invoice and does not require a physical signature.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            padding: 0 !important;
            margin: 0 !important;
            background: #f9f9f9 !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
