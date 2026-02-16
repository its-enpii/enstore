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
  color = "text-brand-500/90",
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-brand-500/5 bg-smoke-200 p-6 shadow-calm transition-all hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-brand-500/60 uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-brand-500/90">{value}</h3>
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
