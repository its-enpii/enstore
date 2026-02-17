"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Inventory2Rounded,
  DateRangeRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import { api, ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ProductsReport() {
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
        ENDPOINTS.admin.reports.products,
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
      toast.error(err.message || "Failed to load product report");
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
              <Inventory2Rounded className="text-ocean-500" /> Product
              Performance
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Top selling products and revenue analysis.
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
          </div>
        </div>

        {/* Charts Section */}
        {data.length > 0 && (
          <div className="rounded-xl border border-brand-500/5 bg-white p-6 dark:bg-brand-900/50">
            <h3 className="mb-6 text-lg font-bold text-brand-500/90">
              Top 10 Products by Volume
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="total_sales"
                    name="Sales"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    fill="#0ea5e9"
                  >
                    {data.slice(0, 10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 3 ? "#0ea5e9" : "#cbd5e1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">Loading report...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center">
              <Inventory2Rounded className="mb-4 text-6xl text-brand-500/10" />
              <h3 className="text-xl font-bold text-brand-500/90">
                No Sales Data
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
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Sold
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-4 pr-8 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {data.map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      className="group transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="font-bold text-brand-500/90">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-brand-500/5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-brand-500/50">
                          {item.digiflazz_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-brand-500/90">
                          {item.total_sales}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-brand-500/90">
                          Rp{" "}
                          {Number(item.total_revenue || 0).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <span className="font-bold text-emerald-500">
                          Rp{" "}
                          {Number(item.total_profit || 0).toLocaleString(
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
