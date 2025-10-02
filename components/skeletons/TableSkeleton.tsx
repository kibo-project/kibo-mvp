export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};
