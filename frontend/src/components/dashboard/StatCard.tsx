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
      text: "text-brand-500/90",
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
      className={`dashboard-card group transition-all duration-300 hover:border-ocean-500/20 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`h-12 w-12 ${c.bg} flex items-center justify-center rounded-2xl text-smoke-200 transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        {growth !== undefined && growth !== null && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold ${growth >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            <NorthEastRounded
              fontSize="inherit"
              className={growth < 0 ? "rotate-90" : ""}
            />
            <span>{Math.abs(growth)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-brand-500/60">{title}</p>
      <h3 className="mt-1 truncate text-xl font-bold text-brand-500/90">
        {value}
      </h3>
      {subtitle && (
        <p className="mt-2 text-[10px] font-medium text-brand-500/40">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
