import { ordersService } from "../../services/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTakeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.takeOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.setQueryData(["order", orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
    },
  });
};
