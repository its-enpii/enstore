interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  icon,
  iconPosition = "left",
  iconOnly = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center whitespace-nowrap justify-center px-6 py-3 rounded-full font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-ocean-500 text-cloud-200 hover:bg-ocean-600 active:bg-ocean-700",
    dark: "bg-brand-500 text-cloud-200 hover:bg-brand-600 active:bg-brand-700",
    white: "bg-smoke-200 text-brand-500 hover:bg-smoke-300 active:bg-smoke-400",
  };

  const sizeStyles = iconOnly
    ? {
        sm: "p-1.5 text-sm",
        md: "p-2 text-base",
        lg: "p-3 text-lg",
      }
    : {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      };

  const iconSizeStyles = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const gapStyles = {
    sm: iconPosition === "left" ? "mr-1.5" : "ml-1.5",
    md: iconPosition === "left" ? "mr-2" : "ml-2",
    lg: iconPosition === "left" ? "mr-2.5" : "ml-2.5",
  };

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const renderIcon = (iconElement: React.ReactNode) => {
    if (!iconElement) return null;

    return (
      <span
        className={`${iconSizeStyles[size]} ${!iconOnly ? gapStyles[size] : ""}`}
      >
        {iconElement}
      </span>
    );
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className={`animate-spin ${iconSizeStyles[size]} ${!iconOnly && "mr-2"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && icon && iconPosition === "left" && renderIcon(icon)}

      {!iconOnly && children}

      {!isLoading && icon && iconPosition === "right" && renderIcon(icon)}
    </button>
  );
};

export default Button;
