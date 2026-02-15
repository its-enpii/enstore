"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  SaveRounded,
  SettingsRounded,
  MonetizationOnRounded,
  PercentRounded
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminSettings() {
  const [profitMargins, setProfitMargins] = useState({
    retail_margin: 0,
    reseller_margin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.admin.settings.profitMargins, undefined, true);
      if (res.success) {
        setProfitMargins({
          retail_margin: res.data.retail_margin || 0,
          reseller_margin: res.data.reseller_margin || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      // toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(ENDPOINTS.admin.settings.updateProfitMargins, profitMargins, true);
      if (res.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
         <div className="h-96 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-500 flex items-center gap-2">
              <SettingsRounded className="text-ocean-500" /> Platform Settings
            </h1>
            <p className="text-brand-500/50 mt-1 font-bold">Manage global application configurations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Profit Margins Card */}
           <div className="bg-smoke-200 p-8 rounded-[32px] border border-brand-500/5 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-brand-500/5">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-ocean-500 shadow-sm">
                    <MonetizationOnRounded />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-brand-500">Global Profit Margins</h3>
                    <p className="text-xs font-bold text-brand-500/40 uppercase tracking-widest">Default markup percentage</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold uppercase text-brand-500/50 mb-2">Retail Margin (%)</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={profitMargins.retail_margin}
                            onChange={(e) => setProfitMargins({...profitMargins, retail_margin: parseFloat(e.target.value)})}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-brand-500/5 font-bold text-brand-500 outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10 transition-all"
                            min="0"
                            step="0.1"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30">
                             <PercentRounded fontSize="small" />
                          </div>
                       </div>
                       <p className="mt-2 text-[10px] font-bold text-brand-500/30">Markup added to base price for regular customers.</p>
                    </div>

                    <div>
                       <label className="block text-xs font-bold uppercase text-brand-500/50 mb-2">Reseller Margin (%)</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={profitMargins.reseller_margin}
                            onChange={(e) => setProfitMargins({...profitMargins, reseller_margin: parseFloat(e.target.value)})}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-brand-500/5 font-bold text-brand-500 outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10 transition-all"
                            min="0"
                            step="0.1"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30">
                             <PercentRounded fontSize="small" />
                          </div>
                       </div>
                       <p className="mt-2 text-[10px] font-bold text-brand-500/30">Markup added to base price for resellers.</p>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={saving}
                   className="w-full bg-ocean-500 text-white font-bold py-3 rounded-xl hover:bg-ocean-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {saving ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                       <>
                          <SaveRounded fontSize="small" /> Save Changes
                       </>
                    )}
                 </button>
              </form>
           </div>

           {/* Other Settings Placeholder */}
           <div className="bg-smoke-200 p-8 rounded-[32px] border border-brand-500/5 space-y-6 opacity-50 pointer-events-none grayscale">
              <div className="flex items-center gap-4 pb-6 border-b border-brand-500/5">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-500 shadow-sm">
                    <SettingsRounded />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-brand-500">General Configuration</h3>
                    <p className="text-xs font-bold text-brand-500/40 uppercase tracking-widest">Coming Soon</p>
                 </div>
              </div>
              <div className="h-40 flex items-center justify-center">
                 <p className="text-brand-500/30 font-bold uppercase tracking-widest text-xs">More settings in development</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
