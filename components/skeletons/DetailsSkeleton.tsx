export const DetailsSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-4/6"></div>
    </div>
  );
};
