'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const FaucetForm = dynamic(
  () =>
    import('@/presentation/ui/FaucetForm').then(mod => ({
      default: mod.FaucetForm,
    })),
  {
    loading: () => (
      <div className='w-full max-w-md mx-auto h-96 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />
    ),
  },
);

export default function FaucetPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
      <Header />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Faucet Form - Centered */}
        <div className='max-w-md mx-auto'>
          <FaucetForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
