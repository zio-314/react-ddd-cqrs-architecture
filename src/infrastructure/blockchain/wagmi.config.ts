import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, localhost, arbitrumSepolia } from 'wagmi/chains';
import { http } from 'viem';

const projectId =
  process.env['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'] || '962a71c6db8df82cc0be6014069a554f';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Wallet connection may not work.');
}

// Arbitrum Sepolia RPC 端点
const ARBITRUM_SEPOLIA_RPC_URL =
  process.env['NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL'] ||
  'https://arb-sepolia.g.alchemy.com/v2/0Uyoq5ti54DHf65KscqN4w_d8IW45zhz';

// Create config lazily to avoid initialization on server
let configInstance: ReturnType<typeof getDefaultConfig> | null = null;

export function getConfig() {
  if (!configInstance) {
    configInstance = getDefaultConfig({
      appName: 'Uniswap Minimal',
      projectId,
      chains: [arbitrumSepolia],
      ssr: false, // Disable SSR to avoid indexedDB errors on server
      transports: {
        [arbitrumSepolia.id]: http(ARBITRUM_SEPOLIA_RPC_URL),
      },
    });
  }
  return configInstance;
}

// Export config as a getter to avoid initialization on server
export const config = new Proxy({} as ReturnType<typeof getDefaultConfig>, {
  get: (target, prop) => {
    const actualConfig = getConfig();
    return (actualConfig as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});
