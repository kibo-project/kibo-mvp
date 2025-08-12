import { useQuery } from '@tanstack/react-query';
import { ordersService } from '../../services/orders';

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 10 * 1000, // 10 segundos
    // TODO: Determinar si es necesario un refetch automático
    // refetchInterval: (data) => {
    //   // Refetch más frecuente si la orden está activa
    //   const isActive = data?.order && ['PENDING_PAYMENT', 'AVAILABLE', 'TAKEN'].includes(data.order.status);
    //   return isActive ? 5 * 1000 : 60 * 1000; // 5 seg si activa, 1 min si completada
    // },
  });
};