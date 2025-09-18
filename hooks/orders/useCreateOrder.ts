import { CreateOrderRequest, ordersService } from "../../services/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (data.success && data.data) {
        queryClient.setQueryData(["order", data.data.id], data.data);
      }
    },
    onError: error => {
      console.error("Error creating order:", error);
    },
  });
};
