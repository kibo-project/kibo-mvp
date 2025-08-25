import { OrderStatus } from "@/services/orders";
export type StyledOrderStatus =
  | OrderStatus.AVAILABLE
  | OrderStatus.COMPLETED
  | OrderStatus.REFUNDED;

export const statusStyles: Record<StyledOrderStatus, string> = {
  [OrderStatus.AVAILABLE]: "text-yellow-600 dark:text-yellow-400",
  [OrderStatus.COMPLETED]: "text-green-600 dark:text-green-400",
  [OrderStatus.REFUNDED]: "text-red-500 dark:text-red-400",
};

export const statusTitles: Record<StyledOrderStatus, string> = {
  [OrderStatus.AVAILABLE]: "Pending Transaction",
  [OrderStatus.COMPLETED]: "Transaction Completed",
  [OrderStatus.REFUNDED]: "Transaction Failed",
};

export const statusButtonLabels: Record<StyledOrderStatus, string> = {
  [OrderStatus.AVAILABLE]: "Show",
  [OrderStatus.COMPLETED]: "Voucher",
  [OrderStatus.REFUNDED]: "Show",
};

export const adminStatusButtonLabels:  Partial<Record<OrderStatus, string>> = {
  [OrderStatus.AVAILABLE]: "Review",
  [OrderStatus.COMPLETED]: "View",
  [OrderStatus.REFUNDED]: "Details",
};
