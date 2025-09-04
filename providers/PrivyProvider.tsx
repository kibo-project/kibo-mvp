"use client";

import { useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mantle } from "viem/chains";
import { WagmiProvider, createConfig } from "wagmi";
import { http } from "wagmi";

const wagmiConfig = createConfig({
  chains: [mantle],
  transports: {
    [mantle.id]: http(),
  },
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: { theme: "light" },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
