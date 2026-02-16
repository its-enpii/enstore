"use client";

import React, { forwardRef, useId } from "react";

interface DashboardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
  fullWidth?: boolean;
}

/**
 * Dashboard Input - follows Encore UI form element styling
 * with EnStore color palette (brand-500, ocean-500).
 *
 * Key differences from public Input:
 * - rounded-xl (not rounded-full)
 * - bg-smoke-200 / dark:bg-brand-700 background
 * - focus:ring-2 focus:ring-ocean-500/30
 * - font-medium labels (not uppercase tracking-widest)
 */
const DashboardInput = forwardRef<HTMLInputElement, DashboardInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      endIcon,
      onEndIconClick,
      fullWidth = false,
      className = "",
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute top-1/2 left-3.5 -translate-y-1/2 text-brand-500/30 [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2.5 text-sm text-brand-500/90 transition-all duration-200 outline-none placeholder:text-brand-500/30 focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pl-11" : ""} ${endIcon ? "pr-11" : ""} ${error ? "border-red-500! focus:ring-red-500/30!" : ""} ${className} `}
            {...props}
          />
          {endIcon && (
            <div
              className={`absolute top-1/2 right-3.5 -translate-y-1/2 text-brand-500/30 transition-colors hover:text-brand-500/90 [&>svg]:h-5 [&>svg]:w-5 ${onEndIconClick ? "cursor-pointer" : ""}`}
              onClick={onEndIconClick}
            >
              {endIcon}
            </div>
          )}
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

DashboardInput.displayName = "DashboardInput";
export default DashboardInput;
