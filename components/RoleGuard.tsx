"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleAccess } from "@/hooks/auth/useRoleAccess";
import { usePrivy } from "@privy-io/react-auth";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: "user" | "ally" | "admin";
}

export const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { userRole, canAccess } = useRoleAccess();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  useEffect(() => {
    if (!authenticated && ready && !userRole) {
      router.push("/login");
      return;
    }

    if (authenticated && userRole == "user" && !canAccess(requiredRole)) {
      router.push("/");
      return;
    } else {
      if (ready && userRole && !canAccess(requiredRole)) {
        router.push("/404");
      }
    }
  }, [userRole, requiredRole, canAccess, router, ready, authenticated]);

  if (!userRole || !canAccess(requiredRole)) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
