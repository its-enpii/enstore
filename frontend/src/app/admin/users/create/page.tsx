"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowBackRounded,
  SaveRounded,
  PersonAddRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import Input from "@/components/ui/Input";
import { api, ENDPOINTS } from "@/lib/api";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    customer_type: "retail",
    status: "active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(ENDPOINTS.admin.users.create, formData, true);
      if (res.success) {
        toast.success("User created successfully!");
        router.push("/admin/users");
      }
    } catch (err: any) {
      // Check for validation errors object
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error(err.message || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-smoke-200 hover:text-brand-500/90"
          >
            <ArrowBackRounded />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Add New User
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Create a new system user or customer.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Full Name
              </label>
              <Input
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Email Address
              </label>
              <Input
                fullWidth
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Phone Number
              </label>
              <Input
                fullWidth
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="08123456789"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Password
              </label>
              <Input
                fullWidth
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
                minLength={8}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 text-brand-500/90 outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.role === "customer" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-500/50 uppercase">
                  Customer Type
                </label>
                <div className="relative">
                  <select
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 text-brand-500/90 outline-none"
                  >
                    <option value="retail">Retail</option>
                    <option value="reseller">Reseller</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-500/50 uppercase">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-3 text-brand-500/90 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              loading={loading}
              disabled={loading}
            >
              Create User
            </DashboardButton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
