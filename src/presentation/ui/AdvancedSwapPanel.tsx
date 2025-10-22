'use client';

import { useState } from 'react';
import { ChevronDown, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdvancedSwapPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: string;
  onSlippageChange: (value: string) => void;
}

export function AdvancedSwapPanel({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
}: AdvancedSwapPanelProps) {
  const [gasPrice, setGasPrice] = useState<'standard' | 'fast' | 'instant'>('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const gasPrices = {
    standard: { label: 'Standard', time: '~30s', multiplier: 1 },
    fast: { label: 'Fast', time: '~15s', multiplier: 1.5 },
    instant: { label: 'Instant', time: '~5s', multiplier: 2 },
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center'>
      <Card className='w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'>
        <div className='p-6 space-y-6'>
          {/* Header */}
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Advanced Settings</h3>
            <Button onClick={onClose} variant='ghost' size='icon' className='rounded-lg'>
              ✕
            </Button>
          </div>

          {/* Slippage Tolerance */}
          <div className='space-y-3'>
            <label className='text-sm font-semibold text-slate-900 dark:text-white'>
              Slippage Tolerance
            </label>
            <div className='flex gap-2'>
              {['0.1', '0.5', '1.0'].map(value => (
                <Button
                  key={value}
                  onClick={() => onSlippageChange(value)}
                  variant={slippage === value ? 'default' : 'outline'}
                  className='flex-1 text-sm'
                >
                  {value}%
                </Button>
              ))}
            </div>
            <div className='flex gap-2'>
              <input
                type='number'
                value={slippage}
                onChange={e => onSlippageChange(e.target.value)}
                placeholder='Custom'
                className='flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm'
              />
              <span className='flex items-center text-slate-500 dark:text-slate-400'>%</span>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Your transaction will revert if the price changes unfavorably by more than this
              percentage.
            </p>
          </div>

          {/* Gas Price */}
          <div className='space-y-3'>
            <label className='text-sm font-semibold text-slate-900 dark:text-white'>
              Gas Price
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(Object.keys(gasPrices) as Array<keyof typeof gasPrices>).map(key => (
                <Button
                  key={key}
                  onClick={() => setGasPrice(key)}
                  variant={gasPrice === key ? 'default' : 'outline'}
                  className='flex flex-col items-center gap-1 h-auto py-3'
                >
                  <span className='text-sm font-semibold'>{gasPrices[key].label}</span>
                  <span className='text-xs text-slate-500 dark:text-slate-400'>
                    {gasPrices[key].time}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className='space-y-3'>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant='ghost'
              className='w-full justify-between px-0'
            >
              <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                Advanced Options
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </Button>

            {showAdvanced && (
              <div className='space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700'>
                {/* MEV Protection */}
                <div className='flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900'>
                  <div className='flex items-center gap-2'>
                    <Zap className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                    <span className='text-sm font-medium text-slate-900 dark:text-white'>
                      MEV Protection
                    </span>
                  </div>
                  <input type='checkbox' defaultChecked className='w-4 h-4 rounded' />
                </div>

                {/* Price Impact Warning */}
                <div className='flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'>
                  <AlertTriangle className='w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0' />
                  <div className='text-xs text-orange-800 dark:text-orange-200'>
                    High slippage may result in a worse price or failed transaction.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className='p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'>
            <div className='flex gap-2'>
              <TrendingUp className='w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5' />
              <p className='text-xs text-sky-800 dark:text-sky-200'>
                These settings affect your transaction execution. Adjust carefully to balance speed
                and cost.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className='w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg'
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
