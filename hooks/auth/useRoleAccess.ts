import { useAuthStore } from "~~/services/store/auth-store.";

export const useRoleAccess = () => {
  const { userRole } = useAuthStore();

  const canAccess = (requiredRole: "user" | "ally") => {
    return userRole === requiredRole;
  };

  return { userRole, canAccess };
};
