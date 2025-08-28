import { forwardRef } from "react";
import { cn } from "~~/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "gray";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "gray", size = "md", dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "kibo-status-base",
          {
            "kibo-status-success": variant === "success",
            "kibo-status-warning": variant === "warning",
            "kibo-status-error": variant === "error",
            "kibo-status-info": variant === "info",
            "kibo-status-gray": variant === "gray",
            "text-xs px-2 py-0.5": size === "sm",
            "text-xs px-2.5 py-1": size === "md",
            "text-sm px-3 py-1.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
