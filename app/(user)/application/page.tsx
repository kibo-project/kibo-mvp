"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { RoleGuard } from "@/components/RoleGuard";
import { AllyApplicationRequest } from "@/core/types/ally.applications.types";
import { FormData } from "@/core/types/generic.types";
import { useApplyAlly } from "@/hooks/users/useApplyAlly";
import { NextPage } from "next";
import toast from "react-hot-toast";

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const { mutate: apply, isPending: isApplying } = useApplyAlly();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCancel = () => {
    router.push("/");
  };
  const handleConfirm = (formData: FormData) => {
    const allyApplicationRequest: AllyApplicationRequest = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
    };
    apply(allyApplicationRequest, {
      onSuccess: () => {
        setIsSubmitted(true);
        toast.success("Application submitted successfully!");
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.error?.message || "This application already exists";
        setIsSubmitted(false);
        toast.error(errorMessage);
      },
    });
  };
  return (
    <RoleGuard requiredRole="user">
      <ApplicationForm
        onClose={handleCancel}
        onSubmit={handleConfirm}
        isSubmitted={isSubmitted}
        title={"FORM ALLY APLICATION"}
        isLoading={isApplying}
        confirmationMessage={"Are you sure you want to submit this application"}
        successTitle={"We will review your request within 24-48 hours and contact you by phone."}
        successMessage={"You have successfully reviewed your request"}
        submitButtonText={"SUBMIT"}
      />
    </RoleGuard>
  );
};

export default ApplicationPage;
