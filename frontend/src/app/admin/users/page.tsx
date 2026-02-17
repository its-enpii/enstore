"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  SearchRounded,
  FilterListRounded,
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
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import { api, ENDPOINTS } from "@/lib/api";
import { User, LaravelPagination } from "@/lib/api/types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// --- Types ---
// --- Types ---
// Local interfaces removed in favor of @/lib/api/types

export default function AdminUsersPage() {
  const router = useRouter();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<LaravelPagination<User> | null>(
    null,
  );
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
      // Use params object
      const res = await api.get<LaravelPagination<User>>(
        ENDPOINTS.admin.users.list,
        {
          page: filters.page,
          per_page: filters.per_page,
          search: filters.search,
          customer_type: filters.customer_type,
          role: filters.role || "customer",
        },
        true,
      );

      if (res.success) {
        setUsers(res.data.data || []);
        setPagination(res.data);
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

        {/* Filters */}
        <div className="flex flex-col gap-6 rounded-2xl border border-brand-500/5 bg-smoke-200 p-5 md:flex-row">
          <form onSubmit={handleSearch} className="flex-1">
            <DashboardInput
              fullWidth
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<SearchRounded />}
            />
          </form>

          <div className="flex gap-3">
            <DashboardSelect
              className="w-48"
              value={filters.customer_type}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  customer_type: e.target.value,
                  page: 1,
                }))
              }
              options={[
                { value: "", label: "All Types" },
                { value: "retail", label: "Retail" },
                { value: "reseller", label: "Reseller" },
              ]}
              icon={<FilterListRounded fontSize="small" />}
            />
          </div>
        </div>

        {/* Users Table (Data Container) */}
        <div className="overflow-hidden rounded-2xl border border-brand-500/5 bg-smoke-200 shadow-sm">
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
                            {typeof user.balance === "number"
                              ? user.balance.toLocaleString("id-ID")
                              : user.balance?.balance.toLocaleString("id-ID") ||
                                "0"}
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
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-brand-500/5 p-4">
              <p className="pl-4 text-xs font-bold text-brand-500/40">
                Showing {pagination.from}-{pagination.to} of {pagination.total}{" "}
                users
              </p>
              <div className="flex gap-2 pr-4">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="rounded-xl border border-brand-500/10 p-2 text-brand-500/90 transition-colors hover:bg-smoke-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeftRounded fontSize="small" />
                </button>
                {[...Array(pagination.last_page).keys()].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`h-8 w-8 rounded-xl border text-xs font-bold transition-colors ${
                      pagination.current_page === idx + 1
                        ? "border-ocean-500 bg-ocean-500 text-white"
                        : "border-transparent bg-transparent text-brand-500/60 hover:bg-smoke-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
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
