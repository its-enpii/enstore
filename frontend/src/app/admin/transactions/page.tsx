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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
           <CheckCircleRounded style={{ fontSize: 12 }} /> Success
        </span>
      );
    case "pending": 
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20">
           <PendingRounded style={{ fontSize: 12 }} /> Pending
        </span>
      );
    case "processing": 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
             <PendingRounded style={{ fontSize: 12 }} className="animate-spin" /> Processing
          </span>
        );
    case "failed": 
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
           <ErrorRounded style={{ fontSize: 12 }} /> Failed
        </span>
      );
    case "refunded": 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
             <CancelRounded style={{ fontSize: 12 }} /> Refunded
          </span>
        );
    default: 
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20">
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
      if (filters.status && filters.status !== "all") params.append("status", filters.status);

      const endpoint = `${ENDPOINTS.admin.transactions.list}?${params.toString()}`;
      // Add generic type
      const res = await api.get<TransactionsResponse>(endpoint, undefined, true);

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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-500">Transactions 🧾</h1>
            <p className="text-brand-500/50 mt-1 font-bold">Monitor all purchases, topups, and refund requests.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-smoke-200 p-4 rounded-3xl border border-brand-500/5 flex flex-col md:flex-row gap-4">
           {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <SearchRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search by code, product, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all font-bold text-brand-500 placeholder:text-brand-500/20"
            />
          </form>
          
          {/* Status Tabs (Desktop) */}
          <div className="hidden md:flex bg-white p-1 rounded-xl border border-brand-500/5">
             {['all', 'pending', 'success', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                     statusFilter === status 
                     ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' 
                     : 'text-brand-500/40 hover:text-brand-500 hover:bg-brand-500/5'
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
               className="w-full px-4 py-3 bg-white rounded-xl border border-brand-500/5 font-bold text-brand-500 outline-none"
             >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
             </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-smoke-200 rounded-[32px] border border-brand-500/5 overflow-hidden shadow-sm">
          {loading ? (
             <div className="p-12 text-center">
                <div className="inline-block w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-500/40 font-bold">Loading transactions...</p>
             </div>
          ) : transactions.length === 0 ? (
             <div className="p-20 text-center">
                <ReceiptLongRounded className="text-brand-500/10 text-6xl mb-4" />
                <h3 className="text-xl font-bold text-brand-500">No Transactions Found</h3>
                <p className="text-brand-500/40 mt-1">Try adjusting your filters.</p>
             </div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full">
                <thead className="bg-brand-500/5 border-b border-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest pl-8">Date & Code</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {transactions.map((trx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={trx.id} 
                      className="group hover:bg-white transition-colors cursor-default"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div>
                           <div className="font-bold text-brand-500 text-xs">
                              {new Date(trx.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                           </div>
                           <div className="text-[10px] bg-brand-500/5 text-brand-500/40 px-2 py-0.5 rounded-md inline-block mt-1 font-bold font-mono">
                               {trx.transaction_code}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {trx.user ? (
                            <div>
                               <div className="font-bold text-brand-500 text-sm">{trx.user.name}</div>
                               <div className="text-xs text-brand-500/40">{trx.user.email}</div>
                            </div>
                         ) : (
                            <span className="text-xs font-bold text-brand-500/40 italic">Guest User</span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-bold text-brand-500 text-sm max-w-[200px] truncate" title={trx.product_name}>{trx.product_name}</div>
                         <div className="text-xs text-brand-500/40 uppercase">{trx.payment_method}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="font-black text-brand-500 text-sm">
                            Rp {trx.total_price.toLocaleString('id-ID')}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         {getStatusBadge(trx.status)}
                      </td>
                      <td className="px-6 py-4 text-right pr-8">
                         <Link href={`/admin/transactions/${trx.id}`}>
                            <button className="p-2 rounded-xl text-ocean-500 hover:bg-ocean-500/10 transition-colors bg-white border border-brand-500/5 shadow-sm">
                               <VisibilityRounded fontSize="small" />
                            </button>
                         </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-brand-500/5 flex items-center justify-between">
               <p className="text-xs font-bold text-brand-500/40 pl-4">
                  Showing {meta.from}-{meta.to} of {meta.total} transactions
               </p>
               <div className="flex gap-2 pr-4">
                  <button 
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                    className="p-2 rounded-xl border border-brand-500/10 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-brand-500"
                  >
                     <ChevronLeftRounded fontSize="small" />
                  </button>
                  <button 
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="p-2 rounded-xl border border-brand-500/10 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-brand-500"
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
