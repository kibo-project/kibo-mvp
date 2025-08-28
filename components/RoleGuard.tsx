"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleAccess } from "@/hooks/auth/useRoleAccess";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: "user" | "ally";
}

export const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { userRole, canAccess } = useRoleAccess();
  const router = useRouter();

  useEffect(() => {
    if (!userRole) {
      router.push("/login");
      return;
    }

    if (!canAccess(requiredRole)) {
      alert(`You must be logged in as ${requiredRole}. Currently: ${userRole}`);
      router.push("/");
      return;
    }
  }, [userRole, requiredRole, canAccess, router]);

  if (!userRole || !canAccess(requiredRole)) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
