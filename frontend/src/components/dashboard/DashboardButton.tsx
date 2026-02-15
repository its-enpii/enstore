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
      "bg-ocean-500 hover:bg-ocean-600 active:bg-ocean-700 focus:ring-4 focus:ring-ocean-500/30 text-smoke-200 shadow-sm hover:shadow-md",
    secondary:
      "bg-brand-500/10 hover:bg-brand-500/20 active:bg-brand-500/30 focus:ring-4 focus:ring-brand-500/20 text-brand-500",
    success:
      "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:ring-4 focus:ring-emerald-500/30 text-smoke-200 shadow-sm hover:shadow-md",
    danger:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-4 focus:ring-red-500/30 text-smoke-200 shadow-sm hover:shadow-md",
    outline:
      "border-2 border-ocean-500 text-ocean-500 hover:bg-ocean-500 hover:text-smoke-200 active:bg-ocean-600 focus:ring-4 focus:ring-ocean-500/30",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-semibold rounded-xl
        active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
};

export default DashboardButton;
