import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, UploadProofRequest } from '../../services/orders';

export const useUploadProof = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UploadProofRequest }) => 
      ordersService.uploadProof(orderId, data),
    onSuccess: (data, { orderId }) => {
      queryClient.setQueryData(['order', orderId], data);
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
    },
  });
};