"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { monadTestnet } from "@/lib/monad";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const hasWalletConnectProjectId = Boolean(projectId && /^[a-f0-9]{32}$/i.test(projectId) && !/^0+$/.test(projectId));

const config = getDefaultConfig({
  appName: "FirstIn",
  // With no WalletConnect project ID, limit connectors to injected browser wallets.
  // This keeps local/test deployments usable without an invalid WalletConnect request.
  projectId: hasWalletConnectProjectId ? projectId! : "00000000000000000000000000000000",
  wallets: hasWalletConnectProjectId
    ? undefined
    : [{ groupName: "Browser wallet", wallets: [injectedWallet] }],
  chains: [monadTestnet],
  ssr: true,
});

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
