import { forwardRef } from "react";
import { cn } from "~~/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = "sm", border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "kibo-card",
          // Shadow variants
          {
            "shadow-none": shadow === "none",
            "shadow-sm shadow-neutral-300/5 dark:shadow-neutral-700/5": shadow === "sm",
            "shadow-md": shadow === "md",
            "shadow-lg": shadow === "lg",
          },
          // Border
          {
            "border-0": !border,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, compact = false, children, ...props }, ref) => (
    <div ref={ref} className={cn(compact ? "kibo-card-compact" : "kibo-card-body", className)} {...props}>
      {children}
    </div>
  ),
);

CardBody.displayName = "CardBody";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h2", children, ...props }, ref) => (
    <Component ref={ref} className={cn("kibo-card-title", className)} {...props}>
      {children}
    </Component>
  ),
);

CardTitle.displayName = "CardTitle";

export interface CardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const CardSubtitle = forwardRef<HTMLParagraphElement, CardSubtitleProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("kibo-card-subtitle", className)} {...props}>
      {children}
    </p>
  ),
);

CardSubtitle.displayName = "CardSubtitle";
