'use client';

/**
 * 重构后的 Swap 界面
 * Refactored Swap Interface
 *
 * 职责：
 * - 协调子组件
 * - 管理 Swap 状态
 * - 处理 Swap 逻辑
 */

import { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdvancedSwapPanel } from './AdvancedSwapPanel';
import { useSwap } from '@/application/hooks/useSwap';
import { useTokenBalance } from '@/application/hooks/useTokenBalance';
import { useSwapForm } from '@/presentation/hooks/useSwapForm';
import { useTokens } from '@/application/hooks/useTokens';
import { useAccount } from 'wagmi';
import { IToken } from '@/domain/entities/Token';

// 子组件
import { SwapTokenInput } from './swap/SwapTokenInput';
import { SwapStats } from './swap/SwapStats';
import { toast } from 'sonner';
import { ErrorAlert } from './shared/ErrorAlert';

export function SwapInterface() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();
  const { executeSwapAsync } = useSwap();

  // 从 API 获取代币列表
  const { tokens, isLoading: tokensLoading } = useTokens();

  // 使用 useSwapForm Hook 管理表单状态（不传默认代币，让 Hook 内部处理）
  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    fromAmount,
    toAmount,
    setFromAmount,
    handleFromAmountChange,
    slippage,
    setSlippage,
    isCalculating,
    showSettings,
    setShowSettings,
    swapStats,
    priceImpactWarning,
    lastUpdateTime,
    error,
    clearError,
    isValid,
  } = useSwapForm();

  const [isSwapping, setIsSwapping] = useState(false);

  // 获取 fromToken 的余额
  const { balance: fromTokenBalance } = useTokenBalance({
    tokenAddress: fromToken?.address || '',
    decimals: fromToken?.decimals || 18,
  });

  // 获取 toToken 的余额
  const { balance: toTokenBalance } = useTokenBalance({
    tokenAddress: toToken?.address || '',
    decimals: toToken?.decimals || 18,
  });

  if (!mounted) {
    return null;
  }

  /**
   * 处理 Swap 操作
   */
  const handleSwap = async () => {
    if (!isValid || !fromToken || !toToken) {
      return;
    }

    try {
      setIsSwapping(true);
      clearError();

      const result = await executeSwapAsync({
        tokenIn: {
          address: fromToken.address,
          symbol: fromToken.symbol,
          name: fromToken.name,
          decimals: fromToken.decimals,
        },
        tokenOut: {
          address: toToken.address,
          symbol: toToken.symbol,
          name: toToken.name,
          decimals: toToken.decimals,
        },
        amountIn: fromAmount,
        slippage,
      });

      // 交换成功，清空表单
      setFromAmount('');

      // 显示成功提示
      toast.success('Swap successful!', {
        description: `TX: ${result.txHash}`,
        duration: 5000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to execute swap';
      console.error('Swap failed:', errorMsg);
    } finally {
      setIsSwapping(false);
    }
  };

  const isSwapDisabled = !isValid || isSwapping || isCalculating;

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card className='border-0 rounded-3xl shadow-2xl overflow-hidden bg-white dark:bg-slate-950'>
        {/* Header */}
        <div className='px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Swap</h2>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>随时随地交换</p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant='ghost'
            size='icon'
            className='rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <Settings className='w-5 h-5 text-slate-600 dark:text-slate-400' />
          </Button>
        </div>

        {/* Advanced Settings Panel */}
        <AdvancedSwapPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          slippage={slippage}
          onSlippageChange={setSlippage}
        />

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* From Token */}
          <SwapTokenInput
            label='出售'
            token={fromToken}
            amount={fromAmount}
            balance={fromTokenBalance || undefined}
            isCalculating={isCalculating}
            isDisabled={isSwapping}
            onTokenChange={setFromToken}
            onAmountChange={handleFromAmountChange}
          />

          {/* Swap Button */}
          <div className='flex justify-center -my-3 relative z-10'>
            <Button
              onClick={swapTokens}
              disabled={isCalculating || isSwapping}
              variant='outline'
              size='icon'
              className='rounded-full w-14 h-14 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-700 hover:shadow-xl hover:scale-110 transition-all disabled:opacity-50 shadow-lg'
            >
              <ArrowDownUp className='w-6 h-6 text-slate-700 dark:text-slate-300' />
            </Button>
          </div>

          {/* To Token */}
          <SwapTokenInput
            label='购买'
            token={toToken}
            amount={toAmount}
            balance={toTokenBalance || undefined}
            isCalculating={isCalculating}
            readOnly
            onTokenChange={setToToken}
          />

          {/* Error Message */}
          {error && <ErrorAlert message={error} />}

          {/* Swap Stats */}
          {swapStats && fromToken && toToken && fromAmount && (
            <div className='bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-slate-600 dark:text-slate-400 font-medium'>价格影响</span>
                <span
                  className={`font-bold text-lg ${swapStats.priceImpact > 1 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                >
                  {swapStats.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className='h-px bg-slate-300 dark:bg-slate-600'></div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-slate-600 dark:text-slate-400 font-medium'>最少收到</span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {swapStats.minimumReceived} {toToken.symbol}
                </span>
              </div>
              <div className='h-px bg-slate-300 dark:bg-slate-600'></div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-slate-600 dark:text-slate-400 font-medium'>执行价格</span>
                <span className='font-bold text-slate-900 dark:text-white text-right'>
                  1 {fromToken.symbol} = {swapStats.executionPrice.toFixed(6)} {toToken.symbol}
                </span>
              </div>
              {lastUpdateTime && (
                <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700'>
                  {Math.round((Date.now() - lastUpdateTime.getTime()) / 1000)}秒前更新
                </div>
              )}
            </div>
          )}

          {/* Price Impact Warning */}
          {priceImpactWarning && (
            <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex gap-3'>
              <AlertCircle className='w-5 h-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5' />
              <div className='text-sm text-orange-800 dark:text-orange-200'>
                价格影响较高。请考虑减少金额或使用不同的路线。
              </div>
            </div>
          )}

          {/* Slippage Warning */}
          {Number(slippage) > 1 && (
            <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-3'>
              <AlertCircle className='w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5' />
              <div className='text-sm text-yellow-800 dark:text-yellow-200'>
                滑点容限较高 ({slippage}%)。您的交易可能会被抢先交易。
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            className='w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-2xl disabled:shadow-none hover:scale-105 disabled:scale-100'
          >
            {isSwapping ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-5 h-5 animate-spin' />
                交换中...
              </div>
            ) : isCalculating ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-5 h-5 animate-spin' />
                计算中...
              </div>
            ) : !fromToken || !toToken ? (
              '选择代币'
            ) : !fromAmount ? (
              '输入金额'
            ) : (
              '开始交换'
            )}
          </Button>

          {/* Info */}
          <div className='bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-4 flex gap-3'>
            <Info className='w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5' />
            <div className='text-xs text-sky-800 dark:text-sky-200 leading-relaxed'>
              购买和出售加密货币的网络超过 14 个，包括以太坊、Unichain 和 Base。
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
