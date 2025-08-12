import { useQuery } from '@tanstack/react-query';
import { ordersService, AvailableOrdersFilters } from '../../services/orders';

export const useAvailableOrders = (filters: AvailableOrdersFilters = {}) => {
  return useQuery({
    queryKey: ['available-orders', filters],
    queryFn: () => ordersService.getAvailableOrders(filters),
    staleTime: 15 * 1000, // 15 segundos
    refetchInterval: 8 * 1000, // Refetch cada 8 segundos
  });
};