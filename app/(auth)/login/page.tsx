"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~~/services/store/auth-store.";

const Login: NextPage = () => {
  const { userRole, setUserRole, setHowRoles, setRoleNames, setRoleIds, setIsUserApplicant } = useAuthStore();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const backendLogin = useAuth();
  const { login } = useLogin({
    onComplete: ({ user }) => {
      const hasWallet = user.linkedAccounts?.some(account => account.type === "wallet");
      if (hasWallet) {
        if (!backendLogin.isPending && !backendLogin.isSuccess && !userRole) {
          backendLogin.mutate();
        }
      } else {
        toast.error("No wallet found after login completion");
      }
    },
    onError: error => {
      toast.error(error);
    },
  });
  const handlePrivyLogin = useCallback(() => {
    login();
  }, [login]);

  useEffect(() => {
    if (ready && authenticated && userRole) {
      router.replace("/");
    }
  }, [ready, authenticated, userRole, router]);

  useEffect(() => {
    if (authenticated && backendLogin.isSuccess && backendLogin.data?.data && !userRole) {
      setUserRole(backendLogin.data.data!.activeRoleName!);
      setHowRoles(backendLogin.data.data.howRoles!);
      setRoleNames(backendLogin.data.data.roleNames!);
      setRoleIds(backendLogin.data.data.roleIds!);
      if (backendLogin.data.data.isAnApplicant) {
        setIsUserApplicant(backendLogin.data.data.isAnApplicant);
      }
      router.replace("/");
    }
  }, [authenticated, backendLogin.isSuccess, backendLogin.data?.data, router]);

  if (!ready || backendLogin.isPending) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

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
          <p className="text-gray-600 dark:text-gray-400">Log in to continue using the application.</p>
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
