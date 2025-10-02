import { UserProfileRequest, usersService } from "@/services/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileRequest) => usersService.editProfile(data),
    onSuccess: data => {
      if (data.success && data.data) {
        queryClient.setQueryData(["user"], data.data);
      }
    },
  });
};
