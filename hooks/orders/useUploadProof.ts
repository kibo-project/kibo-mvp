import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, UploadProofRequest } from '../../services/orders';

export const useUploadProof = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UploadProofRequest }) => 
      ordersService.uploadProof(orderId, data),
    onSuccess: (data, { orderId }) => {
      // Actualizar orden específica
      queryClient.setQueryData(['order', orderId], data);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
    },
  });
};