import { ApplicationStatus } from "@/core/types/ally.applications.types";
import { OrderStatus } from "@/core/types/orders.types";

export const formatDateToSpanish = (date: Date | string | number, options?: { fixedTimeZone?: boolean }): string => {
  const dateObj = new Date(date);

  return dateObj
    .toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: options?.fixedTimeZone ? "America/La_Paz" : undefined,
    })
    .replace(",", "");
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}••••${address.slice(-4)}`;
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "bg-green-100 dark:bg-green-900";
    case OrderStatus.PENDING_PAYMENT:
      return "bg-yellow-100 dark:bg-yellow-900";
    case OrderStatus.CANCELLED:
      return "bg-red-100 dark:bg-red-900";
    case OrderStatus.TAKEN:
      return "bg-blue-100 dark:bg-blue-900";
    case OrderStatus.AVAILABLE:
      return "bg-blue-100 dark:bg-blue-900";
    default:
      return "bg-neutral-100 dark:bg-neutral-800";
  }
};

export const getStatusColorApplication = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "bg-yellow-100 dark:bg-yellow-900";
    case ApplicationStatus.APPROVED:
      return "bg-green-100 dark:bg-green-900";
    case ApplicationStatus.REJECTED:
      return "bg-red-100 dark:bg-red-900";
  }
};

export const getStatusIcon = (status: OrderStatus): React.ReactNode => {
  switch (status) {
    case OrderStatus.COMPLETED:
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
    case OrderStatus.PENDING_PAYMENT:
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
    case OrderStatus.CANCELLED:
      return (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case OrderStatus.TAKEN:
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
    case OrderStatus.AVAILABLE:
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

export const getStatusIconApplication = (status: ApplicationStatus): React.ReactNode => {
  switch (status) {
    case ApplicationStatus.PENDING:
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
    case ApplicationStatus.APPROVED:
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
    case ApplicationStatus.REJECTED:
      return (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
  }
};
