"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowBackRounded,
  SaveRounded,
  PersonAddRounded,
  EmailRounded,
  PhoneRounded,
  LockRounded,
  BadgeRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
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
              <DashboardInput
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                icon={<BadgeRounded />}
              />
            </div>
            <div className="space-y-2">
              <DashboardInput
                fullWidth
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                icon={<EmailRounded />}
              />
            </div>
            <div className="space-y-2">
              <DashboardInput
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="08123456789"
                icon={<PhoneRounded />}
              />
            </div>
            <div className="space-y-2">
              <DashboardInput
                fullWidth
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
                minLength={8}
                icon={<LockRounded />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
            <div className="space-y-2">
              <DashboardSelect
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: "customer", label: "Customer" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </div>

            {formData.role === "customer" && (
              <div className="space-y-2">
                <DashboardSelect
                  fullWidth
                  label="Customer Type"
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  options={[
                    { value: "retail", label: "Retail" },
                    { value: "reseller", label: "Reseller" },
                  ]}
                />
              </div>
            )}

            <div className="space-y-2">
              <DashboardSelect
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "suspended", label: "Suspended" },
                ]}
              />
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
