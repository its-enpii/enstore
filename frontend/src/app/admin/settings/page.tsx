"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  SaveRounded,
  SettingsRounded,
  MonetizationOnRounded,
  PercentRounded,
  LanguageRounded,
  EmailRounded,
  PhoneRounded,
  LinkRounded,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminSettings() {
  const [profitMargins, setProfitMargins] = useState({
    retail_margin: 0,
    reseller_margin: 0,
  });

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "EnStore",
    support_email: "support@enstore.com",
    support_whatsapp: "081234567890",
    site_logo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [marginRes, listRes] = await Promise.all([
        api.get(ENDPOINTS.admin.settings.profitMargins, undefined, true),
        api.get<any[]>(ENDPOINTS.admin.settings.list, undefined, true),
      ]);

      if (marginRes.success) {
        setProfitMargins({
          retail_margin: (marginRes.data as any).retail_margin || 0,
          reseller_margin: (marginRes.data as any).reseller_margin || 0,
        });
      }

      if (listRes.success) {
        const settingsMap: any = {};
        listRes.data.forEach((s: any) => {
          settingsMap[s.key] = s.value;
        });

        setGeneralSettings({
          site_name: settingsMap.site_name || "EnStore",
          support_email: settingsMap.support_email || "support@enstore.com",
          support_whatsapp: settingsMap.support_whatsapp || "081234567890",
          site_logo: settingsMap.site_logo || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(
        ENDPOINTS.admin.settings.updateProfitMargins,
        profitMargins,
        true,
      );
      if (res.success) {
        toast.success("Profit margins updated");
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      const promises = Object.entries(generalSettings).map(([key, value]) =>
        api.post(ENDPOINTS.admin.settings.create, { key, value }, true),
      );

      const results = await Promise.all(promises);
      if (results.every((r) => r.success)) {
        toast.success("General settings updated");
      } else {
        toast.error("Some settings failed to update");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSavingGeneral(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
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
            <h1 className="flex items-center gap-2 text-2xl font-black text-brand-500">
              <SettingsRounded className="text-ocean-500" /> Platform Settings
            </h1>
            <p className="mt-1 font-bold text-brand-500/50">
              Manage global application configurations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Profit Margins Card */}
          <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-brand-500/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ocean-500 shadow-sm">
                <MonetizationOnRounded />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-500">
                  Global Profit Margins
                </h3>
                <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                  Default markup percentage
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                    Retail Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profitMargins.retail_margin}
                      onChange={(e) =>
                        setProfitMargins({
                          ...profitMargins,
                          retail_margin: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                      min="0"
                      step="0.1"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                      <PercentRounded fontSize="small" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                    Reseller Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profitMargins.reseller_margin}
                      onChange={(e) =>
                        setProfitMargins({
                          ...profitMargins,
                          reseller_margin: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                      min="0"
                      step="0.1"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                      <PercentRounded fontSize="small" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-500 py-3 font-bold text-white transition-all hover:bg-ocean-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <SaveRounded fontSize="small" /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* General Settings Card */}
          <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-brand-500/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-sm">
                <SettingsRounded className="text-ocean-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-500">
                  General Configuration
                </h3>
                <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                  Site naming & branding
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                    Site Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalSettings.site_name}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          site_name: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                      placeholder="EnStore"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                      <LanguageRounded fontSize="small" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                      Support Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={generalSettings.support_email}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            support_email: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 text-xs font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                        placeholder="support@mail.com"
                      />
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                        <EmailRounded fontSize="small" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={generalSettings.support_whatsapp}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            support_whatsapp: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 text-xs font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                        placeholder="081234..."
                      />
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                        <PhoneRounded fontSize="small" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                    Logo URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalSettings.site_logo}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          site_logo: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-brand-500/5 bg-white py-3 pr-4 pl-12 font-bold text-brand-500 transition-all outline-none focus:border-ocean-500/30 focus:ring-4 focus:ring-ocean-500/10"
                      placeholder="https://..."
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30">
                      <LinkRounded fontSize="small" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingGeneral}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-bold text-white transition-all hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingGeneral ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <SaveRounded fontSize="small" /> Save Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
