import { authService } from "../../services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.login(),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      if (data.success && data.data) {
        queryClient.setQueryData(["auth", "user"], data.data);
      }
    },
    onError: error => {
      console.error("Error logging in", error);
    },
  });
};
