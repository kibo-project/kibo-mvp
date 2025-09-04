"use client";

// import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavigationApp } from "./NavigationApp";
// import { PrivyProvider } from "@privy-io/react-auth";
// import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
// import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
// import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  // useInitializeNativeCurrencyPrice();
  const pathname = usePathname();
  // Lista de rutas que NO deben usar el layout principal
  const excludedRoutes = ["/login", "/order/camera", "/order/confirmation-payment"];

  const shouldExclude = excludedRoutes.includes(pathname);

  return (
    <>
      <div className={`flex flex-col min-h-dvh `}>
        {!shouldExclude && <Header />}
        <main className="relative flex flex-col flex-1">{children}</main>
        {!shouldExclude && <NavigationApp />}
        {/* <Footer /> */}
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
