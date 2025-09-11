import { OrdersFilters, ordersService } from "../../services/orders";
import { useQuery } from "@tanstack/react-query";

interface UseOrdersOptions {
  filters?: OrdersFilters;
  enabled?: boolean;
}
export const useOrders = ({ filters = {}, enabled = true }: UseOrdersOptions = {}) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersService.getOrders(filters),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 10 * 1000 : false,
  });
};
