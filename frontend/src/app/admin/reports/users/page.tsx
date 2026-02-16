"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  GroupRounded,
  DateRangeRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function UsersReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>(
        ENDPOINTS.admin.reports.users,
        {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
        true,
      );

      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load user report");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-500/90">
              <GroupRounded className="text-ocean-500" /> User Activity Report
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Top users by transaction volume and spending.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-brand-500/10 bg-smoke-200 px-3 py-2">
              <DateRangeRounded
                className="text-brand-500/40"
                fontSize="small"
              />
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-24 text-xs font-bold text-brand-500/90 outline-none"
              />
              <span className="font-bold text-brand-500/30">-</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-24 text-xs font-bold text-brand-500/90 outline-none"
              />
            </div>
            {/* Export button could be added here */}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">Loading report...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center">
              <GroupRounded className="mb-4 text-6xl text-brand-500/10" />
              <h3 className="text-xl font-bold text-brand-500/90">
                No Data Found
              </h3>
              <p className="mt-1 text-brand-500/40">
                Try adjusting the date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand-500/5 bg-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 pl-8 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Transactions
                    </th>
                    <th className="px-6 py-4 pr-8 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Total Spent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {data.map((user: any, idx: number) => (
                    <tr
                      key={idx}
                      className="group transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div>
                          <div className="font-bold text-brand-500/90">
                            {user.name}
                          </div>
                          <div className="text-xs text-brand-500/40">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-600 uppercase">
                          {user.customer_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-brand-500/90">
                          {user.total_transactions}
                        </span>
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <span className="font-bold text-ocean-500">
                          Rp{" "}
                          {Number(user.total_spent || 0).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
