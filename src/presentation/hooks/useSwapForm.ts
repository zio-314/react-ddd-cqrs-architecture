/**
 * 表现层 Hook：useSwapForm
 * Presentation Layer Hook: useSwapForm
 *
 * 管理 Swap 表单的 UI 状态
 */

import { useState, useCallback, useEffect } from 'react';
import { useSwap } from '@/application/hooks/useSwap';
import { IToken } from '@/domain/entities/Token';
import { Slippage } from '@/domain/value-objects/Slippage';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';
import { useTokenSelectionStore } from '@/stores/useTokenSelectionStore';
import { useTokens } from '@/application/hooks/useTokens';

/**
 * Swap 统计信息
 */
export interface SwapStats {
  priceImpact: number;
  minimumReceived: string;
  executionPrice: number;
  route: string[];
}

/**
 * useSwapForm Hook
 *
 * 管理 Swap 表单的所有 UI 状态
 */
export function useSwapForm() {
  const { getAmountOut } = useSwap();

  // 获取代币列表
  const { tokens } = useTokens();

  // 从全局状态获取默认滑点
  const defaultSlippage = useUserPreferencesStore(state => state.defaultSlippage);

  // 从全局状态获取代币选择操作
  const addRecentToken = useTokenSelectionStore(state => state.addRecentToken);

  // 代币选择
  const [fromToken, setFromToken] = useState<IToken | undefined>();
  const [toToken, setToToken] = useState<IToken | undefined>();

  // 金额输入
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  // 滑点设置（使用全局默认值）
  const [slippage, setSlippage] = useState(defaultSlippage);

  // UI 状态
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 统计信息
  const [swapStats, setSwapStats] = useState<SwapStats | null>(null);
  const [priceImpactWarning, setPriceImpactWarning] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 错误处理
  const [error, setError] = useState<string | null>(null);

  /**
   * 计算交换统计信息
   */
  const calculateSwapStats = useCallback(
    (inputAmount: string, outputAmount: string): SwapStats | null => {
      if (
        !inputAmount ||
        !outputAmount ||
        isNaN(Number(inputAmount)) ||
        isNaN(Number(outputAmount))
      ) {
        return null;
      }

      const amountNum = Number(inputAmount);
      const toAmountNum = Number(outputAmount);
      const executionPrice = toAmountNum / amountNum;

      // 计算价格影响（简化计算，实际应该从链上获取）
      const priceImpact = 0.3; // 0.3% 手续费

      // 计算最小接收金额（考虑滑点）
      const slippageObj = Slippage.fromString(slippage);
      const minimumReceived = (toAmountNum * (1 - slippageObj.getValue())).toFixed(6);

      return {
        priceImpact,
        minimumReceived,
        executionPrice,
        route: [fromToken?.symbol || '', toToken?.symbol || ''],
      };
    },
    [fromToken, toToken, slippage],
  );

  /**
   * 重新计算输出金额
   */
  const recalculateAmountOut = useCallback(
    async (inputAmount: string, tokenIn: IToken, tokenOut: IToken) => {
      if (!inputAmount || isNaN(Number(inputAmount))) {
        setToAmount('');
        setSwapStats(null);
        setPriceImpactWarning(false);
        return;
      }

      try {
        setIsCalculating(true);
        setError(null);

        // 调用业务逻辑获取输出金额
        const amountOut = await getAmountOut({
          tokenIn: {
            address: tokenIn.address,
            symbol: tokenIn.symbol,
            name: tokenIn.name,
            decimals: tokenIn.decimals,
          },
          tokenOut: {
            address: tokenOut.address,
            symbol: tokenOut.symbol,
            name: tokenOut.name,
            decimals: tokenOut.decimals,
          },
          amountIn: inputAmount,
        });

        // 更新状态
        setToAmount(amountOut);

        // 计算统计信息
        const stats = calculateSwapStats(inputAmount, amountOut);
        setSwapStats(stats);
        setPriceImpactWarning(stats ? stats.priceImpact > 1 : false);
        setLastUpdateTime(new Date());
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to calculate amount';
        setError(errorMsg);
        setToAmount('');
        setSwapStats(null);
      } finally {
        setIsCalculating(false);
      }
    },
    [getAmountOut, calculateSwapStats],
  );

  /**
   * 设置 fromToken 并添加到最近使用
   */
  const handleSetFromToken = useCallback(
    (token: IToken | undefined) => {
      setFromToken(token);
      if (token) {
        addRecentToken(token);
      }
    },
    [addRecentToken],
  );

  /**
   * 设置 toToken 并添加到最近使用
   */
  const handleSetToToken = useCallback(
    (token: IToken | undefined) => {
      setToToken(token);
      if (token) {
        addRecentToken(token);
      }
    },
    [addRecentToken],
  );

  /**
   * 交换代币位置
   */
  const swapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  /**
   * 处理输入金额变化
   */
  const handleFromAmountChange = useCallback(
    async (value: string) => {
      setFromAmount(value);

      // 验证输入
      if (!fromToken || !toToken) {
        setToAmount('');
        setSwapStats(null);
        setPriceImpactWarning(false);
        return;
      }

      // 使用统一的重新计算函数
      await recalculateAmountOut(value, fromToken, toToken);
    },
    [fromToken, toToken, recalculateAmountOut],
  );

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 自动设置默认代币（当代币列表加载完成后）
   */
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      // 优先选择 ETH，如果没有则选择第一个代币
      const ethToken = tokens.find(token => token.symbol === 'ETH');
      const defaultToken = ethToken || tokens[0];

      if (defaultToken) {
        const tokenObject = defaultToken.toObject();
        setFromToken(tokenObject);
        addRecentToken(tokenObject);
      }
    }
  }, [tokens, fromToken, addRecentToken]);

  /**
   * 当 token 选择变化时，自动重新计算输出金额
   */
  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      recalculateAmountOut(fromAmount, fromToken, toToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken]);

  /**
   * 表单验证
   */
  const isValid = Boolean(fromToken && toToken && fromAmount && !isCalculating && !error);

  return {
    // 代币选择
    fromToken,
    toToken,
    setFromToken: handleSetFromToken,
    setToToken: handleSetToToken,
    swapTokens,

    // 金额输入
    fromAmount,
    toAmount,
    setFromAmount,
    handleFromAmountChange,

    // 滑点设置
    slippage,
    setSlippage,

    // UI 状态
    isCalculating,
    showSettings,
    setShowSettings,

    // 统计信息
    swapStats,
    priceImpactWarning,
    lastUpdateTime,

    // 错误处理
    error,
    clearError,

    // 表单验证
    isValid,
  };
}
