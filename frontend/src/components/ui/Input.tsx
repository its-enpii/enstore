import React, { forwardRef, useId } from "react";
import { motion, AnimatePresence } from "motion/react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "md",
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      startIcon: propStartIcon,
      endIcon: propEndIcon,
      onStartIconClick,
      onEndIconClick,
      fullWidth = false,
      required = false,
      className = "",
      disabled,
      id,
      autoComplete = "off",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Resolve icons (backward compatibility)
    const startIcon =
      propStartIcon || (iconPosition === "left" ? icon : undefined);
    const endIcon =
      propEndIcon || (iconPosition === "right" ? icon : undefined);

    const baseStyles =
      "appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden bg-cloud-200 text-brand-500/60 placeholder:text-brand-500/30 focus:border-ocean-500 focus:ring-1 focus:ring-ocean-200 transition-all duration-200 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const sizeStyles = {
      sm: "px-3 py-3 text-sm",
      md: "px-6 py-4 text-base",
      lg: "px-8 py-6 text-lg",
    };

    const errorStyles = error
      ? "!border-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-200"
      : "";

    const widthStyles = fullWidth ? "w-full" : "";

    // Padding Logic
    const paddingLeftStyles = startIcon
      ? inputSize === "sm"
        ? "!pl-9"
        : inputSize === "md"
          ? "!pl-10"
          : "!pl-11"
      : "";

    const paddingRightStyles = endIcon
      ? inputSize === "sm"
        ? "!pr-9"
        : inputSize === "md"
          ? "!pr-10"
          : "!pr-11"
      : "";

    const iconSizeStyles = {
      sm: "[&>svg]:w-4! [&>svg]:h-4!",
      md: "[&>svg]:w-5! [&>svg]:h-5!",
      lg: "[&>svg]:w-6! [&>svg]:h-6!",
    };

    const startIconPosition =
      inputSize === "sm"
        ? "left-3"
        : inputSize === "md"
          ? "left-3.5"
          : "left-4";
    const endIconPosition =
      inputSize === "sm"
        ? "right-3"
        : inputSize === "md"
          ? "right-3.5"
          : "right-4";

    const inputClasses = `${baseStyles} ${sizeStyles[inputSize]} ${widthStyles} ${errorStyles} ${paddingLeftStyles} ${paddingRightStyles} ${className}`;

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`mb-1.5 block text-sm font-medium ${
              error ? "text-red-600" : "text-gray-700"
            } ${disabled ? "opacity-50" : ""}`}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div
              onClick={onStartIconClick}
              className={`absolute top-1/2 -translate-y-1/2 ${startIconPosition} ${
                error ? "text-red-500" : "text-brand-500/40"
              } ${disabled ? "opacity-50" : ""} ${onStartIconClick ? "pointer-events-auto cursor-pointer hover:text-brand-500/70" : "pointer-events-none"}`}
            >
              <span
                className={`flex items-center ${iconSizeStyles[inputSize]}`}
              >
                {startIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={inputClasses}
            autoComplete={autoComplete}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {endIcon && (
            <div
              onClick={onEndIconClick}
              className={`absolute top-1/2 -translate-y-1/2 ${endIconPosition} ${
                error ? "text-red-500" : "text-brand-500/40"
              } ${disabled ? "opacity-50" : ""} ${onEndIconClick ? "pointer-events-auto cursor-pointer hover:text-brand-500/70" : "pointer-events-none"}`}
            >
              <span
                className={`flex items-center ${iconSizeStyles[inputSize]}`}
              >
                {endIcon}
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id={`${inputId}-error`}
              className="mt-1.5 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
