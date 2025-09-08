import { applicationsService } from "@/services/applications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useApplicationApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => applicationsService.approveApplication(applicationId),
    onSuccess: (data, applicationId) => {
      queryClient.setQueryData(["application", applicationId], (oldData: any) => ({
        ...oldData,
        data: { ...oldData?.data, ...data.data },
      }));

      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
