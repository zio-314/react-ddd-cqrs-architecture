'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ConnectButton to avoid SSR issues
const DynamicConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then(mod => mod.ConnectButton),
  {
    ssr: false,
    loading: () => (
      <div className='w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse' />
    ),
  },
);

export function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className='w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg' />;
  }

  return <DynamicConnectButton />;
}
