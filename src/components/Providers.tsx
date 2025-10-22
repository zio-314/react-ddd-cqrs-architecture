/* eslint-disable @typescript-eslint/no-require-imports */
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { customTheme, customDarkTheme } from '@/infrastructure/shared';
import { TokensProvider } from '@/components/TokensProvider';
import '@rainbow-me/rainbowkit/styles.css';

// Create query client outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function ProvidersContent({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const rainbowTheme = theme === 'dark' ? customDarkTheme : customTheme;

  // Dynamically require wagmi components and config only on client side
  // This prevents indexedDB errors on server
  const { WagmiProvider } = require('wagmi');
  const { RainbowKitProvider } = require('@rainbow-me/rainbowkit');
  const { getConfig } = require('@/infrastructure/blockchain');

  return (
    <WagmiProvider config={getConfig()}>
      <RainbowKitProvider theme={rainbowTheme}>
        <TokensProvider>{children}</TokensProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial render, return children without providers
  // This prevents hydration mismatches and indexedDB errors
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersContent>{children}</ProvidersContent>
    </QueryClientProvider>
  );
}
