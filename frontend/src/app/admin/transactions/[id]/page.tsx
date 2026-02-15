"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowBackRounded,
  ReceiptLongRounded,
  PersonRounded,
  PaymentRounded,
  CheckCircleRounded,
  PendingRounded,
  CancelRounded,
  ErrorRounded,
  ContentCopyRounded,
  SaveRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { api, ENDPOINTS } from "@/lib/api";

// --- Types ---
interface TransactionDetail {
  id: number;
  transaction_code: string;
  user_id: number;
  user?: {
    name: string;
    email: string;
    phone_number?: string;
  };
  product_name: string;
  product_id: number;
  product_item_id: number;
  payment_method: string;
  payment_status: string;
  status: string; // pending, success, failed, processing
  total_price: number;
  amount: number; // original price
  fee: number;
  unique_code: number;
  created_at: string;
  updated_at: string;
  note?: string;
  data?: any; // snap_token etc
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success": return <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircleRounded fontSize="small"/> Success</span>;
    case "pending": return <span className="text-brand-500 font-bold flex items-center gap-1"><PendingRounded fontSize="small"/> Pending</span>;
    case "processing": return <span className="text-blue-500 font-bold flex items-center gap-1"><PendingRounded className="animate-spin" fontSize="small"/> Processing</span>;
    case "failed": return <span className="text-red-500 font-bold flex items-center gap-1"><ErrorRounded fontSize="small"/> Failed</span>;
    case "refunded": return <span className="text-purple-500 font-bold flex items-center gap-1"><CancelRounded fontSize="small"/> Refunded</span>;
    default: return <span className="text-gray-500 font-bold uppercase">{status}</span>;
  }
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<TransactionDetail>(ENDPOINTS.admin.transactions.detail(transactionId), undefined, true);
      if (res.success) {
        setTransaction(res.data);
        setNewStatus(res.data.status);
      }
    } catch (err) {
      console.error("Fetch detail failed:", err);
      toast.error("Gagal memuat detail transaksi");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [transactionId, router]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleUpdateStatus = async () => {
    if (!transaction || newStatus === transaction.status) return;
    if (!confirm(`Ubah status transaksi menjadi ${newStatus.toUpperCase()}?`)) return;

    setUpdating(true);
    try {
      const res = await api.put(ENDPOINTS.admin.transactions.updateStatus(transactionId), { status: newStatus }, true);
      if (res.success) {
        toast.success("Status transaksi diperbarui!");
        fetchTransaction();
      }
    } catch (err: any) {
       toast.error(err.message || "Gagal update status");
    } finally {
       setUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (loading) {
     return (
        <DashboardLayout role="admin">
           <div className="h-96 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        </DashboardLayout>
     );
  }

  if (!transaction) return null;

  return (
    <DashboardLayout role="admin">
       <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
             <DashboardButton onClick={() => router.back()} variant="secondary" className="p-2 rounded-xl text-brand-500/40 hover:text-brand-500 transition-colors">
                <ArrowBackRounded />
             </DashboardButton>
             <div>
                <h1 className="text-2xl font-black text-brand-500">Transaction Detail</h1>
                <div className="flex items-center gap-2 text-brand-500/50 font-bold font-mono">
                    #{transaction.transaction_code}
                    <button onClick={() => copyToClipboard(transaction.transaction_code)} className="hover:text-ocean-500 transition-colors">
                        <ContentCopyRounded style={{ fontSize: 14 }} />
                    </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Left Column: Details */}
             <div className="lg:col-span-2 space-y-6">
                
                {/* Product Info */}
                <div className="bg-smoke-200 p-6 rounded-[32px] border border-brand-500/5 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-brand-500 flex items-center gap-2">
                        <ReceiptLongRounded className="text-ocean-500" /> Item Details
                    </h3>
                    <div className="space-y-3">
                         <div className="bg-white p-4 rounded-2xl border border-brand-500/5">
                             <p className="text-xs font-bold text-brand-500/40 uppercase">Product Name</p>
                             <p className="font-black text-brand-500 text-lg">{transaction.product_name}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-4 rounded-2xl border border-brand-500/5">
                                <p className="text-xs font-bold text-brand-500/40 uppercase">Price</p>
                                <p className="font-bold text-brand-500">Rp {transaction.amount.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-brand-500/5">
                                <p className="text-xs font-bold text-brand-500/40 uppercase">Fee + Unique</p>
                                <p className="font-bold text-brand-500">
                                    Rp {(transaction.fee + transaction.unique_code).toLocaleString('id-ID')}
                                </p>
                            </div>
                         </div>
                         <div className="bg-ocean-500 p-4 rounded-2xl text-white flex justify-between items-center">
                             <span className="font-bold opacity-80">Total Paid</span>
                             <span className="font-black text-xl">Rp {transaction.total_price.toLocaleString('id-ID')}</span>
                         </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="bg-smoke-200 p-6 rounded-[32px] border border-brand-500/5 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-brand-500 flex items-center gap-2">
                        <PersonRounded className="text-ocean-500" /> Customer Info
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-brand-500/5 space-y-2">
                         {transaction.user ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-brand-500/40 font-bold text-xs">Name</span>
                                    <span className="text-brand-500 font-bold">{transaction.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-brand-500/40 font-bold text-xs">Email</span>
                                    <span className="text-brand-500 font-bold">{transaction.user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-brand-500/40 font-bold text-xs">Phone</span>
                                    <span className="text-brand-500 font-bold">{transaction.user.phone_number || '-'}</span>
                                </div>
                            </>
                         ) : (
                             <p className="text-brand-500/50 italic font-bold text-center py-2">Guest Purchase (No Account)</p>
                         )}
                    </div>
                </div>
             </div>

             {/* Right Column: Status & Actions */}
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-brand-500/10 shadow-lg shadow-brand-500/5 space-y-6">
                    <div>
                        <p className="text-xs font-bold text-brand-500/40 uppercase mb-2">Current Status</p>
                        <div className="text-lg">{getStatusBadge(transaction.status)}</div>
                        <p className="text-xs font-bold text-brand-500/40 mt-1">
                            {new Date(transaction.created_at).toLocaleString("id-ID", { 
                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" 
                            })}
                        </p>
                        <p className="text-xs font-bold text-brand-500/40 uppercase mt-4 mb-1">Payment Method</p>
                        <div className="flex items-center gap-2 font-bold text-brand-500">
                             <PaymentRounded className="text-ocean-500" fontSize="small" />
                             {transaction.payment_method}
                        </div>
                    </div>

                    <div className="border-t border-brand-500/5 pt-4 space-y-4">
                        <p className="text-xs font-bold text-brand-500/40 uppercase">Update Status</p>
                        <div className="relative">
                            <select 
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 font-bold text-brand-500 outline-none focus:ring-2 focus:ring-ocean-500/20"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <DashboardButton 
                            onClick={handleUpdateStatus} 
                            loading={updating} 
                            disabled={updating || newStatus === transaction.status}
                            className="w-full"
                            icon={<SaveRounded />}
                        >
                            Update Status
                        </DashboardButton>
                    </div>
                </div>

                {transaction.note && (
                    <div className="bg-yellow-500/10 p-6 rounded-[32px] border border-yellow-500/20">
                        <p className="text-xs font-bold text-yellow-700 uppercase mb-2">Note / Error Log</p>
                        <p className="text-sm font-mono text-yellow-800 break-all">
                            {transaction.note}
                        </p>
                    </div>
                )}
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
