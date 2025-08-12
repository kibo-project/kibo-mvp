import React from "react";
import Link from "next/link";
import { Card, CardBody } from "~~/components/kibo";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: string;
  status?: string;
  icon?: React.ReactNode;
  color?: string;
  href?: string;
  onClick?: () => void;
}

interface RecentActivityProps {
  title: string;
  items: ActivityItem[];
  viewAllHref?: string;
  emptyMessage?: string;
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  title,
  items,
  viewAllHref,
  emptyMessage = "No recent activity",
  className = "",
}) => {
  const ActivityItemComponent = ({ item }: { item: ActivityItem }) => {
    const content = (
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${item.color || "bg-primary/10"} flex items-center justify-center`}>
              {item.icon || <span className="text-sm font-bold text-primary">{item.title[0]}</span>}
            </div>
            <div>
              <h4 className="font-medium text-sm text-base-content">{item.title}</h4>
              <div className="flex items-center gap-2">
                <p className="text-xs text-base-content opacity-60">{item.subtitle}</p>
                {item.status && <span className="text-xs text-base-content opacity-50">• {item.status}</span>}
              </div>
            </div>
          </div>
          {item.amount && (
            <div className="text-right">
              <span className="font-semibold text-base-content">{item.amount}</span>
            </div>
          )}
        </div>
      </div>
    );

    if (item.href) {
      return (
        <Link
          href={item.href}
          key={item.id}
          className="block hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          {content}
        </Link>
      );
    }

    if (item.onClick) {
      return (
        <button
          onClick={item.onClick}
          key={item.id}
          className="w-full text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          {content}
        </button>
      );
    }

    return <div key={item.id}>{content}</div>;
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-base-content">{title}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            See more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>

      <Card>
        <CardBody>
          {items.length > 0 ? (
            <div className="space-y-0">
              {items.map(item => (
                <ActivityItemComponent key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{emptyMessage}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
