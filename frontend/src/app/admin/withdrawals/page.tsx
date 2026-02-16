"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  AccountBalanceRounded,
  SearchRounded,
  FilterListRounded,
  CheckCircleRounded,
  CancelRounded,
  VisibilityRounded,
  PendingRounded,
  MoreVertRounded,
  MonetizationOnRounded,
  PersonRounded,
  NumbersRounded,
  CalendarTodayRounded,
  CloseRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

import DataTable from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import { api, ENDPOINTS } from "@/lib/api";

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
  });

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, [filters]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: filters.page.toString(),
      }).toString();

      const res = await api.get(
        ENDPOINTS.admin.withdrawals.list + `?${query}`,
        undefined,
        true,
      );
      if (res.success) {
        const resData = res.data as any;
        setData(resData.data);
        setPagination({
          current_page: resData.current_page,
          last_page: resData.last_page,
          total: resData.total,
        });
      }
    } catch (err) {
      toast.error("Gagal mengambil data penarikan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedWithdrawal) return;

    setUpdating(true);
    try {
      const res = await api.put(
        ENDPOINTS.admin.withdrawals.updateStatus(selectedWithdrawal.id),
        { status, admin_note: adminNote },
        true,
      );

      if (res.success) {
        toast.success(`Status berhasil diperbarui ke ${status}`);
        setSelectedWithdrawal(null);
        setAdminNote("");
        fetchWithdrawals();
      } else {
        toast.error(res.message || "Gagal memperbarui status");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      key: "reference_id",
      label: "REF ID",
      render: (val: string) => (
        <span className="font-bold text-brand-500/90">{val}</span>
      ),
    },
    {
      key: "user",
      label: "USER",
      render: (user: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-500/90">
            {user?.name}
          </span>
          <span className="text-[10px] tracking-tighter text-brand-500/40 uppercase">
            {user?.email}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (val: string) => (
        <span className="font-bold text-ocean-500">
          Rp {parseFloat(val ?? "0").toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "payment_method",
      label: "METHOD",
      render: (val: string) => (
        <span className="text-xs font-bold text-brand-500/60 uppercase">
          {val}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (val: string) => (
        <StatusBadge
          status={
            val === "completed"
              ? "success"
              : val === "rejected"
                ? "danger"
                : "warning"
          }
          label={val.toUpperCase()}
        />
      ),
    },
    {
      key: "created_at",
      label: "DATE",
      render: (val: string) => (
        <span className="text-xs font-bold text-brand-500/30">
          {new Date(val).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, item: any) => (
        <DashboardButton
          variant="secondary"
          size="sm"
          icon={<VisibilityRounded sx={{ fontSize: 16 }} />}
          onClick={() => {
            setSelectedWithdrawal(item);
            setAdminNote(item.admin_note || "");
          }}
        >
          Detail
        </DashboardButton>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <PageHeader
          title="Withdrawal Requests"
          emoji="💸"
          description="Review and process user withdrawal requests."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Withdrawals" },
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
          <div className="min-w-[300px] flex-1">
            <DashboardInput
              placeholder="Search by User or Ref ID..."
              icon={<SearchRounded />}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="w-48">
            <DashboardSelect
              options={[
                { value: "", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "completed", label: "Completed" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              icon={<FilterListRounded />}
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWithdrawal(null)}
              className="absolute inset-0 bg-brand-500/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-xl bg-smoke-200 shadow-2xl"
            >
              <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-500/10 text-ocean-500">
                      <VisibilityRounded />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-500/90">
                        Withdrawal Detail
                      </h3>
                      <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                        {selectedWithdrawal.reference_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWithdrawal(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-smoke-200 text-brand-500/40 transition-all hover:bg-brand-500/5 hover:text-brand-500/90"
                  >
                    <CloseRounded />
                  </button>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <PersonRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          User
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {selectedWithdrawal.user?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AccountBalanceRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          Bank / E-Wallet
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {selectedWithdrawal.payment_method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <NumbersRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          Account Number
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {selectedWithdrawal.account_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MonetizationOnRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          Amount
                        </p>
                        <p className="text-sm font-bold text-ocean-500">
                          Rp{" "}
                          {parseFloat(
                            selectedWithdrawal.amount ?? "0",
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PersonRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          Account Name
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {selectedWithdrawal.account_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarTodayRounded
                        className="mt-1 text-brand-500/20"
                        sx={{ fontSize: 18 }}
                      />
                      <div>
                        <p className="text-[10px] font-medium tracking-tighter text-brand-500/30 uppercase">
                          Date Requested
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {new Date(
                            selectedWithdrawal.created_at,
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <DashboardInput
                    label="Admin Note"
                    placeholder="Add a note or reason for rejection..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    fullWidth
                  />
                </div>

                {selectedWithdrawal.status === "pending" && (
                  <div className="flex gap-4">
                    <DashboardButton
                      variant="secondary"
                      fullWidth
                      className="border-red-100 bg-red-50 text-red-600 hover:border-red-200! hover:bg-red-100!"
                      icon={<CancelRounded />}
                      disabled={updating}
                      onClick={() => handleUpdateStatus("rejected")}
                    >
                      Reject
                    </DashboardButton>
                    <DashboardButton
                      variant="primary"
                      fullWidth
                      icon={<CheckCircleRounded />}
                      disabled={updating}
                      onClick={() => handleUpdateStatus("completed")}
                    >
                      Approve & Complete
                    </DashboardButton>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
