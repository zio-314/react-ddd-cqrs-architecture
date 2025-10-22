'use client';

import { useState } from 'react';
import dynamicImport from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AddLiquidityInterface } from '@/presentation/ui/AddLiquidityInterface';
import { RemoveLiquidityInterface } from '@/presentation/ui/RemoveLiquidityInterface';
import { Loader2 } from 'lucide-react';

// 动态导入 PoolContent 以避免 SSR 问题
const PoolContent = dynamicImport(() => import('@/presentation/ui/PoolContent'), {
  loading: () => (
    <div className='flex items-center justify-center py-12'>
      <Loader2 className='w-8 h-8 animate-spin text-pink-500 mr-3' />
      <span className='text-slate-600 dark:text-slate-400'>Loading pools...</span>
    </div>
  ),
  ssr: false,
});

export const dynamic = 'force-dynamic';

type ViewMode = 'list' | 'add' | 'remove';

export default function PoolPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (viewMode === 'add') {
    return (
      <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
        <Header />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <AddLiquidityInterface onBack={() => setViewMode('list')} />
        </main>
        <Footer />
      </div>
    );
  }

  if (viewMode === 'remove') {
    return (
      <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
        <Header />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <RemoveLiquidityInterface onBack={() => setViewMode('list')} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
      <Header />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Liquidity Pools
          </h1>
          <p className='text-lg text-slate-600 dark:text-slate-400'>
            Earn fees by providing liquidity to trading pairs
          </p>
        </div>

        {/* Pool Content */}
        <PoolContent
          onAddLiquidity={() => setViewMode('add')}
          onRemoveLiquidity={() => setViewMode('remove')}
        />
      </main>

      <Footer />
    </div>
  );
}
