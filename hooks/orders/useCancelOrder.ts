import { ordersService } from "../../services/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
    onSuccess: (data, orderId) => {
      // Actualizar orden específica
      queryClient.setQueryData(["order", orderId], (oldData: any) => ({
        ...oldData,
        order: { ...oldData?.order, ...data.order },
      }));

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
