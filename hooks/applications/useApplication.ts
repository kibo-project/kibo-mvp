import { applicationsService } from "@/services/applications";
import { useQuery } from "@tanstack/react-query";

export const useApplication = () => {
  return useQuery({
    queryKey: ["application", "current"],
    queryFn: () => applicationsService.getApplication(),
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });
};
