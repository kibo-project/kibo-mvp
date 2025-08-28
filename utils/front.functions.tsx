import { OrderStatus } from "@/core/types/orders.types";

export const formatDateToSpanish = (date: Date | string | number): string => {
  const dateObj = new Date(date);

  return dateObj
    .toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 dark:bg-green-900";
    case "PENDING_PAYMENT":
      return "bg-yellow-100 dark:bg-yellow-900";
    case "CANCELLED":
      return "bg-red-100 dark:bg-red-900";
    case "TAKEN":
      return "bg-blue-100 dark:bg-blue-900";
    default:
      return "bg-neutral-100 dark:bg-neutral-800";
  }
};

export const getStatusIcon = (status: OrderStatus): React.ReactNode => {
  switch (status) {
    case "COMPLETED":
      return (
        <svg
          className="w-5 h-5 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case "PENDING_PAYMENT":
      return (
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "CANCELLED":
      return (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case "TAKEN":
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    default:
      return <span className="text-sm font-bold text-neutral-600">?</span>;
  }
};
