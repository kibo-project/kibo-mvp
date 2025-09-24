import { useEffect, useState } from "react";
import { ordersService } from "../../services/orders";
import { OrdersListResponse } from "@/core/types/orders.types";

interface UseOrdersRealtimeReturn {
  data: OrdersListResponse | null;
  loading: boolean;
  error: Error | null;
  connected: boolean;
}

export const useOrdersRealtime = ({ filters = {}, enabled = true } = {}): UseOrdersRealtimeReturn => {
  const [data, setData] = useState<OrdersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    let cleanup: (() => void) | null = null;

    const setupConnection = async () => {
      try {
        cleanup = await ordersService.getOrdersRealtime(
          filters,
          realtimeData => {
            if (realtimeData.type === "initial_data") {
              console.log("REALTIME DATA", realtimeData);
              setData(realtimeData.payload);
              setLoading(false);
              setConnected(true);
            } else if (realtimeData.type === "update") {
              console.log("REALTIME DATA UPDATE", realtimeData);
              setData(prevData => {
                if (!prevData) return prevData;

                const { eventType, old, new: newOrder } = realtimeData.payload;
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
                      }
                    }
                    break;

                  case "DELETE":
                    if (old) {
                      updatedOrders = updatedOrders.filter(order => order.id !== old.id);
                    }
                    break;
                }

                return {
                  ...prevData,
                  orders: updatedOrders,
                  pagination: {
                    ...prevData.pagination,
                    total: updatedOrders.length,
                  },
                };
              });
            }
          },
          err => {
            setError(err);
            setConnected(false);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        setConnected(false);
      }
    };

    setupConnection();

    const handleOnline = () => setConnected(true);
    const handleOffline = () => setConnected(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (cleanup) {
        cleanup();
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enabled, JSON.stringify(filters)]);

  return { data, loading, error, connected };
};
