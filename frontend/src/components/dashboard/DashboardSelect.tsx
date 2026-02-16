"use client";

import React, { forwardRef, useId } from "react";

interface DashboardSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Dashboard Select - follows Encore UI form element styling
 * with EnStore color palette.
 */
const DashboardSelect = forwardRef<HTMLSelectElement, DashboardSelectProps>(
  (
    {
      label,
      error,
      icon,
      fullWidth = false,
      options,
      placeholder,
      className = "",
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-brand-500/30 [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full cursor-pointer appearance-none rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2.5 text-sm text-brand-500/90 transition-all duration-200 outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pl-11" : ""} ${error ? "border-red-500! focus:ring-red-500/30!" : ""} ${className} `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <div className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-brand-500/30">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

DashboardSelect.displayName = "DashboardSelect";
export default DashboardSelect;
