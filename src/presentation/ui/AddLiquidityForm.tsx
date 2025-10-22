'use client';

/**
 * 重构后的添加流动性表单
 * Refactored Add Liquidity Form
 *
 * 职责：
 * - 协调子组件
 * - 管理表单状态
 * - 处理业务逻辑
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addLiquidityFormSchema, AddLiquidityFormValues } from '@/application/validators/liquidity';
import { useAddLiquidityForm } from '@/presentation/hooks/useAddLiquidityForm';
import { useAddLiquidity } from '@/application/hooks/useAddLiquidity';
import { useTokens } from '@/application/hooks/useTokens';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { IToken } from '@/domain/entities/Token';

// 子组件
import { TokenPairInput } from './add-liquidity/TokenPairInput';
import { AddLiquidityPreview } from './add-liquidity/AddLiquidityPreview';
import { SlippageInput } from './shared/SlippageInput';
import { ErrorAlert } from './shared/ErrorAlert';
import { SuccessAlert } from './shared/SuccessAlert';

interface AddLiquidityFormProps {
  onSuccess?: (txHash: string, lpTokens: string) => void;
  onError?: (error: string) => void;
}

// 将 IToken 转换为普通对象，以符合 Zod schema
const tokenToObject = (token: IToken) => ({
  address: token.address,
  symbol: token.symbol,
  name: token.name,
  decimals: token.decimals,
});

export function AddLiquidityForm({ onSuccess, onError }: AddLiquidityFormProps) {
  const [showPreview, setShowPreview] = useState(false);

  // 从 API 获取代币列表
  const { tokens, isLoading: isLoadingTokens } = useTokens();

  // 表现层：管理表单 UI 状态
  const {
    quote,
    isLoading: isCalculating,
    error: quoteError,
    calculateQuote,
    reset: resetForm,
  } = useAddLiquidityForm();

  // 应用层：执行添加流动性操作
  const {
    addLiquidity,
    isLoading: isAdding,
    isSuccess,
    error: addError,
    data: addResult,
    reset: resetAdd,
  } = useAddLiquidity();

  const form = useForm<AddLiquidityFormValues>({
    resolver: zodResolver(addLiquidityFormSchema),
    defaultValues: {
      tokenA: tokens[0] ? tokenToObject(tokens[0]) : undefined,
      tokenB: tokens[1] ? tokenToObject(tokens[1]) : undefined,
      amountA: '',
      amountB: '',
      slippage: '0.5',
      priceImpactWarning: false,
    },
  });

  // 当 tokens 加载完成后，更新默认值
  useEffect(() => {
    if (tokens.length >= 2 && !form.getValues('tokenA')) {
      form.setValue('tokenA', tokenToObject(tokens[0]));
      form.setValue('tokenB', tokenToObject(tokens[1]));
    }
  }, [tokens, form]);

  const handleCalculateQuote = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const values = form.getValues();
      try {
        await calculateQuote({
          token0: values.tokenA,
          token1: values.tokenB,
          amount0: values.amountA,
          amount1: values.amountB,
          slippage: values.slippage,
        });
        setShowPreview(true);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to calculate quote');
      }
    }
  };

  const handleSubmit = async (values: AddLiquidityFormValues) => {
    if (!quote) {
      onError?.('Please calculate quote first');
      return;
    }

    try {
      addLiquidity(
        {
          tokenA: values.tokenA,
          tokenB: values.tokenB,
          amountA: values.amountA,
          amountB: values.amountB,
          slippage: parseFloat(values.slippage), // 转换为数字
        },
        {
          onSuccess: result => {
            setShowPreview(false);
            form.reset();
            resetForm();
            resetAdd();
            onSuccess?.(result.txHash, result.lpTokens);
          },
          onError: err => {
            onError?.(err instanceof Error ? err.message : 'Failed to add liquidity');
          },
        },
      );
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to submit liquidity');
    }
  };

  const isLoading = isCalculating || isAdding;
  const error = quoteError || addError;

  const swapTokens = () => {
    const tokenA = form.getValues('tokenA');
    const tokenB = form.getValues('tokenB');
    const amountA = form.getValues('amountA');
    const amountB = form.getValues('amountB');

    form.setValue('tokenA', tokenB);
    form.setValue('tokenB', tokenA);
    form.setValue('amountA', amountB);
    form.setValue('amountB', amountA);
  };

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          {/* Token Pair Input */}
          <TokenPairInput form={form} isLoading={isLoading} onSwapTokens={swapTokens} />

          {/* Slippage Input */}
          <SlippageInput form={form} name='slippage' />

          {/* Error Message */}
          {error && <ErrorAlert message={error} />}

          {/* Calculate Button */}
          {!showPreview && (
            <Button
              type='button'
              onClick={handleCalculateQuote}
              disabled={isLoading || !form.formState.isValid}
              className='w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg'
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Calculating...
                </div>
              ) : (
                'Calculate & Preview'
              )}
            </Button>
          )}

          {/* Preview Section */}
          {showPreview && quote && (
            <AddLiquidityPreview
              quote={quote}
              tokenASymbol={form.getValues('tokenA').symbol}
              tokenBSymbol={form.getValues('tokenB').symbol}
              isAdding={isAdding}
              onCancel={() => {
                setShowPreview(false);
                resetForm();
              }}
              onConfirm={form.handleSubmit(handleSubmit)}
            />
          )}

          {/* Success Message */}
          {isSuccess && addResult && (
            <SuccessAlert message='Liquidity added successfully!' txHash={addResult.txHash} />
          )}
        </form>
      </Form>
    </div>
  );
}
