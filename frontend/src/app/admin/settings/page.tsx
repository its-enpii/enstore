"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardInput from "@/components/dashboard/DashboardInput";
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

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

        if (settingsMap.site_logo) {
          setLogoPreview(settingsMap.site_logo);
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      const promises = Object.entries(generalSettings).map(([key, value]) => {
        // Special handling for site_logo with file
        if (key === "site_logo" && logoFile) {
          const formData = new FormData();
          formData.append("key", key);
          formData.append("value", logoFile);
          formData.append("type", "image");
          formData.append("group", "general");
          return api.upload(
            ENDPOINTS.admin.settings.create,
            formData,
            "POST",
            true,
          );
        }

        // Standard string value
        return api.post(
          ENDPOINTS.admin.settings.create,
          {
            key,
            value,
            type: "string",
            group: "general",
          },
          true,
        );
      });

      const results = await Promise.all(promises);
      if (results.every((r) => r.success)) {
        toast.success("General settings updated");
        setLogoFile(null); // Reset file selection after success
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
            <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-500/90">
              <SettingsRounded className="text-ocean-500" /> Platform Settings
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Manage global application configurations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
          {/* Profit Margins Card */}
          <div className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-brand-500/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-smoke-200 text-brand-500/90 shadow-sm">
                <MonetizationOnRounded className="text-ocean-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-500/90">
                  Global Profit Margins
                </h3>
                <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                  Default markup percentage
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <DashboardInput
                  label="Retail Margin (%)"
                  type="number"
                  value={profitMargins.retail_margin}
                  onChange={(e) =>
                    setProfitMargins({
                      ...profitMargins,
                      retail_margin: parseFloat(e.target.value),
                    })
                  }
                  icon={<PercentRounded fontSize="small" />}
                  min="0"
                  step="0.1"
                />

                <DashboardInput
                  label="Reseller Margin (%)"
                  type="number"
                  value={profitMargins.reseller_margin}
                  onChange={(e) =>
                    setProfitMargins({
                      ...profitMargins,
                      reseller_margin: parseFloat(e.target.value),
                    })
                  }
                  icon={<PercentRounded fontSize="small" />}
                  min="0"
                  step="0.1"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-bold text-white transition-all hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="space-y-6 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-brand-500/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-smoke-200 text-brand-500/90 shadow-sm">
                <SettingsRounded className="text-ocean-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-500/90">
                  General Configuration
                </h3>
                <p className="text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                  Site naming & branding
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="space-y-4">
                <DashboardInput
                  label="Site Name"
                  type="text"
                  value={generalSettings.site_name}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      site_name: e.target.value,
                    })
                  }
                  icon={<LanguageRounded fontSize="small" />}
                  placeholder="EnStore"
                  fullWidth
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DashboardInput
                    label="Support Email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        support_email: e.target.value,
                      })
                    }
                    icon={<EmailRounded fontSize="small" />}
                    placeholder="support@mail.com"
                    fullWidth
                  />
                  <DashboardInput
                    label="WhatsApp Number"
                    type="text"
                    value={generalSettings.support_whatsapp}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        support_whatsapp: e.target.value,
                      })
                    }
                    icon={<PhoneRounded fontSize="small" />}
                    placeholder="081234..."
                    fullWidth
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Site Logo
                  </label>
                  <div className="flex flex-col gap-4">
                    {logoPreview && (
                      <div className="group relative h-20 w-48 overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-300 shadow-inner">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-brand-500/20 bg-brand-500/5 px-4 py-3 text-sm font-bold text-brand-500/90 transition-all hover:border-ocean-500/30 hover:bg-smoke-200"
                      >
                        <LinkRounded
                          fontSize="small"
                          className="text-ocean-500"
                        />
                        {logoFile ? logoFile.name : "Select New Logo File"}
                      </label>
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
