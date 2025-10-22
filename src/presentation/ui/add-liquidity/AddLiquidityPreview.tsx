'use client';

/**
 * 子组件：添加流动性预览
 * Sub-component: Add Liquidity Preview
 *
 * 职责：
 * - 显示将要添加的流动性信息
 * - 显示价格和池份额
 * - 显示操作按钮
 */

import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoRow } from '../shared/InfoRow';
import { LiquidityQuote } from '@/types';

interface AddLiquidityPreviewProps {
  quote: LiquidityQuote;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  isAdding: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AddLiquidityPreview({
  quote,
  tokenASymbol = 'Token A',
  tokenBSymbol = 'Token B',
  isAdding,
  onCancel,
  onConfirm,
}: AddLiquidityPreviewProps) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'>
      <h3 className='text-lg font-semibold mb-4'>Preview</h3>

      <div className='space-y-3'>
        {/* You will add */}
        <div className='flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700'>
          <span className='text-slate-600 dark:text-slate-400'>You will add:</span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-slate-600 dark:text-slate-400'>{tokenASymbol}</span>
          <span className='font-medium text-lg'>{parseFloat(quote.amount0).toFixed(6)}</span>
        </div>

        <div className='flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700'>
          <span className='text-slate-600 dark:text-slate-400'>{tokenBSymbol}</span>
          <span className='font-medium text-lg'>{parseFloat(quote.amount1).toFixed(6)}</span>
        </div>

        {/* Minimum amounts */}
        <InfoRow
          label={`Minimum ${tokenASymbol}:`}
          value={parseFloat(quote.amount0Min).toFixed(6)}
        />

        <InfoRow
          label={`Minimum ${tokenBSymbol}:`}
          value={parseFloat(quote.amount1Min).toFixed(6)}
        />

        {/* Prices */}
        <InfoRow
          label={`${tokenASymbol} per ${tokenBSymbol}:`}
          value={(parseFloat(quote.amount0) / parseFloat(quote.amount1)).toFixed(6)}
        />

        <InfoRow
          label={`${tokenBSymbol} per ${tokenASymbol}:`}
          value={(parseFloat(quote.amount1) / parseFloat(quote.amount0)).toFixed(6)}
        />

        {/* Pool share */}
        <InfoRow label='Pool Share:' value={`${quote.poolShare.toFixed(2)}%`} highlight />
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
                This addition will have a significant impact on the pool. Consider adding a smaller
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
          disabled={isAdding}
          className='flex-1'
        >
          Cancel
        </Button>
        <Button
          type='button'
          onClick={onConfirm}
          disabled={isAdding}
          className='flex-1 bg-sky-500 hover:bg-sky-600 text-white'
        >
          {isAdding ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
              Adding...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Plus className='w-4 h-4' />
              Add Liquidity
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}
