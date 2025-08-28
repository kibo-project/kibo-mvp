import { forwardRef } from "react";
import { cn } from "~~/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, fullWidth = false, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className={cn("relative", { "w-full": fullWidth })}>
        {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{leftIcon}</div>}
        <input
          ref={ref}
          className={cn(
            "kibo-input-base",
            {
              "kibo-input-error": error,
              "pl-10": leftIcon,
              "pr-10": rightIcon,
              "w-full": fullWidth,
            },
            className
          )}
          {...props}
        />
        {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">{rightIcon}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, fullWidth = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "kibo-input-base",
          "resize-none",
          {
            "kibo-input-error": error,
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
