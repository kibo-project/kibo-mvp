import { authService } from "../../services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogoutCookie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // queryClient.removeQueries({ queryKey: ["auth"] });
      // queryClient.removeQueries({ queryKey: ["auth", "user"] });
      queryClient.clear();
    },
    onError: error => {
      console.error("Error logging out:", error);
    },
  });
};
