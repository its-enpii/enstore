"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  HistoryRounded,
  SearchRounded,
  DeleteSweepRounded,
  FilterListRounded,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
    search: "",
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [params.page, params.search]); // Use params directly in useEffect

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(
        ENDPOINTS.admin.activityLogs.list,
        params,
        true,
      );
      if (res.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const cleanLogs = () => {
    setIsConfirmOpen(true);
  };

  const processCleanLogs = async () => {
    setIsConfirmOpen(false);
    setCleaning(true);
    try {
      const res = await api.post(
        ENDPOINTS.admin.activityLogs.clean,
        { days: 30 },
        true,
      );
      if (res.success) {
        toast.success("Logs cleaned successfully");
        fetchLogs();
      } else {
        toast.error("Failed to clean logs");
      }
    } catch (err) {
      console.error("Failed to clean logs:", err);
      toast.error("Failed to clean logs");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-500/90">
              <HistoryRounded className="text-ocean-500" /> Activity Logs
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Monitor admin and system activities.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cleanLogs}
              disabled={cleaning}
              className="group flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 font-bold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <DeleteSweepRounded
                fontSize="small"
                className="transition-transform group-hover:scale-110"
              />
              {cleaning ? "Cleaning..." : "Clean Old Logs"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-500/5 bg-smoke-200 p-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search logs..."
              value={params.search}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              className="w-full rounded-xl border border-transparent bg-smoke-200 py-2.5 pr-4 pl-10 text-sm text-brand-500/90 transition-all outline-none focus:border-ocean-500/20 focus:ring-4 focus:ring-ocean-500/5"
            />
            <SearchRounded
              className="absolute top-1/2 left-3 -translate-y-1/2 text-brand-500/30"
              fontSize="small"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-transparent bg-smoke-200 px-4 py-2 text-xs font-bold tracking-widest text-brand-500/60 uppercase transition-all hover:border-brand-500/5 hover:text-ocean-500">
              <FilterListRounded fontSize="small" /> Filters
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-500/5 text-left">
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-500/5">
                {logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr
                      key={log.id}
                      className="group transition-colors hover:bg-smoke-200/50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-brand-500/70 opacity-0 transition-opacity group-hover:opacity-100">
                          {new Date(log.created_at).toLocaleDateString("id-ID")}
                        </p>
                        <p className="text-sm font-bold text-brand-500/90">
                          {new Date(log.created_at).toLocaleTimeString("id-ID")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg bg-ocean-500/10 px-2 py-1 text-[10px] font-bold tracking-widest text-ocean-500 uppercase`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-[10px] font-bold text-brand-500/90">
                            {log.user?.name?.charAt(0) || "?"}
                          </div>
                          <p className="text-sm font-bold text-brand-500/90">
                            {log.user?.name || "System"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="max-w-[200px] truncate text-xs font-medium text-brand-500/70"
                          title={log.description}
                        >
                          {log.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-bold text-brand-500/40 opacity-0 transition-opacity group-hover:opacity-100">
                          {log.ip_address || "-"}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm font-bold tracking-widest text-brand-500/40 uppercase"
                    >
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={processCleanLogs}
        title="Clean Activity Logs"
        message="Are you sure? This will permanently delete logs older than 30 days. This action cannot be undone."
        confirmLabel="Clean Logs"
        loading={cleaning}
        type="danger"
      />
    </DashboardLayout>
  );
}
