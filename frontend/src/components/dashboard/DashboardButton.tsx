"use client";

import React from "react";

interface DashboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Dashboard Button - follows Encore UI button styling
 * with EnStore color palette.
 *
 * Key patterns from encore-ui:
 * - rounded-xl
 * - shadow-sm hover:shadow-md active:scale-95
 * - focus:ring-4
 * - font-semibold (not font-black uppercase)
 */
const DashboardButton: React.FC<DashboardButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      "bg-ocean-500 hover:bg-ocean-600 active:bg-ocean-800 focus:ring-4 focus:ring-ocean-500/30 text-white shadow-sm hover:shadow-md",
    secondary:
      "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 focus:ring-4 focus:ring-slate-500/20 text-slate-600",
    success:
      "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:ring-4 focus:ring-emerald-500/30 text-white shadow-sm hover:shadow-md",
    danger:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-4 focus:ring-red-500/30 text-white shadow-sm hover:shadow-md",
    outline:
      "border-2 border-ocean-500 text-ocean-500 hover:bg-ocean-500 hover:text-white active:bg-ocean-600 focus:ring-4 focus:ring-ocean-500/30",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${fullWidth ? "w-full" : ""} ${className} `}
      {...props}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
};

export default DashboardButton;
