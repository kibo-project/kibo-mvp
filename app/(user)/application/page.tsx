"use client";

import ApplicationForm from "@/components/ApplicationForm";
import { RoleGuard } from "@/components/RoleGuard";
import { NextPage } from "next";

const ApplicationPage: NextPage = () => {
  return (
    <RoleGuard requiredRole="user">
      <ApplicationForm></ApplicationForm>
    </RoleGuard>
  );
};

export default ApplicationPage;
