"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAuthStore } from "~~/services/store/auth-store.";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: "user" | "ally" | "admin";
}

export const RoleGuard = ({ children, requiredRole }: RoleGuardProps) => {
  const { userRole } = useAuthStore();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (!authenticated && ready && !userRole) {
      router.push("/login");
      return;
    }

    if (authenticated && userRole?.name === "admin" && userRole.name !== requiredRole) {
      router.push("/admin");
      return;
    } else {
      if (authenticated && userRole && userRole.name !== requiredRole) {
        router.push("/");
      }
    }
  }, [userRole, requiredRole, router, ready, authenticated]);

  if (!userRole || userRole.name !== requiredRole) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
