import { useEffect, useState } from "react";
import { OrderResponse } from "@/core/types/orders.types";
import { ordersService } from "@/services/orders";
import { useQueryClient } from "@tanstack/react-query";

export const useOrderRealtime = (id: string, initialData?: OrderResponse) => {
  const [data, setData] = useState<OrderResponse | undefined>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    let cleanup: (() => void) | undefined;

    try {
      cleanup = ordersService.subscribeToOrderChanges(id, event => {
        console.log("SSE Event received:", event);

        if (event.type === "initial_data") {
          setData(event.payload);
          setIsConnected(true);
          setError(null);
        } else if (event.type === "update") {
          setData(event.payload.new || event.payload);
          queryClient.setQueryData(["order", id], {
            success: true,
            data: event.payload.new || event.payload,
          });
        }
      });

      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
      setIsConnected(false);
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
      setIsConnected(false);
    };
  }, [id, queryClient]);

  return {
    data,
    isConnected,
    error,
  };
};
