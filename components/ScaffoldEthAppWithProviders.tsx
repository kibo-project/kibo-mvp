"use client";

import { usePathname } from "next/navigation";
import { NavigationApp } from "./NavigationApp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { Header } from "~~/components/Header";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const excludedRoutes = ["/login", "/order/camera", "/order/confirmation-payment"];

  const shouldExclude = excludedRoutes.includes(pathname);

  return (
    <>
      <div className={`flex flex-col min-h-dvh `}>
        {!shouldExclude && <Header />}
        <main className="relative flex flex-col flex-1">{children}</main>
        {!shouldExclude && <NavigationApp />}
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressBar height="3px" color="#2299dd" />
      <ScaffoldEthApp>{children}</ScaffoldEthApp>
    </QueryClientProvider>
  );
};
