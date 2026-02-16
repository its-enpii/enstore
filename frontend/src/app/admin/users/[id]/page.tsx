"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowBackRounded,
  SaveRounded,
  PersonRounded,
  EmailRounded,
  BadgeRounded,
  LocalPhoneRounded,
  AdminPanelSettingsRounded,
  AccountBalanceWalletRounded,
  DeleteRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import Input from "@/components/ui/Input";
import { api, ENDPOINTS } from "@/lib/api";

interface UserDetail {
  id: number;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  balance: number;
  created_at: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize with empty strings
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Optional for update
    role: "retail",
    phone_number: "",
    balance: "0", // Treat balance as string in input to handle 0 well
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<UserDetail>(
        ENDPOINTS.admin.users.detail(userId),
        undefined,
        true,
      );
      if (res.success) {
        const user = res.data;
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          phone_number: user.phone_number || "",
          balance: user.balance.toString(),
        });
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      toast.error("Gagal memuat data user");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Prepare payload. Only include password if set.
    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone_number: formData.phone_number,
      balance: parseInt(formData.balance) || 0,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const res = await api.put(
        ENDPOINTS.admin.users.update(userId),
        payload,
        true,
      );
      if (res.success) {
        toast.success("User berhasil diupdate!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-white hover:text-brand-500"
          >
            <ArrowBackRounded />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">Edit User</h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Update user information and permissions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm"
          >
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500/90">
                <PersonRounded className="text-brand-500/20" /> Personal
                Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Full Name
                  </label>
                  <Input
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<BadgeRounded />}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Phone Number
                  </label>
                  <Input
                    fullWidth
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    icon={<LocalPhoneRounded />}
                    placeholder="0812..."
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500/90">
                <AdminPanelSettingsRounded className="text-brand-500/20" />{" "}
                Account Settings
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Email Address
                  </label>
                  <Input
                    fullWidth
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<EmailRounded />}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Password (Leave blank to keep)
                  </label>
                  <Input
                    fullWidth
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="New Password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-brand-500/5 bg-white px-4 py-3 text-brand-500/90 transition-all outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10"
                    >
                      <option value="retail">Retail User</option>
                      <option value="reseller">Reseller</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Wallet Balance (IDR)
                  </label>
                  <Input
                    fullWidth
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    icon={<AccountBalanceWalletRounded />}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-brand-500/5 pt-4">
              <DashboardButton
                variant="secondary"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                type="submit"
                icon={<SaveRounded />}
                loading={saving}
                disabled={saving}
              >
                Save Changes
              </DashboardButton>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
