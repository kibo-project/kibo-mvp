"use client";

import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { RoleGuard } from "@/components/RoleGuard";
import { NextPage } from "next";

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const handleCancel = () => {
    router.push("/");
  };
  const handleConfirm = () => {
    console.log("it is cool");
  };
  return (
    <RoleGuard requiredRole="user">
      <ApplicationForm
        onClose={handleCancel}
        onSubmit={handleConfirm}
        title={"FORM ALLY APLICATION"}
        isLoading={false}
        confirmationMessage={"Are you sure you want to submit this application"}
        successTitle={"We will review your request within 24-48 hours and contact you by phone."}
        successMessage={"You have successfully reviewed your request"}
        submitButtonText={"SUBMIT"}
      />
    </RoleGuard>
  );
};

export default ApplicationPage;
