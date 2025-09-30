"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ApplicationForm } from "@/components/ApplicationForm";
import { RoleGuard } from "@/components/RoleGuard";
import { Button, CardTitle } from "@/components/kibo";
import { AllyApplicationRequest } from "@/core/types/ally.applications.types";
import { FormData } from "@/core/types/generic.types";
import { useApplication } from "@/hooks/applications/useApplication";
import { useApplyAlly } from "@/hooks/users/useApplyAlly";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { useAuthStore } from "~~/services/store/auth-store.";

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const { mutate: apply, isPending: isApplying } = useApplyAlly();
  const { isUserApplicant, setIsUserApplicant } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data, isLoading } = useApplication({ enabled: isUserApplicant });

  const handleCancel = () => {
    router.push("/");
  };
  const handleConfirm = (formData: FormData) => {
    const allyApplicationRequest: AllyApplicationRequest = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
    };
    if (allyApplicationRequest) {
      apply(allyApplicationRequest, {
        onSuccess: () => {
          setIsUserApplicant(true);
          setIsSubmitted(true);
          toast.success("Application submitted successfully!");
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || "This application already exists";
          setIsSubmitted(false);
          toast.error(errorMessage);
        },
      });
    }
  };
  const handleClose = () => {
    router.push("/");
  };
  if (isUserApplicant) {
    return (
      <RoleGuard requiredRole="user">
        <div className="mx-auto my-8 w-full max-w-md">
          <CardTitle className="text-center mb-4">Your Application Status</CardTitle>
          {isLoading ? (
            <p className="text-center">Loading application...</p>
          ) : data?.data ? (
            <>
              <ApplicationCard application={data.data}>
                <Button variant="primary" onClick={handleClose} disabled={isLoading}>
                  Return Home
                </Button>
              </ApplicationCard>
            </>
          ) : (
            <p className="text-center">No application found</p>
          )}
        </div>
      </RoleGuard>
    );
  }
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
