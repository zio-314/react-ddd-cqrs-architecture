'use client';

/**
 * 子组件：移除流动性预览
 * Sub-component: Remove Liquidity Preview
 *
 * 职责：
 * - 显示将要接收的代币数量
 * - 显示最小接收数量
 * - 显示池份额和价格影响
 * - 显示价格影响警告
 * - 显示操作按钮
 */

import { AlertCircle, Loader2, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoRow } from '../shared/InfoRow';
import { RemoveLiquidityQuote } from '@/types';

interface RemoveLiquidityPreviewProps {
  quote: RemoveLiquidityQuote;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  isRemoving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RemoveLiquidityPreview({
  quote,
  tokenASymbol = 'Token A',
  tokenBSymbol = 'Token B',
  isRemoving,
  onCancel,
  onConfirm,
}: RemoveLiquidityPreviewProps) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'>
      <h3 className='text-lg font-semibold mb-4'>Preview</h3>

      <div className='space-y-3'>
        {/* You will receive */}
        <div className='flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700'>
          <span className='text-slate-600 dark:text-slate-400'>You will receive:</span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-slate-600 dark:text-slate-400'>{tokenASymbol}</span>
          <span className='font-medium text-lg'>{parseFloat(quote.amount0).toFixed(6)}</span>
        </div>

        <div className='flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700'>
          <span className='text-slate-600 dark:text-slate-400'>{tokenBSymbol}</span>
          <span className='font-medium text-lg'>{parseFloat(quote.amount1).toFixed(6)}</span>
        </div>

        {/* Minimum received */}
        <InfoRow
          label={`Minimum ${tokenASymbol} received:`}
          value={parseFloat(quote.amount0Min).toFixed(6)}
        />

        <InfoRow
          label={`Minimum ${tokenBSymbol} received:`}
          value={parseFloat(quote.amount1Min).toFixed(6)}
        />

        {/* Pool share */}
        <InfoRow label='Pool Share:' value={`${quote.poolShare.toFixed(2)}%`} />

        {/* Price impact */}
        <div className='flex justify-between items-center text-sm'>
          <span className='text-slate-600 dark:text-slate-400'>Price Impact:</span>
          <span
            className={quote.priceImpact > 5 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}
          >
            {quote.priceImpact.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Price Impact Warning */}
      {quote.priceImpact > 5 && (
        <Card className='mt-4 p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-yellow-900 dark:text-yellow-100'>
                High Price Impact
              </p>
              <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-1'>
                This removal will have a significant impact on the pool. Consider removing a smaller
                amount.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 mt-6'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isRemoving}
          className='flex-1'
        >
          Cancel
        </Button>
        <Button
          type='button'
          onClick={onConfirm}
          disabled={isRemoving}
          className='flex-1 bg-red-600 hover:bg-red-700 text-white'
        >
          {isRemoving ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
              Removing...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Minus className='w-4 h-4' />
              Remove Liquidity
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}
