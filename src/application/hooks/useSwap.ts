'use client';

/**
 * 应用层 Hook：Swap
 * Application Hook: Swap
 *
 * 职责：
 * - 使用 React Query 管理远程数据状态
 * - 调用命令层执行 Swap
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

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useConfig, usePublicClient } from 'wagmi';
import { getAmountOut, executeSwapCommand } from '@/application/commands/swap.command';
import type { SwapParams, SwapResult, GetAmountOutParams } from '@/types/swap';

// 重新导出类型，方便使用
export type { SwapParams, SwapResult, GetAmountOutParams } from '@/types/swap';

/**
 * Hook：执行 Swap
 *
 * 职责：
 * - 使用 React Query 管理 Swap 状态
 * - 调用命令层执行 Swap
 * - 返回状态给 UI
 */
export function useSwap() {
  const config = useConfig();
  const publicClient = usePublicClient();
  const { isConnected, address: userAddress } = useAccount();

  // 使用 React Query 的 useMutation 管理 Swap 状态
  const swapMutation = useMutation({
    mutationFn: async (params: SwapParams): Promise<SwapResult> => {
      if (!isConnected || !userAddress) {
        throw new Error('Please connect your wallet first');
      }

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // 调用命令层的纯函数（不需要传递 Hook 结果）
      return await executeSwapCommand(config, publicClient, userAddress, params);
    },
    onSuccess: data => {
      console.log('Swap successful:', data.txHash);
    },
    onError: error => {
      console.error('Swap failed:', error);
    },
  });

  // 获取输出金额（查询操作，不需要 mutation）
  const getAmountOutWrapper = useCallback(
    async (params: GetAmountOutParams): Promise<string> => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // 调用命令层的纯函数
      return await getAmountOut(publicClient, params);
    },
    [publicClient],
  );

  return {
    // Swap 操作
    executeSwap: swapMutation.mutate,
    executeSwapAsync: swapMutation.mutateAsync,

    // 状态
    isLoading: swapMutation.isPending,
    isSuccess: swapMutation.isSuccess,
    isError: swapMutation.isError,
    error: swapMutation.error?.message ?? null,
    data: swapMutation.data,

    // 重置状态
    reset: swapMutation.reset,

    // 获取输出金额
    getAmountOut: getAmountOutWrapper,
  };
}
