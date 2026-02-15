"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
    PersonRounded, 
    EmailRounded, 
    PhoneRounded, 
    LockRounded, 
    SaveRounded 
} from "@mui/icons-material";

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get<any>(ENDPOINTS.auth.profile);
            if (res.success) {
                setUser(res.data);
                setFormData(prev => ({
                    ...prev,
                    name: res.data.name,
                    email: res.data.email,
                    phone: res.data.phone || ""
                }));
            }
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };

            if (formData.password) {
                if (formData.password !== formData.password_confirmation) {
                    toast.error("Password confirmation does not match");
                    setSaving(false);
                    return;
                }
                payload.password = formData.password;
            }

            // Admin updating themselves via User Management API
            const res = await api.put(ENDPOINTS.admin.users.update(user.id), payload);
            
            if (res.success) {
                toast.success("Profile updated successfully");
                setFormData(prev => ({ ...prev, password: "", password_confirmation: "" }));
                fetchProfile(); // Refresh data
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-500">Admin Profile 🛡️</h1>
                    <p className="text-brand-500/50 mt-1 font-bold">Manage your account information.</p>
                </div>

                <div className="bg-white rounded-[32px] border border-brand-500/5 p-8 shadow-sm">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-500/60 uppercase tracking-wide">Full Name</label>
                                    <div className="relative">
                                        <PersonRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-brand-500"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-500/60 uppercase tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <EmailRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-brand-500"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-500/60 uppercase tracking-wide">Phone Number</label>
                                    <div className="relative">
                                        <PhoneRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-brand-500"
                                            placeholder="Enter your phone"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-brand-500/5" />

                            <div className="space-y-4">
                                <h3 className="font-black text-brand-500 flex items-center gap-2">
                                    <LockRounded className="text-ocean-500" />
                                    Change Password
                                </h3>
                                <p className="text-sm text-brand-500/40 font-medium">Leave blank if you don't want to change password.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-500/60 uppercase tracking-wide">New Password</label>
                                        <input 
                                            type="password" 
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-brand-500"
                                            placeholder="New password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-500/60 uppercase tracking-wide">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-brand-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-4 bg-ocean-500 text-white font-bold rounded-xl hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <SaveRounded />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
