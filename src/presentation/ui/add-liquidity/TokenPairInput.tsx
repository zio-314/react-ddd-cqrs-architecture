'use client';

/**
 * 子组件：添加流动性 - 代币对输入
 * Sub-component: Add Liquidity - Token Pair Input
 *
 * 职责：
 * - 显示 Token A 和 Token B 输入框
 * - 显示余额
 * - 支持交换代币位置
 */

import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TokenSelector } from '../TokenSelector';
import type { UseFormReturn } from 'react-hook-form';
import type { AddLiquidityFormValues } from '@/application/validators/liquidity';

interface TokenPairInputProps {
  form: UseFormReturn<AddLiquidityFormValues>;
  isLoading: boolean;
  onSwapTokens: () => void;
}

export function TokenPairInput({ form, isLoading, onSwapTokens }: TokenPairInputProps) {
  return (
    <>
      {/* Token A Input */}
      <Card className='p-6 border-slate-200 dark:border-slate-800'>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <FormLabel className='text-base font-semibold'>First Token</FormLabel>
            <span className='text-sm text-slate-500 dark:text-slate-400'>Balance: 10.5 ETH</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Token Selector */}
            <FormField
              control={form.control}
              name='tokenA'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TokenSelector
                      selectedToken={field.value}
                      onSelectToken={field.onChange}
                      label='Select token'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Input */}
            <FormField
              control={form.control}
              name='amountA'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='0.00'
                      step='0.000001'
                      min='0'
                      {...field}
                      disabled={isLoading}
                      className='text-lg font-semibold'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>

      {/* Swap Button */}
      <div className='flex justify-center'>
        <Button
          type='button'
          onClick={onSwapTokens}
          variant='outline'
          size='icon'
          className='rounded-full w-10 h-10 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
        >
          <ArrowDownUp className='w-4 h-4' />
        </Button>
      </div>

      {/* Token B Input */}
      <Card className='p-6 border-slate-200 dark:border-slate-800'>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <FormLabel className='text-base font-semibold'>Second Token</FormLabel>
            <span className='text-sm text-slate-500 dark:text-slate-400'>Balance: 5000 USDC</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Token Selector */}
            <FormField
              control={form.control}
              name='tokenB'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TokenSelector
                      selectedToken={field.value}
                      onSelectToken={field.onChange}
                      label='Select token'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Input */}
            <FormField
              control={form.control}
              name='amountB'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='0.00'
                      step='0.000001'
                      min='0'
                      {...field}
                      disabled={isLoading}
                      className='text-lg font-semibold'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>
    </>
  );
}
