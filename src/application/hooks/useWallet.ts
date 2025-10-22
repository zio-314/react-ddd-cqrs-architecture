'use client';

/**
 * 应用层 Hook：钱包
 * Application Hook: Wallet
 *
 * 职责：
 * - 封装 wagmi 的钱包相关 hooks
 * - 提供统一的钱包状态接口
 * - 管理链信息映射
 *
 * 不应该：
 * - 包含业务逻辑（应在 domain 层）
 * - 直接调用区块链（应在 queries/commands 层）
 *
 * 优势：
 * - 统一的钱包状态管理
 * - 易于测试和维护
 * - 与 wagmi 解耦
 */

import { useAccount, useBalance, useChainId } from 'wagmi';
import { mainnet, sepolia, localhost, Chain } from 'wagmi/chains';

const chainMap: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [localhost.id]: localhost,
};

/**
 * Hook：钱包状态
 *
 * 获取当前连接的钱包信息
 *
 * @returns 钱包状态
 *
 * @example
 * const { address, isConnected, chain, balance } = useWallet();
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const chainId = useChainId();
  const chain = chainMap[chainId];
  const { data: balanceData } = useBalance({
    address,
  });

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    chainId,
    balance: balanceData?.value,
    balanceFormatted: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
  };
}
