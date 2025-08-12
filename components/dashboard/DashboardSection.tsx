import React from "react";

interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  children,
  className = "",
  headerAction,
}) => {
  return (
    <section className={`mb-6 ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && <h2 className="text-xl font-semibold text-base-content mb-1">{title}</h2>}
            {subtitle && <p className="text-sm text-base-content/70">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
