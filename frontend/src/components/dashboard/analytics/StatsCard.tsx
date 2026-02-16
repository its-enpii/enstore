import React from "react";
import { SvgIconComponent } from "@mui/icons-material";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  className?: string; // Allow custom classes
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "text-brand-500",
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-brand-500/5 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-brand-500/40 uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-black text-brand-500">{value}</h3>
          {trend && (
            <div
              className={`mt-2 flex items-center text-xs font-bold ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
            >
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="ml-1 text-brand-500/30">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/5 ${color}`}
        >
          <Icon fontSize="medium" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
