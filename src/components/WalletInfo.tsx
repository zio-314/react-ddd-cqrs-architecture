'use client';

import { useWallet } from '@/application/hooks/useWallet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WalletInfo() {
  const { address, isConnected, chain, balanceFormatted, balanceSymbol } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <Card className='p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700'>
      <div className='space-y-3'>
        <div>
          <p className='text-xs text-slate-600 dark:text-slate-400 mb-1'>Connected Address</p>
          <p className='text-sm font-mono font-semibold text-slate-900 dark:text-white break-all'>
            {address}
          </p>
        </div>

        {chain && (
          <div>
            <p className='text-xs text-slate-600 dark:text-slate-400 mb-1'>Network</p>
            <Badge
              variant='outline'
              className='bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
            >
              {chain.name}
            </Badge>
          </div>
        )}

        {balanceFormatted && (
          <div>
            <p className='text-xs text-slate-600 dark:text-slate-400 mb-1'>Balance</p>
            <p className='text-sm font-semibold text-slate-900 dark:text-white'>
              {parseFloat(balanceFormatted).toFixed(4)} {balanceSymbol}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
