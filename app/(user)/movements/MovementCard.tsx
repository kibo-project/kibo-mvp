import React from "react";
import { statusButtonLabels, statusStyles, statusTitles, StyledOrderStatus } from "./MovementStatus";
import { OrderStatus } from "@/services/orders";

export interface MovementCardProps {
  id: string;
  status: StyledOrderStatus;
  mainAmount: string;
  secondaryAmount: string;
  date: string;
  onAction?: (id: string, status: OrderStatus) => void;
}

export const MovementCard: React.FC<MovementCardProps> = ({
  id,
  status,
  mainAmount,
  secondaryAmount,
  date,
  onAction,
}) => (
  <article className="p-4 flex flex-col dark:bg-neutral-900 bg-neutral-100 rounded-2xl">
    <header>
      <h2 className={`text-lg font-semibold m-0 ${statusStyles[status]}`}>{statusTitles[status]}</h2>
    </header>
    <hr className="my-1" />
    <div className="flex justify-between gap-2">
      <div className="w-full">
        <p className="mt-0 mb-0.5">
          <span>{mainAmount}</span> <span>({secondaryAmount})</span>
        </p>
        <p className="my-0 text-sm opacity-80">{date}</p>
      </div>
      <div className="flex justify-end items-center">
        <button
          onClick={() => onAction?.(id, status)}
          className="py-1.5 px-6 bg-primary text-white rounded-2xl w-28 text-center"
        >
          {statusButtonLabels[status]}
        </button>
      </div>
    </div>
  </article>
);
