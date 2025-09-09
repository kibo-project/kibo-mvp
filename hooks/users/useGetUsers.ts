import { UsersFiltersRequest } from "@/core/types/users.types";
import { usersService } from "@/services/users";
import { useQuery } from "@tanstack/react-query";

export const useGetUsers = (filters: UsersFiltersRequest) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersService.getUsers(filters),
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });
};
