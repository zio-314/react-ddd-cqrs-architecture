'use client';

import dynamic from 'next/dynamic';

const SwapInterface = dynamic(
  () => import('./SwapInterface').then(mod => ({ default: mod.SwapInterface })),
  {
    ssr: false,
    loading: () => (
      <div className='w-full max-w-md mx-auto h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse' />
    ),
  },
);

export function SwapInterfaceWrapper() {
  return <SwapInterface />;
}
