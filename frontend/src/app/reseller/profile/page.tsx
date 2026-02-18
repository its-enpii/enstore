"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardButton from "@/components/dashboard/DashboardButton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  LockRounded,
  SaveRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
  type CustomerProfile,
} from "@/lib/api";

function SettingsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"profile" | "password">("profile");

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Feedback
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync tab with URL
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "security" || t === "password") setTab("password");
    else if (t === "profile") setTab("profile");
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success) {
        setProfile(res.data);
        const [first, ...rest] = res.data.name.split(" ");
        setFirstName(first || "");
        setLastName(rest.join(" ") || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      setSaving(true);
      const res = await updateProfile({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
      });
      if (res.success) {
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        loadProfile();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (res.success) {
        setSuccessMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Failed to change password. Check your current password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        emoji="👤"
        description="Manage your reseller account information and security."
        breadcrumbs={[
          { label: "Dashboard", href: "/reseller/dashboard" },
          { label: "My Profile" },
        ]}
      />

      {/* Tab Switcher */}
      <div className="flex w-fit gap-2 rounded-2xl bg-smoke-200 p-1.5">
        {[
          {
            id: "profile",
            label: "Profile",
            icon: <PersonRounded fontSize="small" />,
          },
          {
            id: "password",
            label: "Security",
            icon: <LockRounded fontSize="small" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all ${
              tab === t.id
                ? "bg-ocean-500 text-smoke-200 shadow-lg shadow-ocean-500/20"
                : "text-brand-500/40 hover:bg-brand-500/5 hover:text-brand-500/90"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600"
          >
            <CheckCircleRounded fontSize="small" /> {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="animate-pulse space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-brand-500/5" />
          ))}
        </div>
      ) : tab === "profile" ? (
        <motion.form
          key="profile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleProfileSave}
          className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-7"
        >
          {/* Account Info */}
          <div className="flex items-center gap-4 border-b border-brand-500/5 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-500 text-2xl font-bold text-smoke-200">
              {firstName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="font-bold text-brand-500/90">
                {firstName} {lastName}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={profile?.status || "active"} />
                <StatusBadge
                  status="info"
                  label={profile?.customer_type || "reseller"}
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DashboardInput
              label="First Name"
              icon={<PersonRounded fontSize="small" />}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              fullWidth
            />
            <DashboardInput
              label="Last Name"
              icon={<PersonRounded fontSize="small" />}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              fullWidth
            />
          </div>
          <DashboardInput
            label="Email"
            icon={<EmailRounded fontSize="small" />}
            type="email"
            value={email}
            readOnly
            className="cursor-not-allowed bg-brand-500/5"
            helperText="Email cannot be changed."
            fullWidth
          />
          <DashboardInput
            label="Phone"
            icon={<PhoneRounded fontSize="small" />}
            type="tel"
            value={phone}
            readOnly
            className="cursor-not-allowed bg-brand-500/5"
            helperText="Phone number cannot be changed."
            fullWidth
          />

          <DashboardButton
            type="submit"
            variant="primary"
            disabled={saving}
            loading={saving}
            icon={<SaveRounded fontSize="small" />}
          >
            Save Details
          </DashboardButton>
        </motion.form>
      ) : (
        <motion.form
          key="password"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handlePasswordChange}
          className="max-w-xl space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-7"
        >
          <div className="flex items-center gap-3 border-b border-brand-500/5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500/90">
              <LockRounded />
            </div>
            <h3 className="text-sm font-bold tracking-widest text-brand-500/90 uppercase">
              Change Password
            </h3>
          </div>

          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          <DashboardButton
            type="submit"
            variant="primary"
            disabled={saving}
            loading={saving}
            icon={<LockRounded fontSize="small" />}
          >
            Update Password
          </DashboardButton>
        </motion.form>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <DashboardInput
      label={label}
      icon={<LockRounded fontSize="small" />}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="••••••••"
      fullWidth
      endIcon={
        show ? (
          <VisibilityOffRounded fontSize="small" />
        ) : (
          <VisibilityRounded fontSize="small" />
        )
      }
      onEndIconClick={onToggle}
    />
  );
}

export default function ResellerProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
