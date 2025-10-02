import { AvailableOrdersFilters, ordersService } from "../../services/orders";
import { useQuery } from "@tanstack/react-query";

export const useAvailableOrders = (filters: AvailableOrdersFilters = {}) => {
  return useQuery({
    queryKey: ["available-orders", filters],
    queryFn: () => ordersService.getAvailableOrders(filters),
    staleTime: 15 * 1000,
    refetchInterval: 8 * 1000,
  });
};
