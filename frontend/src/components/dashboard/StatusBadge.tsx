"use client";

import React from "react";

type BadgeStatus =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "processing";

interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    success: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    paid: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    completed: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    active: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    credit: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    unpaid: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    danger: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    failed: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    cancelled: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    expired: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    debit: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    info: {
      bg: "bg-ocean-500/10",
      text: "text-ocean-600",
      dot: "bg-ocean-500",
    },
    processing: {
      bg: "bg-ocean-500/10",
      text: "text-ocean-600",
      dot: "bg-ocean-500",
    },
    neutral: {
      bg: "bg-brand-500/5",
      text: "text-brand-500/60",
      dot: "bg-brand-500/40",
    },
  };

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "sm",
  dot = true,
  className = "",
}) => {
  const key = status.toLowerCase();
  const config = statusConfig[key] || statusConfig.neutral;
  const displayLabel =
    label || status.charAt(0).toUpperCase() + status.slice(1);

  const sizeStyles =
    size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${config.bg} ${config.text} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
