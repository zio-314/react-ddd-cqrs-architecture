'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddLiquidityForm } from './AddLiquidityForm';
import { AlertCircle, CheckCircle, Info, ArrowLeft } from 'lucide-react';

interface AddLiquidityInterfaceProps {
  onBack?: () => void;
}

type SubmissionState = 'idle' | 'success' | 'error';

export function AddLiquidityInterface({ onBack }: AddLiquidityInterfaceProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [successData, setSuccessData] = useState<{ txHash: string; lpTokens: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = (txHash: string, lpTokens: string) => {
    setSuccessData({ txHash, lpTokens });
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
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Add Liquidity</h1>
            <p className='text-slate-600 dark:text-slate-400 mt-1'>
              Provide liquidity to earn trading fees
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
                When you add liquidity, you receive LP tokens representing your share of the pool.
                You&apos;ll earn a portion of trading fees proportional to your share.
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
                  Liquidity Added Successfully!
                </h3>
                <div className='space-y-2 text-sm text-green-800 dark:text-green-200 mb-4'>
                  <p>
                    <span className='font-semibold'>LP Tokens Received:</span>{' '}
                    {successData.lpTokens}
                  </p>
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
                  Add More Liquidity
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
            <AddLiquidityForm onSuccess={handleSuccess} onError={handleError} />
          </Card>
        )}

        {/* FAQ Section */}
        <div className='mt-12 space-y-4'>
          <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-6'>
            Frequently Asked Questions
          </h2>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              What are LP tokens?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              LP tokens represent your share of the liquidity pool. They can be redeemed for your
              portion of the pool&apos;s assets plus accumulated fees.
            </p>
          </Card>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              What is impermanent loss?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Impermanent loss occurs when the price ratio of your tokens changes significantly. The
              loss is &quot;impermanent&quot; because it can be recovered if prices return to their
              original ratio.
            </p>
          </Card>

          <Card className='p-4 border-slate-200 dark:border-slate-800'>
            <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
              How do I earn fees?
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Every trade in the pool incurs a 0.3% fee. This fee is distributed to liquidity
              providers proportional to their share of the pool.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
