"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ApolloProvider } from "@apollo/client/react";
import { wagmiConfig } from "@/lib/chains";
import { subgraphClient } from "@/lib/subgraph";
import { useState, type ReactNode } from "react";

/**
 * Root providers component wrapping Wagmi, React Query, and Apollo
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={subgraphClient}>
          {children}
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
