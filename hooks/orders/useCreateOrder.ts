import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, CreateOrderRequest } from '../../services/orders';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: (data) => {
      // Invalidar lista de órdenes para que se recargue
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Opcional: agregar la nueva orden al cache optimísticamente
      queryClient.setQueryData(['order', data.order.id], data);
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    },
  });
};