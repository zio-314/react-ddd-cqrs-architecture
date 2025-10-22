'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Token {
  symbol: string;
  name: string;
  logo?: string;
}

interface PriceInfoProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  slippage: string;
}

export function PriceInfo({ fromToken, toToken, fromAmount, toAmount, slippage }: PriceInfoProps) {
  const [expanded, setExpanded] = useState(false);

  const price = fromAmount && toAmount ? (Number(toAmount) / Number(fromAmount)).toFixed(6) : '0';
  const priceImpact = '0.05';
  const minimumReceived = (Number(toAmount) * (1 - Number(slippage) / 100)).toFixed(6);
  const networkFee = '0.0025';

  return (
    <div className='space-y-2'>
      {/* Price Summary */}
      <Button
        onClick={() => setExpanded(!expanded)}
        variant='ghost'
        className='w-full justify-between px-4 py-2 h-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800'
      >
        <div className='text-left'>
          <div className='text-xs text-slate-500 dark:text-slate-400'>
            1 {fromToken.symbol} = {price} {toToken.symbol}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Expanded Details */}
      {expanded && (
        <div className='bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-800'>
          {/* Price Impact */}
          <div className='flex justify-between items-center'>
            <span className='text-sm text-slate-600 dark:text-slate-400'>Price Impact</span>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-slate-900 dark:text-white'>
                {priceImpact}%
              </span>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
            </div>
          </div>

          {/* Minimum Received */}
          <div className='flex justify-between items-center'>
            <span className='text-sm text-slate-600 dark:text-slate-400'>Minimum Received</span>
            <span className='text-sm font-medium text-slate-900 dark:text-white'>
              {minimumReceived} {toToken.symbol}
            </span>
          </div>

          {/* Slippage Tolerance */}
          <div className='flex justify-between items-center'>
            <span className='text-sm text-slate-600 dark:text-slate-400'>Slippage Tolerance</span>
            <span className='text-sm font-medium text-slate-900 dark:text-white'>{slippage}%</span>
          </div>

          {/* Network Fee */}
          <div className='flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700'>
            <span className='text-sm text-slate-600 dark:text-slate-400'>Network Fee</span>
            <span className='text-sm font-medium text-slate-900 dark:text-white'>
              ~${networkFee}
            </span>
          </div>

          {/* Route */}
          <div className='pt-3 border-t border-slate-200 dark:border-slate-700'>
            <div className='text-xs text-slate-600 dark:text-slate-400 mb-2'>Route</div>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-medium text-slate-900 dark:text-white'>{fromToken.symbol}</span>
              <div className='flex-1 mx-2 h-px bg-slate-300 dark:bg-slate-600'></div>
              <span className='font-medium text-slate-900 dark:text-white'>{toToken.symbol}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
