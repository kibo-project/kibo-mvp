import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ENDPOINTS } from "@/config/api";

interface AuthState {
  isLoading: boolean;
  isBackendSynced: boolean;
  error: string | null;
  userProfile: any | null;
  token: string | null;
}

interface BackendSyncResponse {
  success: boolean;
  data: {
    user: any;
    token: string;
  };
}

export const useAuth = () => {
  const { ready, authenticated, user, getAccessToken } = usePrivy();

  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    isBackendSynced: false,
    error: null,
    userProfile: null,
    token: null,
  });

  const syncInProgressRef = useRef(false);

  const syncSessionWithBackend = useCallback(async () => {
    if (!ready || !authenticated || !user) {
      return;
    }
    if (syncInProgressRef.current) {
      return;
    }
    syncInProgressRef.current = true;
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const privyToken = await getAccessToken();
      if (!privyToken) {
        throw new Error("Failed to get Privy token");
      }
      const requestBody = {
        privyId: user.id,
        email: user.email?.address,
        wallet: user.wallet?.address,
        name: user.google?.name || user.email?.address?.split('@')[0] || 'Unknown',
        password: 'privy_auth', // Placeholder since using Privy authentication
      };
      const response = await fetch(`api/${ENDPOINTS.CONNECT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${privyToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sync with backend: ${response.status} - ${errorText}`);
      }
      const data: BackendSyncResponse = await response.json();
      console.log("user data back", data);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isBackendSynced: true,
        userProfile: data.data.user,
        token: data.data.token,
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        token: null,
      }));
      throw error;
    } finally {
      syncInProgressRef.current = false;
    }
  }, [ready, authenticated, user?.id, getAccessToken]);

  const getPrivyToken = useCallback(async () => {
    try {
      const token = await getAccessToken();
      return token;
    } catch (error) {
      console.error("Error getting Privy token:", error);
      return null;
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (ready && authenticated && user && !authState.isBackendSynced && !authState.isLoading && !syncInProgressRef.current) {
      syncSessionWithBackend();
    }
  }, [ready, authenticated, user?.id, authState.isBackendSynced]);

  useEffect(() => {
    if (ready && !authenticated) {
      setAuthState({
        isLoading: false,
        isBackendSynced: false,
        error: null,
        userProfile: null,
        token: null,
      });
    }
  }, [ready, authenticated]);

  return {
    ...authState,
    isAuthenticated: ready && authenticated,
    privyUser: user,
    isReady: ready,
    syncSessionWithBackend,
    getPrivyToken,
    userProfile: authState.userProfile,
  };
};
