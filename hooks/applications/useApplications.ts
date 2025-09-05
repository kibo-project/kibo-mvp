import { ApplicationsFiltersRequest, applicationsService } from "@/services/applications";
import { useQuery } from "@tanstack/react-query";

export const useApplications = (filters?: ApplicationsFiltersRequest) => {
  return useQuery({
    queryKey: ["applications", filters],
    queryFn: () => applicationsService.getApplications(filters),
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });
};
