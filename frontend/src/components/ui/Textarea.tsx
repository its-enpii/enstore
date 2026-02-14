import React, { forwardRef, useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  textareaSize?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      textareaSize = "md",
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      fullWidth = false,
      required = false,
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

    const baseStyles =
      "appearance-none bg-cloud-200 text-brand-500/60 placeholder:text-brand-500/30 focus:border-ocean-500 focus:ring-1 focus:ring-ocean-200 transition-all duration-200 rounded-2xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none";

    const sizeStyles = {
      sm: "px-3 py-3 text-sm",
      md: "px-6 py-4 text-base",
      lg: "px-8 py-6 text-lg",
    };

    const errorStyles = error
      ? "!border-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-200"
      : "";

    const widthStyles = fullWidth ? "w-full" : "";

    const iconPaddingStyles = icon
      ? iconPosition === "left"
        ? textareaSize === "sm"
          ? "!pl-9"
          : textareaSize === "md"
            ? "!pl-10"
            : "!pl-11"
        : textareaSize === "sm"
          ? "!pr-9"
          : textareaSize === "md"
            ? "!pr-10"
            : "!pr-11"
      : "";

    const iconSizeStyles = {
      sm: "[&>svg]:w-4! [&>svg]:h-4!",
      md: "[&>svg]:w-5! [&>svg]:h-5!",
      lg: "[&>svg]:w-6! [&>svg]:h-6!",
    };

    const iconPositionStyles =
      iconPosition === "left"
        ? textareaSize === "sm"
          ? "left-3 top-3.5"
          : textareaSize === "md"
            ? "left-3.5 top-5"
            : "left-4 top-7"
        : textareaSize === "sm"
          ? "right-3 top-3.5"
          : textareaSize === "md"
            ? "right-3.5 top-5"
            : "right-4 top-7";

    const textareaClasses = `${baseStyles} ${sizeStyles[textareaSize]} ${widthStyles} ${errorStyles} ${iconPaddingStyles} ${className}`;

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className={`mb-1.5 block text-sm font-medium ${
              error ? "text-red-600" : "text-gray-700"
            } ${disabled ? "opacity-50" : ""}`}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={`absolute ${iconPositionStyles} ${
                error ? "text-red-500" : "text-brand-500/40"
              } ${disabled ? "opacity-50" : ""} pointer-events-none`}
            >
              <span
                className={`flex items-center ${iconSizeStyles[textareaSize]}`}
              >
                {icon}
              </span>
            </div>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            className={textareaClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : helperText
                  ? `${textareaId}-helper`
                  : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${textareaId}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
