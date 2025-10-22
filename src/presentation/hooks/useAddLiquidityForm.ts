'use client';

/**
 * 表现层 Hook：添加流动性表单
 * Presentation Hook: Add Liquidity Form
 *
 * 职责：
 * - 管理表单 UI 状态（quote、error、loading 等）
 * - 调用查询层获取报价
 * - 提供表单重置功能
 * - 为 UI 组件提供状态和方法
 *
 * 不应该：
 * - 包含业务逻辑（应在 queries/commands 层）
 * - 直接调用区块链（应在 queries/commands 层）
 * - 执行写操作（应使用 useAddLiquidity）
 *
 * 优势：
 * - 职责单一：只管理表单 UI 状态
 * - 与业务逻辑解耦
 * - 易于测试
 * - 专注于 UI 交互
 */

import { useState, useCallback } from 'react';
import { getLiquidityQuote } from '@/application/queries/getLiquidityQuote';
import type { GetLiquidityQuoteParams, LiquidityQuote } from '@/types';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';

/**
 * Hook：添加流动性表单
 *
 * 管理表单状态，包括报价、加载状态、错误等
 *
 * @returns 表单状态和方法
 *
 * @example
 * const { quote, isLoading, error, calculateQuote, reset } = useAddLiquidityForm();
 *
 * const handleCalculate = async () => {
 *   const quote = await calculateQuote({
 *     tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *     tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *     amountA: '1.0',
 *     amountB: '10.0',
 *     slippage: '0.5',
 *   });
 * };
 */
export function useAddLiquidityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<LiquidityQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 计算流动性报价
   *
   * @param params - 获取报价参数
   * @returns 流动性报价
   */
  const calculateQuote = useCallback(
    async (params: GetLiquidityQuoteParams): Promise<LiquidityQuote> => {
      try {
        setIsLoading(true);
        setError(null);

        // 调用查询层的纯函数
        const newQuote = await getLiquidityQuote(params);

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
    isLoading,
    quote,
    error,

    // 方法
    calculateQuote,
    reset,
  };
}
