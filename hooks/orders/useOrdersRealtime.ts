import { useEffect, useMemo, useState } from "react";
import { OrdersListResponse } from "@/core/types/orders.types";
import { ordersService } from "@/services/orders";
import { useAuthStore } from "@/services/store/auth-store.";
import { useQueryClient } from "@tanstack/react-query";

export const useOrdersRealtime = ({ filters = {}, enabled = true } = {}) => {
  const { userRole } = useAuthStore();
  const [data, setData] = useState<OrdersListResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  useEffect(() => {
    if (!enabled) return;
    let cleanup: (() => void) | null = null;

    try {
      cleanup = ordersService.getOrdersRealtime(stableFilters, event => {
        if (event.type === "initial_data") {
          setData(event.payload);
          setConnected(true);
        } else if (event.type === "update") {
          setData(prevData => {
            if (!prevData) return prevData;

            const { eventType, old, new: newOrder } = event.payload;
            let updatedOrders = [...prevData.orders];

            switch (eventType) {
              case "INSERT":
                if (newOrder) {
                  updatedOrders.unshift(newOrder);
                }
                break;

              case "UPDATE":
                if (newOrder) {
                  const index = updatedOrders.findIndex(order => order.id === newOrder.id);
                  if (index !== -1) {
                    updatedOrders[index] = newOrder;

                    queryClient.setQueryData(["order", newOrder.id], {
                      success: true,
                      data: newOrder,
                    });
                  }
                }
                break;

              case "DELETE":
                if (old) {
                  updatedOrders = updatedOrders.filter(order => order.id !== old.id);
                }
                break;
            }

            const newData = {
              ...prevData,
              orders: updatedOrders,
              pagination: {
                ...prevData.pagination,
                total:
                  eventType === "INSERT"
                    ? prevData.pagination.total + 1
                    : eventType === "DELETE"
                      ? prevData.pagination.total - 1
                      : prevData.pagination.total,
              },
            };

            queryClient.setQueryData(["orders", userRole, stableFilters], newData);
            return newData;
          });
        }
      });
    } catch (err) {
      setError(err as Error);
      setConnected(false);
    }

    return () => {
      if (cleanup) {
        cleanup();
        setConnected(false);
      }
    };
  }, [enabled, stableFilters, queryClient, userRole]);

  return { data, error, connected };
};
