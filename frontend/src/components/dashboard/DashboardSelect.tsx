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
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-brand-500/70 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500/30 [&>svg]:w-5 [&>svg]:h-5 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              w-full px-4 py-2.5
              bg-smoke-200
              border border-brand-500/10
              rounded-xl
              text-sm text-brand-500
              focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500/50
              outline-none
              transition-all duration-200
              cursor-pointer appearance-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-11" : ""}
              ${error ? "border-red-500! focus:ring-red-500/30!" : ""}
              ${className}
            `}
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
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-500/30 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

DashboardSelect.displayName = "DashboardSelect";
export default DashboardSelect;
