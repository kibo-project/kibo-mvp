export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mb-2"></div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};
