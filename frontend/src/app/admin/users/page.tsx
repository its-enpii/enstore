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

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(filters.page));
      params.append("per_page", String(filters.per_page));
      if (filters.search) params.append("search", filters.search);
      if (filters.customer_type) params.append("customer_type", filters.customer_type);
      
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

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      const res = await api.delete(ENDPOINTS.admin.users.delete(id), true);
      if (res.success) {
         toast.success("User dihapus");
         fetchUsers();
      }
    } catch (err: any) {
       toast.error(err.message || "Gagal hapus user");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-500">User Management 👥</h1>
            <p className="text-brand-500/50 mt-1 font-bold">Manage customers, resellers, and their balances.</p>
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
        <div className="bg-smoke-200 p-4 rounded-3xl border border-brand-500/5 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <SearchRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all font-bold text-brand-500 placeholder:text-brand-500/20"
            />
          </form>
          
          <div className="flex gap-3">
             {/* Replaced Role Filter with Customer Type Filter since we only show Customers */}
             <select 
               className="px-4 py-3 bg-white rounded-xl border border-brand-500/5 font-bold text-brand-500 outline-none"
               onChange={(e) => setFilters(prev => ({ ...prev, customer_type: e.target.value, page: 1 }))}
             >
                <option value="">All Types</option>
                <option value="retail">Retail</option>
                <option value="reseller">Reseller</option>
             </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-smoke-200 rounded-[32px] border border-brand-500/5 overflow-hidden shadow-sm">
          {loading ? (
             <div className="p-12 text-center">
                <div className="inline-block w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-500/40 font-bold">Loading users...</p>
             </div>
          ) : users.length === 0 ? (
             <div className="p-20 text-center">
                <GroupRounded className="text-brand-500/10 text-6xl mb-4" />
                <h3 className="text-xl font-bold text-brand-500">No Users Found</h3>
                <p className="text-brand-500/40 mt-1">Try adding a new user.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-500/5 border-b border-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest pl-8">User Details</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right">Balance</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {users.map((user) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={user.id} 
                      className="group hover:bg-white transition-colors cursor-default"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div>
                           <div className="font-bold text-brand-500">{user.name}</div>
                           <div className="text-xs text-brand-500/40">{user.email}</div>
                           {user.phone && <div className="text-xs text-brand-500/40">{user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                               <AdminPanelSettingsRounded style={{ fontSize: 14 }} /> Admin
                            </span>
                         ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-md">
                               <PersonRounded style={{ fontSize: 14 }} /> Customer
                            </span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                         <span className="font-bold text-sm text-brand-500/60 capitalize">{user.customer_type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="font-bold text-brand-500 flex items-center justify-end gap-1">
                            <AccountBalanceWalletRounded style={{ fontSize: 14 }} className="text-brand-500/30" />
                            <span>Rp {user.balance?.balance ? user.balance.balance.toLocaleString('id-ID') : '0'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            user.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                         }`}>
                            {user.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/users/${user.id}`}>
                            <button className="p-2 rounded-xl text-ocean-500 hover:bg-ocean-500/10 transition-colors" title="Edit / Detail">
                              <EditRounded fontSize="small" />
                            </button>
                          </Link>
                          {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors" 
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
            <div className="p-4 border-t border-brand-500/5 flex items-center justify-between">
               <p className="text-xs font-bold text-brand-500/40 pl-4">
                  Showing {meta.from}-{meta.to} of {meta.total} users
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
