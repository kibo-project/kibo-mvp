import { forwardRef } from "react";
import { cn } from "~~/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base classes
          "kibo-btn-base",
          // Variants
          {
            "kibo-btn-primary": variant === "primary",
            "kibo-btn-secondary": variant === "secondary",
            "kibo-btn-ghost": variant === "ghost",
            "kibo-btn-danger": variant === "danger",
          },
          // Sizes
          {
            "kibo-btn-xs": size === "xs",
            "kibo-btn-sm": size === "sm",
            "kibo-btn-md": size === "md",
            "kibo-btn-lg": size === "lg",
            "kibo-btn-xl": size === "xl",
          },
          // States
          {
            "w-full": fullWidth,
          },
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <div className="kibo-spinner size-4" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
