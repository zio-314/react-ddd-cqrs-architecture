'use client';

/**
 * 共享组件：代币输入框
 * Shared Component: Token Input
 *
 * 职责：
 * - 显示代币选择器
 * - 显示金额输入框
 * - 显示余额
 * - 提供 Max 按钮
 *
 * 可复用于：
 * - SwapInterface
 * - AddLiquidityForm
 * - RemoveLiquidityForm
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from '../TokenSelector';
import type { IToken } from '@/domain/entities/Token';

interface TokenInputProps {
  label: string;
  token?: IToken;
  amount: string;
  balance?: string;
  onTokenChange: (token: IToken | undefined) => void;
  onAmountChange: (amount: string) => void;
  onMaxClick?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  showMaxButton?: boolean;
  placeholder?: string;
  error?: string;
}

export function TokenInput({
  label,
  token,
  amount,
  balance,
  onTokenChange,
  onAmountChange,
  onMaxClick,
  disabled = false,
  readOnly = false,
  showMaxButton = true,
  placeholder = '0.0',
  error,
}: TokenInputProps) {
  return (
    <div className='space-y-2'>
      {/* Label and Balance */}
      <div className='flex justify-between items-center'>
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>{label}</label>
        {balance && (
          <span className='text-xs text-gray-500 dark:text-gray-400'>Balance: {balance}</span>
        )}
      </div>

      {/* Input Container */}
      <div className='flex gap-2'>
        {/* Token Selector */}
        <TokenSelector selectedToken={token} onSelectToken={onTokenChange} />

        {/* Amount Input */}
        <div className='flex-1 relative'>
          <Input
            type='text'
            inputMode='decimal'
            placeholder={placeholder}
            value={amount}
            onChange={e => onAmountChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            className={`text-right text-lg font-medium ${
              error ? 'border-red-500 focus:ring-red-500' : ''
            }`}
          />

          {/* Max Button */}
          {showMaxButton && onMaxClick && balance && !disabled && !readOnly && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onMaxClick}
              className='absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs font-medium text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-900/20'
            >
              MAX
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className='text-xs text-red-500 dark:text-red-400'>{error}</p>}
    </div>
  );
}
