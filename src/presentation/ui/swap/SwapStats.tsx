'use client';

/**
 * 子组件：Swap 统计信息
 * Sub-component: Swap Stats
 *
 * 职责：
 * - 显示价格信息
 * - 显示价格影响
 * - 显示最小接收数量
 * - 显示流动性提供者费用
 */

import { Info, Clock } from 'lucide-react';
import type { SwapStats as SwapStatsType } from '@/presentation/hooks/useSwapForm';

interface SwapStatsProps {
  stats: SwapStatsType | null;
  lastUpdateTime: Date | null;
  priceImpactWarning: boolean;
}

export function SwapStats({ stats, lastUpdateTime, priceImpactWarning }: SwapStatsProps) {
  if (!stats) return null;

  return (
    <div className='bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3'>
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
          <Info className='w-4 h-4' />
          <span>执行价格</span>
        </div>
        <span className='font-semibold text-slate-900 dark:text-white'>
          {stats.executionPrice.toFixed(6)}
        </span>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <span className='text-slate-600 dark:text-slate-400'>价格影响</span>
        <span
          className={`font-semibold ${
            priceImpactWarning ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
          }`}
        >
          {stats.priceImpact.toFixed(2)}%
        </span>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <span className='text-slate-600 dark:text-slate-400'>最小接收</span>
        <span className='font-semibold text-slate-900 dark:text-white'>
          {stats.minimumReceived}
        </span>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <span className='text-slate-600 dark:text-slate-400'>路由</span>
        <span className='font-semibold text-slate-900 dark:text-white'>
          {stats.route.join(' → ')}
        </span>
      </div>

      {lastUpdateTime && (
        <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700'>
          <Clock className='w-3 h-3' />
          <span>更新于 {lastUpdateTime.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}
