"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import DataTable, { type TableColumn } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  ReceiptLongRounded,
  SearchRounded,
  FilterListRounded,
  ShoppingCartRounded,
} from "@mui/icons-material";
import Link from "next/link";
import {
  getTransactions,
  type CustomerTransaction,
  type TransactionFilters,
} from "@/lib/api";

export default function ResellerTransactions() {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [filters, setFilters] = useState<TransactionFilters>({ per_page: 15, page: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const cleanFilters: TransactionFilters = { ...filters };
      if (search) cleanFilters.search = search;
      if (statusFilter) cleanFilters.status = statusFilter;
      if (typeFilter) cleanFilters.type = typeFilter as any;

      const res = await getTransactions(cleanFilters);
      if (res.success) {
        setTransactions(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
          per_page: res.data.per_page,
        });
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, search, statusFilter, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (s: string) => new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const columns: TableColumn<CustomerTransaction>[] = [
    {
      key: "transaction_code",
      label: "Transaction",
      render: (row) => (
        <Link href={`/reseller/transactions/${row.transaction_code}`} className="group">
          <p className="text-sm font-bold text-brand-500 dark:text-smoke-200 group-hover:text-ocean-500 transition-colors">{row.transaction_code}</p>
          <p className="text-[10px] text-brand-500/30 font-bold mt-0.5">{formatDate(row.created_at)} • {formatTime(row.created_at)}</p>
        </Link>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      render: (row) => (
        <p className="text-sm font-bold text-brand-500 dark:text-smoke-300 truncate max-w-[200px]">{row.product_name}</p>
      ),
    },
    {
      key: "transaction_type",
      label: "Type",
      align: "center",
      render: (row) => (
        <StatusBadge status={row.transaction_type === "topup" ? "info" : "neutral"} label={row.transaction_type} />
      ),
    },
    {
      key: "total_price",
      label: "Amount",
      align: "right",
      render: (row) => (
        <span className="text-sm font-black text-brand-500 dark:text-smoke-200">{formatCurrency(row.total_price)}</span>
      ),
    },
    {
      key: "payment_method",
      label: "Payment",
      align: "center",
      render: (row) => (
        <span className="text-xs font-bold text-brand-500/50">{row.payment_method || row.payment?.payment_method || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "payment_status",
      label: "Payment",
      align: "center",
      render: (row) => <StatusBadge status={row.payment_status} />,
    },
  ];

  const statusOptions = ["", "pending", "processing", "success", "failed", "cancelled"];
  const typeOptions = ["", "purchase", "topup"];

  return (
    <DashboardLayout role="reseller">
      <div className="space-y-6">
        <PageHeader
          title="Transaction History"
          emoji="📋"
          description="View and track all your transactions."
          breadcrumbs={[
            { label: "Dashboard", href: "/reseller/dashboard" },
            { label: "Transactions" },
          ]}
        />

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <SearchRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" fontSize="small" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or product..."
              className="w-full pl-11 pr-4 py-3 bg-smoke-200 dark:bg-brand-800 border border-brand-500/5 rounded-2xl text-sm font-bold text-brand-500 placeholder:text-brand-500/30 focus:outline-none focus:border-ocean-500/30 transition-colors"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
            className="px-4 py-3 bg-smoke-200 dark:bg-brand-800 border border-brand-500/5 rounded-2xl text-xs font-black text-brand-500/60 focus:outline-none focus:border-ocean-500/30 transition-colors cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.filter(Boolean).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
            className="px-4 py-3 bg-smoke-200 dark:bg-brand-800 border border-brand-500/5 rounded-2xl text-xs font-black text-brand-500/60 focus:outline-none focus:border-ocean-500/30 transition-colors cursor-pointer"
          >
            <option value="">All Types</option>
            {typeOptions.filter(Boolean).map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
          emptyIcon={<ReceiptLongRounded fontSize="large" />}
          emptyTitle="No transactions found"
          emptyDescription="Your purchase and top-up history will appear here."
          rowKey={(row) => row.id}
        />
      </div>
    </DashboardLayout>
  );
}
