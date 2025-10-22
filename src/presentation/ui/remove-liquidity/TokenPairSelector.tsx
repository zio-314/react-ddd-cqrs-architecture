'use client';

/**
 * 子组件：代币对选择器
 * Sub-component: Token Pair Selector
 *
 * 职责：
 * - 选择 Token A 和 Token B
 * - 显示箭头分隔符
 */

import { ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TokenSelector } from '../TokenSelector';
import type { IToken } from '@/domain/entities/Token';
import type { UseFormReturn } from 'react-hook-form';
import type { RemoveLiquidityFormValues } from '@/application/validators/liquidity';

interface TokenPairSelectorProps {
  form: UseFormReturn<RemoveLiquidityFormValues>;
  fromToken?: IToken;
  toToken?: IToken;
  onFromTokenChange: (token: IToken | undefined) => void;
  onToTokenChange: (token: IToken | undefined) => void;
}

export function TokenPairSelector({
  form,
  fromToken,
  toToken,
  onFromTokenChange,
  onToTokenChange,
}: TokenPairSelectorProps) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800'>
      {/* Token A Selector */}
      <FormField
        control={form.control}
        name='tokenA'
        render={() => (
          <FormItem>
            <FormLabel>Token A</FormLabel>
            <FormControl>
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={onFromTokenChange}
                label='Select Token A'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Arrow Down */}
      <div className='flex justify-center my-4'>
        <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800'>
          <ArrowDown className='w-5 h-5 text-slate-600 dark:text-slate-400' />
        </div>
      </div>

      {/* Token B Selector */}
      <FormField
        control={form.control}
        name='tokenB'
        render={() => (
          <FormItem>
            <FormLabel>Token B</FormLabel>
            <FormControl>
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={onToTokenChange}
                label='Select Token B'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
