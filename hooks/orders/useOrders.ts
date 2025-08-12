import { useQuery } from '@tanstack/react-query';
import { ordersService, OrdersFilters } from '../../services/orders';

export const useOrders = (filters: OrdersFilters = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersService.getOrders(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // Refetch cada 10 segundos para órdenes activas
  });
};