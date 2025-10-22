'use client';

/**
 * 重构后的移除流动性表单
 * Refactored Remove Liquidity Form
 *
 * 职责：
 * - 协调子组件
 * - 管理表单状态
 * - 处理业务逻辑
 *
 * 子组件：
 * - TokenPairSelector - 代币对选择
 * - LPTokenInfo - LP Token 信息
 * - AmountSlider - 数量滑块
 * - SlippageInput - 滑点输入
 * - RemoveLiquidityPreview - 预览
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  removeLiquidityFormSchema,
  RemoveLiquidityFormValues,
} from '@/application/validators/liquidity';
import { useRemoveLiquidityForm } from '@/presentation/hooks/useRemoveLiquidityForm';
import { useRemoveLiquidity, useLPTokenBalance } from '@/application/hooks/useRemoveLiquidity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import type { IToken } from '@/domain/entities/Token';

// 子组件
import { TokenPairSelector } from './remove-liquidity/TokenPairSelector';
import { LPTokenInfo } from './remove-liquidity/LPTokenInfo';
import { AmountSlider } from './remove-liquidity/AmountSlider';
import { SlippageInput } from './shared/SlippageInput';
import { RemoveLiquidityPreview } from './remove-liquidity/RemoveLiquidityPreview';
import { ErrorAlert } from './shared/ErrorAlert';
import { SuccessAlert } from './shared/SuccessAlert';

interface RemoveLiquidityFormProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function RemoveLiquidityForm({ onSuccess, onError }: RemoveLiquidityFormProps) {
  const [fromToken, setFromToken] = useState<IToken | undefined>();
  const [toToken, setToToken] = useState<IToken | undefined>();
  const [showPreview, setShowPreview] = useState(false);
  const [percentage, setPercentage] = useState(25);

  // Hooks
  const {
    quote,
    isLoading: isCalculating,
    error: quoteError,
    calculateQuote,
    reset: resetForm,
    defaultSlippage,
  } = useRemoveLiquidityForm();
  const {
    removeLiquidity,
    isLoading: isRemoving,
    isSuccess,
    error: removeError,
    data: removeData,
  } = useRemoveLiquidity();
  const { data: lpTokenInfo, isLoading: isLoadingBalance } = useLPTokenBalance({
    tokenA: fromToken,
    tokenB: toToken,
  });

  // Form
  const form = useForm<RemoveLiquidityFormValues>({
    resolver: zodResolver(removeLiquidityFormSchema),
    defaultValues: {
      liquidity: '',
      percentage: 25,
      slippage: defaultSlippage,
    },
  });

  // 当 LP Token 余额加载完成后，更新表单
  useEffect(() => {
    if (lpTokenInfo && fromToken && toToken) {
      form.setValue('tokenA', {
        address: fromToken.address as `0x${string}`,
        symbol: fromToken.symbol,
        name: fromToken.name || fromToken.symbol,
        decimals: fromToken.decimals,
      });
      form.setValue('tokenB', {
        address: toToken.address as `0x${string}`,
        symbol: toToken.symbol,
        name: toToken.name || toToken.symbol,
        decimals: toToken.decimals,
      });
    }
  }, [lpTokenInfo, fromToken, toToken, form]);

  // 当百分比改变时，更新流动性数量
  useEffect(() => {
    if (lpTokenInfo && percentage > 0) {
      const liquidityAmount = ((parseFloat(lpTokenInfo.balance) * percentage) / 100).toFixed(18);
      form.setValue('liquidity', liquidityAmount);
      form.setValue('percentage', percentage);
    }
  }, [percentage, lpTokenInfo, form]);

  // 计算报价
  const handleCalculateQuote = async () => {
    if (!lpTokenInfo || !fromToken || !toToken) {
      return;
    }

    const values = form.getValues();

    try {
      await calculateQuote({
        lpTokenInfo,
        liquidityAmount: values.liquidity,
        slippage: values.slippage,
      });
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to calculate quote:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to calculate quote');
    }
  };

  // 提交表单
  const handleSubmit = async (values: RemoveLiquidityFormValues) => {
    if (!quote || !lpTokenInfo || !fromToken || !toToken) {
      return;
    }

    try {
      removeLiquidity({
        pairAddress: lpTokenInfo.pairAddress as `0x${string}`,
        params: {
          token0: {
            address: fromToken.address,
            symbol: fromToken.symbol,
            name: fromToken.name,
            decimals: fromToken.decimals,
          },
          token1: {
            address: toToken.address,
            symbol: toToken.symbol,
            name: toToken.name,
            decimals: toToken.decimals,
          },
          liquidity: values.liquidity,
          slippage: values.slippage,
        },
        quote,
      });
    } catch (err) {
      console.error('Failed to remove liquidity:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to remove liquidity');
    }
  };

  // 成功后的处理
  useEffect(() => {
    if (isSuccess && removeData) {
      onSuccess?.(removeData.txHash);
      resetForm();
      setShowPreview(false);
      form.reset();
    }
  }, [isSuccess, removeData, onSuccess, resetForm, form]);

  // 错误处理
  useEffect(() => {
    if (removeError) {
      onError?.(removeError);
    }
  }, [removeError, onError]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Token Pair Selector */}
        <TokenPairSelector
          form={form}
          fromToken={fromToken}
          toToken={toToken}
          onFromTokenChange={setFromToken}
          onToTokenChange={setToToken}
        />

        {/* LP Token Info */}
        {lpTokenInfo && (
          <LPTokenInfo
            lpTokenInfo={lpTokenInfo}
            tokenASymbol={fromToken?.symbol}
            tokenBSymbol={toToken?.symbol}
          />
        )}

        {/* Amount Slider */}
        {lpTokenInfo && (
          <>
            <AmountSlider percentage={percentage} onPercentageChange={setPercentage} />

            {/* Hidden Fields */}
            <FormField
              control={form.control}
              name='liquidity'
              render={({ field }) => (
                <FormItem className='hidden'>
                  <FormControl>
                    <Input {...field} type='hidden' />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='percentage'
              render={({ field }) => (
                <FormItem className='hidden'>
                  <FormControl>
                    <Input {...field} type='hidden' value={percentage} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        {/* Slippage Input */}
        <SlippageInput form={form} name='slippage' />

        {/* Error Display */}
        {(quoteError || removeError) && <ErrorAlert message={quoteError || removeError || ''} />}

        {/* Calculate Button */}
        {!showPreview && (
          <Button
            type='button'
            onClick={handleCalculateQuote}
            disabled={
              isCalculating ||
              isLoadingBalance ||
              !lpTokenInfo ||
              !fromToken ||
              !toToken ||
              percentage === 0
            }
            className='w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isCalculating ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Calculating...
              </div>
            ) : isLoadingBalance ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Loading Balance...
              </div>
            ) : (
              'Calculate & Preview'
            )}
          </Button>
        )}

        {/* Preview Section */}
        {showPreview && quote && (
          <RemoveLiquidityPreview
            quote={quote}
            tokenASymbol={fromToken?.symbol}
            tokenBSymbol={toToken?.symbol}
            isRemoving={isRemoving}
            onCancel={() => {
              setShowPreview(false);
              resetForm();
            }}
            onConfirm={form.handleSubmit(handleSubmit)}
          />
        )}

        {/* Success Message */}
        {isSuccess && removeData && (
          <SuccessAlert message='Liquidity Removed Successfully!' txHash={removeData.txHash} />
        )}
      </form>
    </Form>
  );
}
