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
} from "@/lib/api/customer";

function ProfileContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"details" | "security">("details");

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
    if (t === "security") setTab("security");
    else setTab("details");
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
        phone 
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
      setErrorMsg(err.message || "Failed to change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="space-y-8">
        <PageHeader
          title="My Profile"
          emoji="👤"
          description="Manage your account information and security."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Profile" },
          ]}
        />

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 bg-smoke-200 dark:bg-brand-800 rounded-2xl w-fit">
          {[
            { id: "details", label: "Details", icon: <PersonRounded fontSize="small" /> },
            { id: "security", label: "Security", icon: <LockRounded fontSize="small" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                tab === t.id
                  ? "bg-ocean-500 text-smoke-200 shadow-lg shadow-ocean-500/20"
                  : "text-brand-500/40 hover:text-brand-500/90 hover:bg-brand-500/5"
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
              className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-bold p-4 rounded-2xl"
            >
              <CheckCircleRounded fontSize="small" /> {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold p-4 rounded-2xl"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-8 animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-brand-500/5 rounded-2xl" />
            ))}
          </div>
        ) : tab === "details" ? (
          <motion.form
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleProfileSave}
            className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-7 space-y-6"
          >
            {/* Account Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-brand-500/5">
              <div className="w-16 h-16 rounded-2xl bg-ocean-500 text-smoke-200 flex items-center justify-center text-2xl font-bold">
                {firstName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-bold text-brand-500/90 dark:text-smoke-200">{firstName} {lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={profile?.status || "active"} />
                  <StatusBadge status="neutral" label={profile?.customer_type || "Retail"} />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="bg-brand-500/5 cursor-not-allowed"
              helperText="Email cannot be changed."
              fullWidth
            />
            <DashboardInput
              label="Phone"
              icon={<PhoneRounded fontSize="small" />}
              type="tel"
              value={phone}
              readOnly
              className="bg-brand-500/5 cursor-not-allowed"
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
            key="security"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handlePasswordChange}
            className="bg-smoke-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 p-7 space-y-6 max-w-xl"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-brand-500/5">
              <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500/90">
                <LockRounded />
              </div>
              <h3 className="text-sm font-bold text-brand-500/90 dark:text-smoke-200 uppercase tracking-widest">
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
      endIcon={show ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
      onEndIconClick={onToggle}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
