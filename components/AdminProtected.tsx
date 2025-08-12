"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~~/services/store/auth-store.";

/**
 * Props for AdminProtected component
 */
interface AdminProtectedProps {
  /** Content to render if user has admin privileges */
  children: React.ReactNode;
  /** Optional content to show while checking auth or if access denied */
  fallback?: React.ReactNode;
}

/**
 * Admin Protection Wrapper Component
 *
 * Protects admin-only content by checking user role and redirecting unauthorized users.
 * Used to wrap admin pages and components that should only be accessible to admin users.
 *
 * @component
 * @example
 * ```tsx
 * <AdminProtected fallback={<div>Loading...</div>}>
 *   <AdminDashboard />
 * </AdminProtected>
 * ```
 *
 * @behavior
 * - Checks user role via useAuthStore().isAdmin()
 * - Redirects non-admin users to home page ("/")
 * - Shows fallback content during auth check or if access denied
 * - Only renders children if user has admin privileges
 *
 * @security
 * - Client-side protection only (development feature)
 * - In production, backend API should validate admin privileges
 * - This component prevents UI access but doesn't secure API calls
 */
export const AdminProtected: React.FC<AdminProtectedProps> = ({ children, fallback = null }) => {
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  // Redirect non-admin users to home page
  useEffect(() => {
    if (!isAdmin()) {
      router.push("/");
    }
  }, [isAdmin, router]);

  // Show fallback content if user doesn't have admin privileges
  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  // Render protected content for admin users
  return <>{children}</>;
};
