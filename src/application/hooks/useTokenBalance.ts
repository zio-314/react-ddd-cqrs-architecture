'use client';

/**
 * 应用层 Hook：代币余额
 * Application Hook: Token Balance
 *
 * 职责：
 * - 使用 React Query 管理代币余额查询
 * - 调用查询层获取余额
 * - 返回状态给 UI
 *
 * 不应该：
 * - 包含业务逻辑（应在 queries 层）
 * - 直接调用区块链（应在 queries 层）
 * - 手动管理 loading、error 状态（应使用 React Query）
 * - 手动轮询（React Query 自动支持）
 *
 * 优势：
 * - 使用 React Query 的 useQuery 管理查询状态
 * - 自动缓存、自动刷新
 * - 支持后台刷新、窗口聚焦刷新等
 * - Hook 只负责状态管理，业务逻辑在 queries 层
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount, useConfig } from 'wagmi';
import { getTokenBalance } from '@/application/queries/getTokenBalance';

export interface UseTokenBalanceParams {
  tokenAddress: string;
  decimals: number;
  enabled?: boolean;
}

export interface UseTokenBalanceResult {
  balance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook：代币余额
 *
 * 使用 React Query 的 useQuery 管理代币余额查询
 *
 * @param params - 代币参数
 * @returns 余额状态和方法
 *
 * @example
 * const { balance, isLoading, error, refetch } = useTokenBalance({
 *   tokenAddress: '0x...',
 *   decimals: 18,
 * });
 */
export function useTokenBalance({
  tokenAddress,
  decimals,
  enabled = true,
}: UseTokenBalanceParams): UseTokenBalanceResult {
  const config = useConfig();
  const { address: userAddress } = useAccount();

  // 使用 React Query 的 useQuery
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tokenBalance', tokenAddress, userAddress],
    queryFn: async () => {
      if (!userAddress || !tokenAddress) {
        return '0';
      }

      // 调用查询层的纯函数
      return await getTokenBalance({
        config,
        tokenAddress: tokenAddress as `0x${string}`,
        userAddress,
        decimals,
      });
    },
    enabled: enabled && !!userAddress && !!tokenAddress,
    staleTime: 10_000, // 10 秒后数据过期
    refetchInterval: 30_000, // ✅ 每 30 秒自动刷新
    refetchOnWindowFocus: true, // ✅ 窗口聚焦时刷新
    refetchOnReconnect: true, // ✅ 重新连接时刷新
    retry: 3,
  });

  return {
    balance: data ?? '0',
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
