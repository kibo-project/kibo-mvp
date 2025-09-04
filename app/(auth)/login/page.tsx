"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { NextPage } from "next";
import { useAuthStore } from "~~/services/store/auth-store.";

const Login: NextPage = () => {
  const { login } = useLogin();
  const { userRole, setUserRole, setHowRoles, setRoleNames, setRoleIds } = useAuthStore();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const backendLogin = useAuth();

  const handlePrivyLogin = useCallback(() => {
    login();
  }, [login]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (ready && authenticated && userRole) {
      router.replace("/");
    }
  }, [ready, authenticated, userRole, router]);

  useEffect(() => {
    if (authenticated && ready && !userRole && !backendLogin.isSuccess && !backendLogin.isPending) {
      backendLogin.mutate();
    }
  }, [authenticated, ready, userRole, backendLogin]);

  useEffect(() => {
    if (authenticated && backendLogin.isSuccess && backendLogin.data?.data && !userRole) {
      setUserRole(backendLogin.data.data!.activeRoleName);
      if (backendLogin.data.data.howRoles! > 1) {
        setHowRoles(backendLogin.data.data.howRoles!);
        setRoleNames(backendLogin.data.data.roleNames!);
        setRoleIds(backendLogin.data.data.roleIds!);
      }
      router.replace("/");
    }
  }, [authenticated, backendLogin.isSuccess, backendLogin.data, userRole, setUserRole, setHowRoles, setRoleNames, setRoleIds, router]);

  if (!ready || backendLogin.isPending) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Si ya está autenticado, mostrar loading mientras redirige
  if (authenticated && userRole) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-dvh bg-primary px-4">
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.svg" alt="Kibo Logo" width={80} height={80} className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Kibo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log in or try Guest mode to continue using the application.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handlePrivyLogin}
            disabled={!ready}
            className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary/10 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login with Privy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
