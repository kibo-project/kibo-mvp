"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@privy-io/react-auth";
import { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~~/services/store/auth-store.";
import { useAuth } from "@/hooks/useAuth";

const Login: NextPage = () => {
  const { login } = useLogin();
  const { setHasVisitedRoot } = useAuthStore();
  const router = useRouter();
  const { isAuthenticated, isLoading, isReady, isBackendSynced, token, userProfile } = useAuth();

  const handlePrivyLogin = useCallback(() => {
    login();
  }, [login]);

  useEffect(() => {
    if (isAuthenticated && isBackendSynced) {
      router.replace("/");
    }
  }, [isAuthenticated, isBackendSynced, router]);

  useEffect(() => {
    setHasVisitedRoot(true);
  }, [setHasVisitedRoot]);

  if (!isReady || isLoading) {
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
            <Image
              src="/logo.svg"
              alt="Kibo Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Kibo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log in or try Guest mode to continue using the application.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handlePrivyLogin}
            disabled={!isReady}
            className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary/10 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login with Privy
          </button>

          <Link
            href="/"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex gap-2 justify-center items-center font-medium"
          >
            <span>Continue as Guest</span>
            <ArrowLeftIcon className="size-4 rotate-180" />
          </Link>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          Guest mode is for demo purposes only.
        </p>
      </div>
    </div>
  );
};

export default Login;
