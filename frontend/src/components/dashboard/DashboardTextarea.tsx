"use client";

import React, { forwardRef, useId } from "react";

interface DashboardTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Dashboard Textarea - follows Encore UI form element styling
 * with EnStore color palette (brand-500, ocean-500).
 */
const DashboardTextarea = forwardRef<
  HTMLTextAreaElement,
  DashboardTextareaProps
>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = false,
      className = "",
      disabled,
      id,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute top-3.5 left-3.5 text-brand-500/30 [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </div>
          )}
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            className={`w-full resize-none rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2.5 text-sm text-brand-500/90 transition-all duration-200 outline-none placeholder:text-brand-500/30 focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pl-11" : ""} ${error ? "border-red-500! focus:ring-red-500/30!" : ""} ${className} `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-brand-500/40">{helperText}</p>
        )}
      </div>
    );
  },
);

DashboardTextarea.displayName = "DashboardTextarea";
export default DashboardTextarea;
