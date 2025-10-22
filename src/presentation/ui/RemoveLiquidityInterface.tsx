'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RemoveLiquidityForm } from './RemoveLiquidityForm';
import { AlertCircle, CheckCircle, Info, ArrowLeft } from 'lucide-react';

interface RemoveLiquidityInterfaceProps {
  onBack?: () => void;
}

type SubmissionState = 'idle' | 'success' | 'error';

export function RemoveLiquidityInterface({ onBack }: RemoveLiquidityInterfaceProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [successData, setSuccessData] = useState<{ txHash: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = (txHash: string) => {
    setSuccessData({ txHash });
    setSubmissionState('success');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSubmissionState('error');
  };

  const handleReset = () => {
    setSubmissionState('idle');
    setSuccessData(null);
    setErrorMessage(null);
  };

  return (
    <div className='min-h-screen bg-white dark:bg-slate-950'>
      {/* Header */}
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center gap-4 mb-8'>
          {onBack && (
            <Button onClick={onBack} variant='ghost' size='icon' className='rounded-lg'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
          )}
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Remove Liquidity</h1>
            <p className='text-slate-600 dark:text-slate-400 mt-1'>
              Withdraw your tokens from the liquidity pool
            </p>
          </div>
        </div>

        {/* Info Box */}
        <Card className='p-4 mb-8 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20'>
          <div className='flex gap-3'>
            <Info className='w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5' />
            <div className='text-sm text-sky-800 dark:text-sky-200'>
              <p className='font-semibold mb-1'>How it works</p>
              <p>
                When you remove liquidity, you burn your LP tokens and receive back your share of
                the pool&apos;s tokens plus any accumulated fees.
              </p>
            </div>
          </div>
        </Card>

        {/* Success State */}
        {submissionState === 'success' && successData && (
          <Card className='p-6 mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'>
            <div className='flex gap-4'>
              <CheckCircle className='w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-bold text-green-900 dark:text-green-100 mb-2'>
                  Liquidity Removed Successfully!
                </h3>
                <div className='space-y-2 text-sm text-green-800 dark:text-green-200 mb-4'>
                  <p>Your tokens have been returned to your wallet.</p>
                  <p>
                    <span className='font-semibold'>Transaction Hash:</span>{' '}
                    <code className='bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs'>
                      {successData.txHash.slice(0, 10)}...{successData.txHash.slice(-8)}
                    </code>
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  className='bg-green-600 hover:bg-green-700 text-white'
                >
                  Remove More Liquidity
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {submissionState === 'error' && errorMessage && (
          <Card className='p-6 mb-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'>
            <div className='flex gap-4'>
              <AlertCircle className='w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-bold text-red-900 dark:text-red-100 mb-2'>
                  Transaction Failed
                </h3>
                <p className='text-sm text-red-800 dark:text-red-200 mb-4'>{errorMessage}</p>
                <Button onClick={handleReset} className='bg-red-600 hover:bg-red-700 text-white'>
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Form */}
        {submissionState === 'idle' && (
          <Card className='p-6 border-slate-200 dark:border-slate-800'>
            <RemoveLiquidityForm onSuccess={handleSuccess} onError={handleError} />
          </Card>
        )}

        {/* FAQ Section */}
        <div className='mt-12 space-y-4'>
          <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-6'>
            Frequently Asked Questions
          </h2>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              What happens when I remove liquidity?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Your LP tokens are burned and you receive back your proportional share of both tokens
              in the pool, plus any accumulated trading fees.
            </p>
          </Card>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              Can I remove partial liquidity?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Yes! You can choose to remove any percentage of your liquidity, from 1% to 100%. Use
              the slider to select your desired amount.
            </p>
          </Card>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              Will I get back the same tokens I deposited?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Not necessarily. The ratio of tokens you receive depends on the current pool ratio,
              which may have changed due to trading activity. This is related to impermanent loss.
            </p>
          </Card>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              What is slippage tolerance?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Slippage tolerance protects you from price changes during the transaction. If the pool
              ratio changes more than your tolerance, the transaction will revert.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
