import { applicationsService } from "@/services/applications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useApplicationReject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: string; reason: string }) =>
      applicationsService.rejectApplication(applicationId, reason),
    onSuccess: (data, applicationId) => {
      queryClient.setQueryData(["application", applicationId], (oldData: any) => ({
        ...oldData,
        data: { ...oldData?.data, ...data.data },
      }));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
