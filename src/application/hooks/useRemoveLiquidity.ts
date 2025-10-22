'use client';

/**
 * 应用层 Hook：移除流动性
 * Application Hook: Remove Liquidity
 *
 * 职责：
 * - 使用 React Query 管理移除流动性状态
 * - 调用命令层执行移除流动性
 * - 返回状态给 UI
 *
 * 不应该：
 * - 包含业务逻辑（应在 commands 层）
 * - 直接处理数据转换（应在 commands 层）
 * - 直接调用区块链（应在 commands 层）
 * - 手动管理 loading、error 状态（应使用 React Query）
 *
 * 优势：
 * - 使用 React Query 的 useMutation 管理写操作状态
 * - 自动处理 loading、error、success 状态
 * - 支持乐观更新、重试等高级功能
 * - Hook 只负责状态管理，业务逻辑在 commands 层
 * - 命令逻辑可以在非 React 环境中复用
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount, useConfig } from 'wagmi';
import { executeRemoveLiquidityCommand } from '@/application/commands/removeLiquidity.command';
import { getLPTokenBalance } from '@/application/queries/getLPTokenBalance';
import type {
  RemoveLiquidityParams,
  RemoveLiquidityQuote,
  RemoveLiquidityResult,
  LPTokenInfo,
} from '@/types';
import type { IToken } from '@/domain/entities/Token';

/**
 * 移除流动性 Mutation 参数
 */
interface RemoveLiquidityMutationParams {
  pairAddress: `0x${string}`;
  params: RemoveLiquidityParams;
  quote: RemoveLiquidityQuote;
}

/**
 * Hook：移除流动性
 *
 * 使用 React Query 的 useMutation 管理移除流动性状态
 *
 * @returns 移除流动性的状态和方法
 *
 * @example
 * const { removeLiquidity, isLoading, isSuccess, error, data } = useRemoveLiquidity();
 *
 * const handleRemove = () => {
 *   removeLiquidity({
 *     pairAddress: '0x...',
 *     params: {
 *       tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *       tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *       liquidity: '1.0',
 *       slippage: '0.5',
 *     },
 *     quote: {
 *       amountA: '0.5',
 *       amountB: '5.0',
 *       amountAMin: '0.4975',
 *       amountBMin: '4.975',
 *       poolShare: 10.0,
 *       priceImpact: 0.1,
 *     },
 *   });
 * };
 */
export function useRemoveLiquidity() {
  const config = useConfig();
  const { isConnected, address: userAddress } = useAccount();

  // 使用 React Query 的 useMutation 管理移除流动性状态
  const removeLiquidityMutation = useMutation({
    mutationFn: ({
      pairAddress,
      params,
      quote,
    }: RemoveLiquidityMutationParams): Promise<RemoveLiquidityResult> => {
      if (!isConnected || !userAddress) {
        throw new Error('Please connect your wallet first');
      }

      // 调用命令层的纯函数
      return executeRemoveLiquidityCommand(config, userAddress, pairAddress, params, quote);
    },
    onSuccess: data => {
      console.log('Liquidity removed successfully:', data.txHash);
    },
    onError: error => {
      console.error('Failed to remove liquidity:', error);
    },
  });

  return {
    // 移除流动性操作
    removeLiquidity: removeLiquidityMutation.mutate,
    removeLiquidityAsync: removeLiquidityMutation.mutateAsync,

    // 状态
    isLoading: removeLiquidityMutation.isPending,
    isSuccess: removeLiquidityMutation.isSuccess,
    isError: removeLiquidityMutation.isError,
    error: removeLiquidityMutation.error?.message ?? null,
    data: removeLiquidityMutation.data,

    // 重置状态
    reset: removeLiquidityMutation.reset,
  };
}

/**
 * Hook：查询 LP Token 余额
 *
 * 使用 React Query 的 useQuery 管理查询状态
 *
 * @param tokenA - TokenA
 * @param tokenB - TokenB
 * @returns LP Token 信息
 *
 * @example
 * const { data: lpTokenInfo, isLoading, error } = useLPTokenBalance({
 *   tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *   tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 * });
 */
export function useLPTokenBalance(params: { tokenA?: IToken; tokenB?: IToken }) {
  const config = useConfig();
  const { isConnected, address: userAddress } = useAccount();

  return useQuery<LPTokenInfo | null>({
    queryKey: ['lpTokenBalance', params.tokenA?.address, params.tokenB?.address, userAddress],
    queryFn: () => {
      if (!isConnected || !userAddress || !params.tokenA || !params.tokenB) {
        return null;
      }

      return getLPTokenBalance(config, {
        tokenA: params.tokenA,
        tokenB: params.tokenB,
        userAddress,
      });
    },
    enabled: !!isConnected && !!userAddress && !!params.tokenA && !!params.tokenB,
    staleTime: 10_000, // 10 秒后数据过期
    refetchInterval: 30_000, // 每 30 秒自动刷新
    refetchOnWindowFocus: true, // 窗口聚焦时刷新
    refetchOnReconnect: true, // 重新连接时刷新
  });
}
