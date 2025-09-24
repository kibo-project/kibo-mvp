import React from "react";
import Link from "next/link";
import { OrderResponse } from "@/core/types/orders.types";
import { Card, CardBody } from "~~/components/kibo";
import { formatDateToSpanish, getStatusColor, getStatusIcon } from "~~/utils/front.functions";

interface BaseItem {
  id: string;
  createdAt: string;
}

interface RecentActivityProps<T extends BaseItem = OrderResponse> {
  title: string;
  items: T[];
  viewAllHref?: string;
  viewOneHref: string;
  emptyMessage?: string;
  className?: string;
  renderItem?: (item: T) => React.ReactNode;
}

export const RecentActivity = <T extends BaseItem = OrderResponse>({
  title,
  items,
  viewAllHref,
  viewOneHref,
  emptyMessage = "No recent activity",
  className = "",
  renderItem,
}: RecentActivityProps<T>) => {
  const defaultOrderRenderer = (item: OrderResponse) => (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${getStatusColor(item.status)} flex items-center justify-center`}>
            {getStatusIcon(item.status)}
          </div>
          <div>
            <h4 className="font-medium text-sm text-base-content">
              {item.cryptoCurrency} → {item.fiatCurrency}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-xs text-base-content opacity-60">{formatDateToSpanish(item.createdAt)}</p>
              <span className="text-xs text-base-content opacity-50">• {item.status}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-base-content">
            {item.fiatAmount} {item.fiatCurrency}
          </div>
          <div className="text-xs text-base-content opacity-60">
            {item.cryptoAmount} {item.cryptoCurrency}
          </div>
        </div>
      </div>
    </div>
  );

  const ItemComponent = ({ item }: { item: T }) => {
    const content = renderItem ? renderItem(item) : defaultOrderRenderer(item as unknown as OrderResponse);

    return (
      <Link
        href={viewOneHref + item.id}
        key={item.id}
        className="block hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        {content}
      </Link>
    );
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
                <ItemComponent key={item.id} item={item} />
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
