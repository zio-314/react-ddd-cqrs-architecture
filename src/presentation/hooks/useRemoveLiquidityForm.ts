'use client';

/**
 * 表现层 Hook：移除流动性表单
 * Presentation Hook: Remove Liquidity Form
 *
 * 职责：
 * - 管理表单 UI 状态（quote、error、loading 等）
 * - 计算移除流动性报价
 * - 提供表单重置功能
 * - 为 UI 组件提供状态和方法
 *
 * 不应该：
 * - 包含业务逻辑（应在 queries/commands 层）
 * - 直接调用区块链（应在 queries/commands 层）
 * - 执行写操作（应使用 useRemoveLiquidity）
 *
 * 优势：
 * - 职责单一：只管理表单 UI 状态
 * - 与业务逻辑解耦
 * - 易于测试
 * - 专注于 UI 交互
 */

import { useState, useCallback } from 'react';
import { calculateRemoveLiquidityAmounts } from '@/application/queries/getLPTokenBalance';
import type { RemoveLiquidityQuote, LPTokenInfo } from '@/types';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';

/**
 * 计算移除流动性报价参数
 */
export interface CalculateRemoveLiquidityQuoteParams {
  lpTokenInfo: LPTokenInfo;
  liquidityAmount: string;
  slippage: string;
}

/**
 * Hook：移除流动性表单
 *
 * 管理表单状态，包括报价、加载状态、错误等
 *
 * @returns 表单状态和方法
 *
 * @example
 * const { quote, isLoading, error, calculateQuote, reset } = useRemoveLiquidityForm();
 *
 * const handleCalculate = async () => {
 *   const quote = await calculateQuote({
 *     lpTokenInfo: { ... },
 *     liquidityAmount: '1.0',
 *     slippage: '0.5',
 *   });
 * };
 */
export function useRemoveLiquidityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<RemoveLiquidityQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 从全局状态获取默认滑点
  const defaultSlippage = useUserPreferencesStore(state => state.defaultSlippage);

  /**
   * 计算移除流动性报价
   *
   * @param params - 计算报价参数
   * @returns 移除流动性报价
   */
  const calculateQuote = useCallback(
    async (params: CalculateRemoveLiquidityQuoteParams): Promise<RemoveLiquidityQuote> => {
      try {
        setIsLoading(true);
        setError(null);

        const { lpTokenInfo, liquidityAmount, slippage } = params;

        // 验证输入
        if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
          throw new Error('Invalid liquidity amount');
        }

        if (parseFloat(liquidityAmount) > parseFloat(lpTokenInfo.balance)) {
          throw new Error('Insufficient LP token balance');
        }

        // 计算可获得的代币数量
        const { amount0, amount1 } = calculateRemoveLiquidityAmounts(lpTokenInfo, liquidityAmount);

        // 计算最小数量（考虑滑点）
        const slippageMultiplier = 1 - parseFloat(slippage) / 100;
        const amount0Min = (parseFloat(amount0) * slippageMultiplier).toFixed(
          lpTokenInfo.token0.decimals,
        );
        const amount1Min = (parseFloat(amount1) * slippageMultiplier).toFixed(
          lpTokenInfo.token1.decimals,
        );

        // 计算池份额
        const poolShare = (parseFloat(liquidityAmount) / parseFloat(lpTokenInfo.totalSupply)) * 100;

        // 价格影响（移除流动性通常价格影响较小）
        const priceImpact = poolShare > 10 ? poolShare / 10 : 0.1;

        const newQuote: RemoveLiquidityQuote = {
          amount0,
          amount1,
          amount0Min,
          amount1Min,
          poolShare,
          priceImpact,
        };

        setQuote(newQuote);
        return newQuote;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to calculate quote';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * 重置表单状态
   */
  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // 状态
    quote,
    isLoading,
    error,
    defaultSlippage,

    // 方法
    calculateQuote,
    reset,
  };
}
