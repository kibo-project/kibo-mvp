"use client";

import { OrderStatus } from "@/services/orders";

interface StatusSelectFilterProps {
  currentStatus?: OrderStatus | "";
  onStatusChange: (status: OrderStatus | "") => void;
}

export const StatusFilter: React.FC<StatusSelectFilterProps> = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="mb-6">
      <select
        value={currentStatus ?? ""}
        onChange={e => onStatusChange(e.target.value as OrderStatus | "")}
        className="border rounded p-2 w-40 md:w-60 text-sm"
      >
        <option value="">All</option>
        <option value={OrderStatus.PENDING_PAYMENT}>Pending</option>
        <option value={OrderStatus.AVAILABLE}>Available</option>
        <option value={OrderStatus.TAKEN}>Taken</option>
        <option value={OrderStatus.COMPLETED}>Completed</option>
        <option value={OrderStatus.CANCELLED}>Cancelled</option>
      </select>
    </div>
  );
};
