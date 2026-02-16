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
import { Transaction } from "@/lib/api/types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// --- Types ---
// Local interfaces removed in favor of @/lib/api/types

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <span className="flex items-center gap-1 font-bold text-emerald-500">
          <CheckCircleRounded fontSize="small" /> Success
        </span>
      );
    case "pending":
      return (
        <span className="flex items-center gap-1 font-bold text-brand-500">
          <PendingRounded fontSize="small" /> Pending
        </span>
      );
    case "processing":
      return (
        <span className="flex items-center gap-1 font-bold text-blue-500">
          <PendingRounded className="animate-spin" fontSize="small" />{" "}
          Processing
        </span>
      );
    case "failed":
      return (
        <span className="flex items-center gap-1 font-bold text-red-500">
          <ErrorRounded fontSize="small" /> Failed
        </span>
      );
    case "refunded":
      return (
        <span className="flex items-center gap-1 font-bold text-purple-500">
          <CancelRounded fontSize="small" /> Refunded
        </span>
      );
    default:
      return (
        <span className="font-bold text-gray-500 uppercase">{status}</span>
      );
  }
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Transaction>(
        ENDPOINTS.admin.transactions.detail(transactionId),
        undefined,
        true,
      );
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

  const handleUpdateStatus = () => {
    if (!transaction || newStatus === transaction.status) return;
    setIsConfirmOpen(true);
  };

  const processUpdateStatus = async () => {
    setUpdating(true);
    try {
      const res = await api.put(
        ENDPOINTS.admin.transactions.updateStatus(transactionId),
        { status: newStatus },
        true,
      );
      if (res.success) {
        toast.success("Status transaksi diperbarui!");
        fetchTransaction();
        setIsConfirmOpen(false);
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
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) return null;

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <DashboardButton
            onClick={() => router.back()}
            variant="secondary"
            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:text-brand-500"
          >
            <ArrowBackRounded />
          </DashboardButton>
          <div>
            <h1 className="text-2xl font-bold text-brand-500">
              Transaction Detail
            </h1>
            <div className="flex items-center gap-2 font-mono font-bold text-brand-500/50">
              #{transaction.transaction_code}
              <button
                onClick={() =>
                  copyToClipboard(transaction?.transaction_code || "")
                }
                className="transition-colors hover:text-ocean-500"
              >
                <ContentCopyRounded style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Info */}
            <div className="space-y-4 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-500">
                <ReceiptLongRounded className="text-ocean-500" /> Item Details
              </h3>
              <div className="space-y-3">
                <div className="rounded-2xl border border-brand-500/5 bg-white p-4">
                  <p className="text-xs font-bold text-brand-500/40 uppercase">
                    Product Name
                  </p>
                  <p className="text-lg font-bold text-brand-500">
                    {transaction.product_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-brand-500/5 bg-white p-4">
                    <p className="text-xs font-bold text-brand-500/40 uppercase">
                      Price
                    </p>
                    <p className="font-bold text-brand-500">
                      Rp{" "}
                      {Number(transaction.product_price ?? 0).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-brand-500/5 bg-white p-4">
                    <p className="text-xs font-bold text-brand-500/40 uppercase">
                      Fee + Unique
                    </p>
                    <p className="font-bold text-brand-500">
                      Rp{" "}
                      {Number(transaction.admin_fee ?? 0).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-ocean-500 p-4 text-white">
                  <span className="font-bold opacity-80">Total Paid</span>
                  <span className="text-xl font-bold">
                    Rp{" "}
                    {Number(transaction.total_price ?? 0).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-500">
                <PersonRounded className="text-ocean-500" /> Customer Info
              </h3>
              <div className="space-y-2 rounded-2xl border border-brand-500/5 bg-white p-4">
                {transaction.user ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-brand-500/40">
                        Name
                      </span>
                      <span className="font-bold text-brand-500">
                        {transaction.user.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-brand-500/40">
                        Email
                      </span>
                      <span className="font-bold text-brand-500">
                        {transaction.user.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-brand-500/40">
                        Phone
                      </span>
                      <span className="font-bold text-brand-500">
                        {transaction.user.phone_number || "-"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="py-2 text-center font-bold text-brand-500/50 italic">
                    Guest Purchase (No Account)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Status & Actions */}
          <div className="space-y-6">
            <div className="space-y-6 rounded-[32px] border border-brand-500/10 bg-white p-6 shadow-lg shadow-brand-500/5">
              <div>
                <p className="mb-2 text-xs font-bold text-brand-500/40 uppercase">
                  Current Status
                </p>
                <div className="text-lg">
                  {getStatusBadge(transaction.status)}
                </div>
                <p className="mt-1 text-xs font-bold text-brand-500/40">
                  {new Date(transaction.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-4 mb-1 text-xs font-bold text-brand-500/40 uppercase">
                  Payment Method
                </p>
                <div className="flex items-center gap-2 font-bold text-brand-500">
                  <PaymentRounded className="text-ocean-500" fontSize="small" />
                  {transaction.payment_method}
                </div>
              </div>

              <div className="space-y-4 border-t border-brand-500/5 pt-4">
                <p className="text-xs font-bold text-brand-500/40 uppercase">
                  Update Status
                </p>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 text-brand-500 outline-none focus:ring-2 focus:ring-ocean-500/20"
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
              <div className="rounded-[32px] border border-yellow-500/20 bg-yellow-500/10 p-6">
                <p className="mb-2 text-xs font-bold text-yellow-700 uppercase">
                  Note / Error Log
                </p>
                <p className="font-mono text-sm break-all text-yellow-800">
                  {transaction.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={processUpdateStatus}
        title="Ubah Status Transaksi"
        message={`Apakah Anda yakin ingin mengubah status transaksi ini menjadi ${newStatus.toUpperCase()}?`}
        confirmLabel="Ya, Ubah Status"
        loading={updating}
        type={newStatus === "failed" ? "danger" : "info"}
      />
    </DashboardLayout>
  );
}
