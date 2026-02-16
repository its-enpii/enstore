"use client";

import React from "react";
import { motion } from "motion/react";

interface DataPoint {
  date: string;
  revenue: number;
  count: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  color = "#0EA5E9", // ocean-500
  height = 200,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs font-bold tracking-widest text-brand-500/20 uppercase">
        No chart data available
      </div>
    );
  }

  // Calculate scales
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 800; // Fixed internal coordinate system
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const minRevenue = 0;

  const getX = (index: number) =>
    margin.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (value: number) =>
    margin.top +
    chartHeight -
    ((value - minRevenue) / (maxRevenue - minRevenue)) * chartHeight;

  // Build path string
  const points = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`);
  const pathData = `M ${points.join(" L ")}`;

  // Area path
  const areaData = `${pathData} L ${getX(data.length - 1)},${margin.top + chartHeight} L ${getX(0)},${margin.top + chartHeight} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = margin.top + chartHeight - tick * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + chartWidth}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-brand-500/30 text-[10px] font-bold"
              >
                {Math.round(
                  (tick * (maxRevenue - minRevenue) + minRevenue) / 1000,
                )}
                k
              </text>
            </g>
          );
        })}

        {/* Area Gradient */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={areaData}
          fill="url(#chartGradient)"
        />

        {/* Line Path */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={pathData}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {data.map((d, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + (i / data.length) * 0.5 }}
            cx={getX(i)}
            cy={getY(d.revenue)}
            r="4"
            fill="white"
            stroke={color}
            strokeWidth="2"
            className="hover:r-6 cursor-pointer transition-all"
          >
            <title>{`${d.date}: Rp ${d.revenue.toLocaleString("id-ID")}`}</title>
          </motion.circle>
        ))}

        {/* X Axis Labels (Partial) */}
        {data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0)
          .map((d, i, arr) => {
            const index = data.indexOf(d);
            return (
              <text
                key={i}
                x={getX(index)}
                y={height - 5}
                textAnchor="middle"
                className="fill-brand-500/30 text-[10px] font-bold"
              >
                {new Date(d.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </text>
            );
          })}
      </svg>
    </div>
  );
};

export default RevenueChart;
