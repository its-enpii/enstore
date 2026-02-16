"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  SearchRounded,
  PersonAddRounded,
  GroupRounded,
  AdminPanelSettingsRounded,
  PersonRounded,
  AccountBalanceWalletRounded,
  EditRounded,
  DeleteRounded,
  BlockRounded,
  CheckCircleRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { api, ENDPOINTS } from "@/lib/api";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// --- Types ---
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  customer_type: string;
  status: string;
  balance?: {
    balance: number;
  };
  created_at: string;
}

interface UsersResponse {
  current_page: number;
  data: User[];
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

export default function AdminUsersPage() {
  const router = useRouter();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
    role: "",
    customer_type: "",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    loading: false,
  });

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(filters.page));
      params.append("per_page", String(filters.per_page));
      if (filters.search) params.append("search", filters.search);
      if (filters.customer_type)
        params.append("customer_type", filters.customer_type);

      // Default to customer role to hide admins, unless specific role requested
      params.append("role", filters.role || "customer");

      const endpoint = `${ENDPOINTS.admin.users.list}?${params.toString()}`;
      // Generic type
      const res = await api.get<UsersResponse>(endpoint, undefined, true);

      if (res.success) {
        setUsers(res.data.data);
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
      console.error("Fetch users failed:", err);
      toast.error("Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1, search: searchTerm }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = (id: number) => {
    setConfirmDelete({ isOpen: true, id, loading: false });
  };

  const processDelete = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.delete(
        ENDPOINTS.admin.users.delete(confirmDelete.id),
        true,
      );
      if (res.success) {
        toast.success("User dihapus");
        fetchUsers();
        setConfirmDelete({ isOpen: false, id: null, loading: false });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal hapus user");
    } finally {
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              User Management 👥
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Manage customers, resellers, and their balances.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/users/create">
              <DashboardButton icon={<PersonAddRounded />}>
                Add User
              </DashboardButton>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-brand-500/5 bg-smoke-200 p-4 md:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
            <SearchRounded className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 py-3 pr-4 pl-12 text-brand-500/90 transition-all outline-none placeholder:text-brand-500/20 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10"
            />
          </form>

          <div className="flex gap-3">
            {/* Replaced Role Filter with Customer Type Filter since we only show Customers */}
            <select
              className="rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 text-brand-500/90 outline-none"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  customer_type: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">All Types</option>
              <option value="retail">Retail</option>
              <option value="reseller">Reseller</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center">
              <GroupRounded className="mb-4 text-6xl text-brand-500/10" />
              <h3 className="text-xl font-bold text-brand-500/90">
                No Users Found
              </h3>
              <p className="mt-1 text-brand-500/40">Try adding a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand-500/5 bg-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 pl-8 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 pr-8 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {users.map((user) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={user.id}
                      className="group cursor-default transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div>
                          <div className="font-bold text-brand-500/90">
                            {user.name}
                          </div>
                          <div className="text-xs text-brand-500/40">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-brand-500/40">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600">
                            <AdminPanelSettingsRounded
                              style={{ fontSize: 14 }}
                            />{" "}
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-500/10 px-2 py-0.5 text-xs font-bold text-gray-500">
                            <PersonRounded style={{ fontSize: 14 }} /> Customer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-brand-500/60 capitalize">
                          {user.customer_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-brand-500/90">
                          <AccountBalanceWalletRounded
                            style={{ fontSize: 14 }}
                            className="text-brand-500/30"
                          />
                          <span>
                            Rp{" "}
                            {user.balance?.balance
                              ? user.balance.balance.toLocaleString("id-ID")
                              : "0"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            user.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Link href={`/admin/users/${user.id}`}>
                            <button
                              className="rounded-xl p-2 text-ocean-500 transition-colors hover:bg-ocean-500/10"
                              title="Edit / Detail"
                            >
                              <EditRounded fontSize="small" />
                            </button>
                          </Link>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-500/10"
                              title="Delete"
                            >
                              <DeleteRounded fontSize="small" />
                            </button>
                          )}
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
                Showing {meta.from}-{meta.to} of {meta.total} users
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

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={processDelete}
        title="Delete User"
        message="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus User"
        loading={confirmDelete.loading}
        type="danger"
      />
    </DashboardLayout>
  );
}
