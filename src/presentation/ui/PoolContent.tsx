'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLiquidityPools } from '@/application/hooks/useLiquidityPools';

interface PoolContentProps {
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
}

function PoolContent({ onAddLiquidity, onRemoveLiquidity }: PoolContentProps) {
  const { pools, isLoading, error } = useLiquidityPools();

  return (
    <>
      {/* Action Buttons */}
      <div className='flex gap-4 mb-8'>
        <Button
          onClick={onAddLiquidity}
          className='button-primary px-6 py-2 h-auto bg-sky-500 hover:bg-sky-600 text-white'
        >
          <Plus className='w-5 h-5 mr-2' />
          Add Liquidity
        </Button>
        <Button
          onClick={onRemoveLiquidity}
          className='button-secondary px-6 py-2 h-auto bg-red-600 hover:bg-red-700 text-white'
        >
          <Minus className='w-5 h-5 mr-2' />
          Remove Liquidity
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-sky-500 mr-3' />
          <span className='text-slate-600 dark:text-slate-400'>Loading pools...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className='border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 mb-6'>
          <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-200'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && pools.length === 0 && !error && (
        <Alert className='border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950'>
          <AlertCircle className='h-4 w-4 text-sky-500 dark:text-sky-400' />
          <AlertDescription className='text-sky-800 dark:text-sky-200'>
            No liquidity pools found. Create the first pool by adding liquidity!
          </AlertDescription>
        </Alert>
      )}

      {/* Pools Grid */}
      {!isLoading && pools.length > 0 && (
        <>
          <div className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
            Found {pools.length} liquidity pool{pools.length !== 1 ? 's' : ''}
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {pools.map(pool => {
              // 使用 Pool 实体的 getter 和业务方法
              const price = pool.getPrice();

              return (
                <Card
                  key={pool.address}
                  className='border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow'
                >
                  <div className='p-6 space-y-4'>
                    {/* Pool Header */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex -space-x-2'>
                          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm'>
                            {pool.token0.symbol[0]}
                          </div>
                          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm'>
                            {pool.token1.symbol[0]}
                          </div>
                        </div>
                        <div>
                          <h3 className='font-bold text-slate-900 dark:text-white'>
                            {pool.token0.symbol}/{pool.token1.symbol}
                          </h3>
                          <p className='text-xs text-slate-500 dark:text-slate-400'>Fee: 0.3%</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          {pool.token0.symbol} Reserve
                        </span>
                        <span className='font-semibold text-slate-900 dark:text-white'>
                          {pool.reserve0.toNumber().toFixed(4)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          {pool.token1.symbol} Reserve
                        </span>
                        <span className='font-semibold text-slate-900 dark:text-white'>
                          {pool.reserve1.toNumber().toFixed(4)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>Price</span>
                        <span className='font-semibold text-slate-900 dark:text-white'>
                          {price.toFixed(6)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          LP Tokens
                        </span>
                        <span className='font-semibold text-slate-900 dark:text-white'>
                          {pool.totalSupply.toNumber().toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={onAddLiquidity}
                      className='w-full button-primary py-2 h-auto bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white'
                    >
                      Add Liquidity
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default PoolContent;
