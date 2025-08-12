import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../../services/orders';

export const useTakeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.takeOrder(orderId),
    onSuccess: (data, orderId) => {
      // Actualizar orden específica
      queryClient.setQueryData(['order', orderId], data);

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
    },
  });
};