import { usersService } from "@/services/users";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => usersService.getProfile(),
    staleTime: 10 * 1000,
  });
};
