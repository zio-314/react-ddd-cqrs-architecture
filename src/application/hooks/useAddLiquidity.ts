'use client';

/**
 * 应用层 Hook：添加流动性
 * Application Hook: Add Liquidity
 *
 * 职责：
 * - 使用 React Query 管理添加流动性状态
 * - 调用命令层执行添加流动性
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

import { useMutation } from '@tanstack/react-query';
import { useAccount, useConfig } from 'wagmi';
import { executeAddLiquidityCommand } from '@/application/commands/addLiquidity.command';
import { Liquidity, LiquidityOperationType } from '@/domain/aggregates/Liquidity';
import { Amount } from '@/domain/value-objects/Amount';
import { Slippage } from '@/domain/value-objects/Slippage';
import type { AddLiquidityResult } from '@/types/liquidity';
import type { IToken } from '@/domain/entities/Token';

// 重新导出类型，方便使用
export type { AddLiquidityResult } from '@/types/liquidity';

/**
 * 添加流动性参数
 */
export interface AddLiquidityMutationParams {
  tokenA: IToken;
  tokenB: IToken;
  amountA: string;
  amountB: string;
  slippage: number; // 百分比，例如 0.5 表示 0.5%
}

/**
 * Hook：添加流动性（使用 Liquidity 聚合根）
 *
 * 使用 React Query 的 useMutation 管理添加流动性状态
 *
 * @returns 添加流动性的状态和方法
 *
 * @example
 * const { addLiquidity, isLoading, isSuccess, error, data } = useAddLiquidity();
 *
 * const handleAdd = () => {
 *   addLiquidity({
 *     tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *     tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *     amountA: '1.0',
 *     amountB: '10.0',
 *     slippage: 0.5, // 0.5%
 *   });
 * };
 */
export function useAddLiquidity() {
  const config = useConfig();
  const { isConnected, address: userAddress } = useAccount();

  // 使用 React Query 的 useMutation 管理添加流动性状态
  const addLiquidityMutation = useMutation({
    mutationFn: async ({
      tokenA,
      tokenB,
      amountA,
      amountB,
      slippage,
    }: AddLiquidityMutationParams): Promise<AddLiquidityResult> => {
      if (!isConnected || !userAddress) {
        throw new Error('Please connect your wallet first');
      }

      // 创建 Liquidity 聚合根（业务验证在构造函数中）
      const liquidity = new Liquidity(
        LiquidityOperationType.ADD,
        tokenA,
        tokenB,
        new Amount(amountA, tokenA.decimals),
        new Amount(amountB, tokenB.decimals),
        new Slippage(slippage / 100), // 转换为小数，例如 0.5% -> 0.005
      );

      // 调用命令层的纯函数
      return await executeAddLiquidityCommand(config, userAddress, liquidity);
    },
    onSuccess: data => {
      console.log('Liquidity added successfully:', data.txHash);
    },
    onError: error => {
      console.error('Failed to add liquidity:', error);
    },
  });

  return {
    // 添加流动性操作
    addLiquidity: addLiquidityMutation.mutate,
    addLiquidityAsync: addLiquidityMutation.mutateAsync,

    // 状态
    isLoading: addLiquidityMutation.isPending,
    isSuccess: addLiquidityMutation.isSuccess,
    isError: addLiquidityMutation.isError,
    error: addLiquidityMutation.error?.message ?? null,
    data: addLiquidityMutation.data,

    // 重置状态
    reset: addLiquidityMutation.reset,
  };
}
