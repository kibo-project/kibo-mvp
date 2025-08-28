import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Authentication Store for Kibo dApp
 *
 * This store manages user role-based authentication state and navigation tracking.
 * Currently implements a simple role switcher system (user/admin) for development
 * and demo purposes. In production, this would be integrated with Privy authentication.
 *
 * @architecture
 * - Uses Zustand with persistence for state management
 * - Stores user role in localStorage for session persistence
 * - Provides role checking utilities for component access control
 *
 * @security
 * - Client-side only role switching (development feature)
 * - Real authentication would require backend validation
 * - Admin routes protected by AdminProtected component wrapper
 */

/**
 * User role types supported in the application
 * @type {"user" | "admin | ally"}
 */
export type UserRole = "user" | "ally" | "admin";

/**
 * Auth store interface defining state and actions
 */
interface AuthStore {
  /** Tracks if user has visited the root page (used for login flow) */
  hasVisitedRoot: boolean;

  /** Current user role - determines access to admin features */
  userRole: UserRole | null;

  /** Updates the root visit tracking flag */
  setHasVisitedRoot: (visited: boolean) => void;

  /** Changes the user role (triggers re-renders and navigation) */
  setUserRole: (role: UserRole | null) => void;

  /** Helper function to check if current user has admin privileges */
  isAdmin: () => boolean;
  reset: () => void;
}

/**
 * Zustand store for authentication state management
 *
 * @features
 * - Persistent storage: User role survives page reloads
 * - Role-based access: Easy admin/user privilege checking
 * - Navigation tracking: Tracks first-time visits for login flow
 *
 * @usage
 * ```tsx
 * const { userRole, setUserRole, isAdmin } = useAuthStore();
 *
 * // Check admin status
 * if (isAdmin()) {
 *   // Show admin features
 * }
 *
 * // Switch roles (development feature)
 * setUserRole("admin");
 * ```
 *
 * @persistence
 * Only userRole is persisted to localStorage to maintain session state.
 * hasVisitedRoot is session-only for login flow control.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      /** Initialize as false - user hasn't visited root yet */
      hasVisitedRoot: false,

      /** Default role is 'user' - admin access must be explicitly granted */
      userRole: null,

      /** Track root page visits for login redirect logic */
      setHasVisitedRoot: visited => set({ hasVisitedRoot: visited }),

      /**
       * Change user role and trigger component re-renders
       * Used by RoleSwitcher component for development/demo
       */
      setUserRole: role => set({ userRole: role }),

      /**
       * Check if current user has admin privileges
       * @returns {boolean} true if user role is 'admin'
       */
      isAdmin: () => get().userRole === "admin",
      reset: () => set({ userRole: null }),
    }),
    {
      name: "kibo-auth-storage",
      /** Only persist userRole - hasVisitedRoot is session-only */
      partialize: state => ({ userRole: state.userRole }),
    }
  )
);
