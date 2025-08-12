import React from "react";
import Link from "next/link";

export interface QuickAction {
  name: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, className = "" }) => {
  return (
    <div className={`flex justify-center items-center gap-8 max-w-sm mx-auto ${className}`}>
      {actions.map(action => (
        <div className="flex flex-col items-center gap-3" key={action.name}>
          {action.onClick ? (
            <button
              onClick={action.onClick}
              className={`flex justify-center items-center ${action.color || "bg-white/20"} backdrop-blur-sm rounded-full size-15 md:size-16 hover:bg-accent/30 transition-all duration-200 hover:scale-105`}
              aria-label={action.name}
            >
              {action.icon}
            </button>
          ) : (
            <Link
              href={action.href}
              className={`flex justify-center items-center ${action.color || "bg-white/20"} backdrop-blur-sm rounded-full size-15 md:size-16 hover:bg-accent/30 transition-all duration-200 hover:scale-105`}
              aria-label={action.name}
            >
              {action.icon}
            </Link>
          )}
          <span className="text-sm font-medium text-white">{action.name}</span>
        </div>
      ))}
    </div>
  );
};
