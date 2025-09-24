"use client";

import { Button } from "@/components/kibo";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  onPageChange: (newOffset: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  limit,
  offset,
  hasMore,
  onPageChange,
  isLoading = false,
}) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasPrevious = offset > 0;

  const handlePrevious = () => {
    if (hasPrevious && !isLoading) {
      const newOffset = Math.max(0, offset - limit);
      onPageChange(newOffset);
    }
  };

  const handleNext = () => {
    if (hasMore && !isLoading) {
      const newOffset = offset + limit;
      onPageChange(newOffset);
    }
  };

  if (total <= limit) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-6 gap-2">
      {/*<div className="text-sm text-neutral-600 dark:text-neutral-400">*/}
      {/*  Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results*/}
      {/*</div>*/}

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handlePrevious}
          disabled={!hasPrevious || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </Button>

        <span className="text-sm text-neutral-600 dark:text-neutral-400 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={!hasMore || isLoading}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
