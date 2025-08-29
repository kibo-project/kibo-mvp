import { authService } from "../../services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRoleChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => authService.changeRole(roleId),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      if (data.success && data.data) {
        queryClient.setQueryData(["auth", "user"], data.data);
      }
    },
    onError: error => {
      console.error("Error changing role user", error);
    },
  });
};
