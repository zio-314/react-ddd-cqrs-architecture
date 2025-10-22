'use client';

import { Header } from '@/components/Header';
import { SwapInterfaceWrapper } from '@/presentation/ui/SwapInterfaceWrapper';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
      <Header />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='flex justify-center'>
          {/* Swap Interface - Centered */}
          <SwapInterfaceWrapper />
        </div>
      </main>

      <Footer />
    </div>
  );
}
