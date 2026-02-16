"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  date: string;
  revenue: number;
  count: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  color?: string;
  height?: number | string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  color = "#0EA5E9", // ocean-500
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl bg-smoke-200 text-sm font-medium text-brand-500/40"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });
            }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "#374151", fontSize: "14px", fontWeight: 500 }}
            labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
            formatter={(
              value: number | string | Array<number | string> | undefined,
            ) => {
              if (value === undefined) return ["", ""];
              const val = Number(value);
              return [`Rp ${val.toLocaleString("id-ID")}`, "Revenue"];
            }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
