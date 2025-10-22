'use client';

/**
 * 子组件：Swap 代币输入
 * Sub-component: Swap Token Input
 *
 * 职责：
 * - 显示代币输入框
 * - 显示余额
 * - 支持代币选择
 */

import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TokenSelector } from '../TokenSelector';
import type { IToken } from '@/domain/entities/Token';

interface SwapTokenInputProps {
  label: string;
  token: IToken | undefined;
  amount: string;
  balance?: string;
  isCalculating?: boolean;
  isDisabled?: boolean;
  readOnly?: boolean;
  onTokenChange: (token: IToken) => void;
  onAmountChange?: (amount: string) => void;
}

export function SwapTokenInput({
  label,
  token,
  amount,
  balance,
  isCalculating = false,
  readOnly = false,
  onTokenChange,
  onAmountChange,
}: SwapTokenInputProps) {
  return (
    <div className='space-y-2'>
      <div className='flex justify-between items-center px-1'>
        <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>{label}</label>
        <span className='text-xs text-slate-500 dark:text-slate-400'>
          余额: {balance || '0.00'}
        </span>
      </div>
      <div className='bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-lg'>
        <div className='flex items-center justify-between gap-4'>
          {/* Input Section - Left Side */}
          <div className='flex-1 flex items-center justify-start'>
            <Input
              type='text'
              placeholder='0'
              value={amount}
              onChange={e => onAmountChange?.(e.target.value)}
              // disabled={isCalculating || isDisabled}
              readOnly={readOnly}
              className='!text-3xl font-bold bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-300 disabled:opacity-50 w-full shadow-none focus-visible:ring-0'
            />
            {isCalculating && amount && (
              <Loader2 className='w-5 h-5 text-slate-400 animate-spin flex-shrink-0 ml-2' />
            )}
          </div>

          {/* Token Selector Section - Right Side */}
          <div className='flex-shrink-0'>
            <TokenSelector selectedToken={token} onSelectToken={onTokenChange} label='选择代币' />
          </div>
        </div>
      </div>
    </div>
  );
}
