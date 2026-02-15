"use client";

import React from "react";
import { motion } from "motion/react";
import { NorthEastRounded } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: "ocean" | "brand";
  growth?: number | null;
  index?: number;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "ocean",
  growth,
  index = 0,
  subtitle,
  onClick,
}) => {
  const colorMap = {
    ocean: {
      bg: "bg-ocean-500",
      text: "text-ocean-500",
      light: "bg-ocean-500/10",
    },
    brand: {
      bg: "bg-brand-500",
      text: "text-brand-500",
      light: "bg-brand-500/10",
    },
  };

  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={`bg-smoke-200 dark:bg-brand-800 p-6 rounded-[28px] border border-brand-500/5 group hover:border-ocean-500/20 transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${c.bg} text-smoke-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {growth !== undefined && growth !== null && (
          <div className={`flex items-center gap-1 text-[10px] font-black ${growth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            <NorthEastRounded fontSize="inherit" className={growth < 0 ? "rotate-90" : ""} />
            <span>{Math.abs(growth)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-brand-500/40 dark:text-brand-500/50">{title}</p>
      <h3 className="text-xl font-black text-brand-500 dark:text-smoke-200 mt-1 truncate">{value}</h3>
      {subtitle && (
        <p className="text-[10px] font-bold text-brand-500/30 dark:text-brand-500/40 mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
