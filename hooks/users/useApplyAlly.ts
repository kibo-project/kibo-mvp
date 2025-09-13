import { AllyApplicationRequest } from "@/core/types/ally.applications.types";
import { usersService } from "@/services/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useApplyAlly = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllyApplicationRequest) => usersService.createApplication(data),
    onSuccess: data => {
      if (data.success && data.data) {
        queryClient.setQueryData(["application", data.data.id], data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
