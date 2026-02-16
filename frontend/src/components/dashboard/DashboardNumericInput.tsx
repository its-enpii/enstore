"use client";

import React, { forwardRef, useId, useState, useEffect } from "react";

interface DashboardNumericInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
  fullWidth?: boolean;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

/**
 * Dashboard Numeric Input - specialised for formatted numbers (e.g. currency)
 * while maintaining numeric state.
 */
const DashboardNumericInput = forwardRef<
  HTMLInputElement,
  DashboardNumericInputProps
>(
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
      value,
      onChange,
      prefix = "Rp ",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Internal display value (formatted string)
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      // Sync display value when external value changes
      if (value === 0) {
        setDisplayValue("0");
      } else {
        setDisplayValue(value.toLocaleString("id-ID"));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits
      const numericValue = parseInt(rawValue, 10) || 0;

      // Update external state
      onChange(numericValue);

      // Update internal display state
      if (numericValue === 0) {
        setDisplayValue("0");
      } else {
        setDisplayValue(numericValue.toLocaleString("id-ID"));
      }
    };

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
          {prefix && !icon && (
            <div className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-brand-500/30">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            value={displayValue}
            onChange={handleInputChange}
            className={`w-full rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2.5 text-sm font-bold text-brand-500/90 transition-all duration-200 outline-none placeholder:text-brand-500/30 focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${icon || prefix ? "pl-11" : ""} ${endIcon ? "pr-11" : ""} ${error ? "border-red-500! focus:ring-red-500/30!" : ""} ${className} `}
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

DashboardNumericInput.displayName = "DashboardNumericInput";
export default DashboardNumericInput;
