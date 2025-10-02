import { Card, CardBody } from "~~/components/kibo";

export const OrderCardSkeleton = () => {
  return (
    <Card shadow="sm">
      <CardBody>
        <div className="flex justify-between items-start animate-pulse">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-24"></div>
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
        </div>
      </CardBody>
    </Card>
  );
};

export const OrderListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </>
  );
};
