"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  SearchRounded,
  FilterListRounded,
  VisibilityRounded,
  ReceiptLongRounded,
  CheckCircleRounded,
  PendingRounded,
  CancelRounded,
  ErrorRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  ContentCopyRounded,
  SettingsBackupRestoreRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";

// --- Types ---
interface Transaction {
  id: number;
  transaction_code: string;
  user?: {
    name: string;
    email: string;
  };
  product_name: string;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  product_item?: {
    is_active: boolean;
  };
}

interface TransactionsResponse {
  current_page: number;
  data: Transaction[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// --- Icons Helper ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
          <CheckCircleRounded style={{ fontSize: 12 }} /> Success
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600">
          <PendingRounded style={{ fontSize: 12 }} /> Pending
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600">
          <PendingRounded style={{ fontSize: 12 }} className="animate-spin" />{" "}
          Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600">
          <ErrorRounded style={{ fontSize: 12 }} /> Failed
        </span>
      );
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600">
          <CancelRounded style={{ fontSize: 12 }} /> Refunded
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/20 bg-gray-500/10 px-2.5 py-0.5 text-xs font-bold text-gray-600">
          {status}
        </span>
      );
  }
};

export default function AdminTransactionsPage() {
  const router = useRouter();

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
    status: "",
  });

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(filters.page));
      params.append("per_page", String(filters.per_page));
      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);

      const endpoint = `${ENDPOINTS.admin.transactions.list}?${params.toString()}`;
      // Add generic type
      const res = await api.get<TransactionsResponse>(
        endpoint,
        undefined,
        true,
      );

      if (res.success) {
        setTransactions(res.data.data);
        setMeta({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
        });
      }
    } catch (err) {
      console.error("Fetch transactions failed:", err);
      toast.error("Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1, search: searchTerm }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters((prev) => ({ ...prev, page: 1, status: status }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (
      !confirm(`Are you sure you want to mark this transaction as ${status}?`)
    )
      return;

    try {
      const res = await api.put(
        ENDPOINTS.admin.transactions.updateStatus(id),
        { status },
        true,
      );
      if (res.success) {
        toast.success(`Transaction marked as ${status}`);
        fetchTransactions();
      } else {
        toast.error(res.message || "Failed to update transaction");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Transaction code copied!");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Transactions 🧾
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Monitor all purchases, topups, and refund requests.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-brand-500/5 bg-smoke-200 p-4 md:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <SearchRounded className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search by code, product, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 py-3 pr-4 pl-12 font-bold text-brand-500/90 transition-all outline-none placeholder:text-brand-500/20 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10"
            />
          </form>

          {/* Status Tabs (Desktop) */}
          <div className="hidden rounded-xl border border-brand-500/5 bg-smoke-200 p-1 md:flex">
            {["all", "pending", "success", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase transition-all ${
                  statusFilter === status
                    ? "bg-ocean-500 text-white shadow-lg shadow-ocean-500/20"
                    : "text-brand-500/40 hover:bg-brand-500/5 hover:text-brand-500/90"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Mobile Filter select */}
          <div className="md:hidden">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 font-bold text-brand-500/90 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">
                Loading transactions...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-20 text-center">
              <ReceiptLongRounded className="mb-4 text-6xl text-brand-500/10" />
              <h3 className="text-xl font-bold text-brand-500/90">
                No Transactions Found
              </h3>
              <p className="mt-1 text-brand-500/40">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="min-h-[400px] overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand-500/5 bg-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 pl-8 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Date & Code
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 pr-8 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {transactions.map((trx) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={trx.id}
                      className="group cursor-default transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div>
                          <div className="text-xs font-bold text-brand-500/90">
                            {new Date(trx.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="mt-1 inline-block rounded-md bg-brand-500/5 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-500/40">
                            {trx.transaction_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {trx.user ? (
                          <div>
                            <div className="text-sm font-bold text-brand-500/90">
                              {trx.user.name}
                            </div>
                            <div className="text-xs text-brand-500/40">
                              {trx.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-brand-500/40 italic">
                            Guest User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-[200px] truncate text-sm font-bold text-brand-500/90"
                          title={trx.product_name}
                        >
                          {trx.product_name}
                        </div>
                        <div className="text-xs text-brand-500/40 uppercase">
                          {trx.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-bold text-brand-500/90">
                          Rp {trx.total_price.toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(trx.status)}
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2 overflow-visible">
                          {/* Quick Actions for Pending/Processing */}
                          {(trx.status === "pending" ||
                            trx.status === "processing") && (
                            <div className="mr-2 flex items-center gap-1 rounded-xl border border-brand-500/5 bg-smoke-200 p-1 shadow-sm">
                              <button
                                onClick={() =>
                                  handleUpdateStatus(trx.id, "success")
                                }
                                className="rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-500/10"
                                title="Mark Success"
                              >
                                <CheckCircleRounded fontSize="small" />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(trx.id, "failed")
                                }
                                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                                title="Mark Failed"
                              >
                                <CancelRounded fontSize="small" />
                              </button>
                            </div>
                          )}

                          {/* Quick Action for Success (Refund) */}
                          {trx.status === "success" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(trx.id, "refunded")
                              }
                              className="rounded-xl border border-brand-500/5 bg-smoke-200 p-2 text-purple-500 shadow-sm transition-colors hover:bg-purple-500/10"
                              title="Process Refund"
                            >
                              <SettingsBackupRestoreRounded fontSize="small" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              copyToClipboard(trx.transaction_code)
                            }
                            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-brand-500/5 hover:text-brand-500/90"
                            title="Copy Code"
                          >
                            <ContentCopyRounded fontSize="small" />
                          </button>

                          <Link href={`/admin/transactions/${trx.id}`}>
                            <button
                              className="rounded-xl border border-brand-500/5 bg-smoke-200 p-2 text-ocean-500 shadow-sm transition-colors hover:bg-ocean-500/10"
                              title="View Detail"
                            >
                              <VisibilityRounded fontSize="small" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-brand-500/5 p-4">
              <p className="pl-4 text-xs font-bold text-brand-500/40">
                Showing {meta.from}-{meta.to} of {meta.total} transactions
              </p>
              <div className="flex gap-2 pr-4">
                <button
                  onClick={() => handlePageChange(meta.current_page - 1)}
                  disabled={meta.current_page === 1}
                  className="rounded-xl border border-brand-500/10 p-2 text-brand-500/90 transition-colors hover:bg-smoke-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeftRounded fontSize="small" />
                </button>
                <button
                  onClick={() => handlePageChange(meta.current_page + 1)}
                  disabled={meta.current_page === meta.last_page}
                  className="rounded-xl border border-brand-500/10 p-2 text-brand-500/90 transition-colors hover:bg-smoke-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRightRounded fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


