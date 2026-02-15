"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import DataTable, { type TableColumn } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  HistoryRounded,
  NorthEastRounded,
  SouthWestRounded,
  FilterListRounded,
} from "@mui/icons-material";
import {
  getBalanceMutations,
  type BalanceMutation,
} from "@/lib/api";

export default function BalanceHistoryPage() {
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"" | "credit" | "debit">("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getBalanceMutations(100);
      if (res.success) setMutations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (s: string) => new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const filtered = typeFilter ? mutations.filter(m => m.type === typeFilter) : mutations;

  const columns: TableColumn<BalanceMutation>[] = [
    {
      key: "type",
      label: "Type",
      width: "80px",
      render: (row) => (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          row.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        }`}>
          {row.type === "credit" ? <SouthWestRounded fontSize="small" /> : <NorthEastRounded fontSize="small" />}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <div>
          <p className="text-sm font-bold text-brand-500 dark:text-smoke-200">{row.description}</p>
          {row.transaction && (
            <p className="text-[10px] text-ocean-500 font-bold mt-0.5">{row.transaction.transaction_code}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (row) => (
        <span className={`text-sm font-black ${row.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
          {row.type === "credit" ? "+" : "-"}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "balance_after",
      label: "Balance After",
      align: "right",
      render: (row) => (
        <span className="text-sm font-bold text-brand-500/60 dark:text-smoke-300">{formatCurrency(row.balance_after)}</span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      align: "right",
      render: (row) => (
        <div className="text-right">
          <p className="text-xs font-bold text-brand-500/60 dark:text-smoke-300">{formatDate(row.created_at)}</p>
          <p className="text-[10px] text-brand-500/30 font-bold">{formatTime(row.created_at)}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        <PageHeader
          title="Balance History"
          emoji="📊"
          description="Complete record of all balance mutations."
          breadcrumbs={[
            { label: "Dashboard", href: "/reseller/dashboard" },
            { label: "Balance", href: "/reseller/balance" },
            { label: "History" },
          ]}
        />

        {/* Filter */}
        <div className="flex gap-2">
          {(["", "credit", "debit"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                typeFilter === type
                  ? "bg-ocean-500 text-smoke-200"
                  : "bg-smoke-200 dark:bg-brand-800 text-brand-500/40 border border-brand-500/5 hover:text-brand-500"
              }`}
            >
              {type || "All"} {type === "credit" ? "↓" : type === "debit" ? "↑" : ""}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyIcon={<HistoryRounded fontSize="large" />}
          emptyTitle="No mutations found"
          emptyDescription="Balance mutations will appear after top-ups and purchases."
          rowKey={(row) => row.id}
        />
      </div>
  );
}
