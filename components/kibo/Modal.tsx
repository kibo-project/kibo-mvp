import { forwardRef, useEffect } from "react";
import { cn } from "~~/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ open, onClose, children, className }: ModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="kibo-modal-overlay" onClick={onClose}>
      <div className={cn("kibo-modal-content", className)} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, onClose, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("kibo-modal-header", className)} {...props}>
        <div className="flex-1">{children}</div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

ModalHeader.displayName = "ModalHeader";

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("kibo-modal-body", className)} {...props}>
    {children}
  </div>
));

ModalBody.displayName = "ModalBody";

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: "start" | "center" | "end" | "between";
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, justify = "end", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "kibo-modal-footer",
        {
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

ModalFooter.displayName = "ModalFooter";
