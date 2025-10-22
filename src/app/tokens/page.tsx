'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useTokens } from '@/application/hooks/useTokens';

export const dynamic = 'force-dynamic';

export default function TokensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { tokens, isLoading, error } = useTokens();

  // 过滤 tokens
  const filteredTokens = tokens.filter(
    token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
      <Header />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>Tokens</h1>
          <p className='text-lg text-slate-600 dark:text-slate-400'>
            Explore and analyze tokens on Uniswap
          </p>
        </div>

        {/* Search */}
        <div className='mb-8 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
          <Input
            placeholder='Search tokens by name or symbol...'
            className='pl-10 py-3 rounded-lg'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tokens Table */}
        <Card className='border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden'>
          {isLoading ? (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='w-8 h-8 animate-spin text-slate-400' />
              <span className='ml-3 text-slate-600 dark:text-slate-400'>Loading tokens...</span>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-16'>
              <div className='text-center'>
                <p className='text-red-600 dark:text-red-400 font-semibold mb-2'>
                  Failed to load tokens
                </p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>{error.message}</p>
              </div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className='flex items-center justify-center py-16'>
              <p className='text-slate-600 dark:text-slate-400'>
                {searchQuery ? 'No tokens found matching your search' : 'No tokens available'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white'>
                      Token
                    </th>
                    <th className='px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white'>
                      Price
                    </th>
                    <th className='px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white'>
                      24h Change
                    </th>
                    <th className='px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white'>
                      24h Volume
                    </th>
                    <th className='px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white'>
                      Liquidity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token, index) => (
                    <tr
                      key={token.address}
                      className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                        index === filteredTokens.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          {token.logo ? (
                            <img
                              src={token.logo}
                              alt={token.symbol}
                              className='w-10 h-10 rounded-full'
                            />
                          ) : (
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                              {token.symbol[0]}
                            </div>
                          )}
                          <div>
                            <div className='font-semibold text-slate-900 dark:text-white'>
                              {token.symbol}
                            </div>
                            <div className='text-xs text-slate-500 dark:text-slate-400'>
                              {token.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right font-semibold text-slate-900 dark:text-white'>
                        {token.price}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div
                          className={`flex items-center justify-end gap-1 font-semibold ${
                            token.positive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {token.positive ? (
                            <TrendingUp className='w-4 h-4' />
                          ) : (
                            <TrendingDown className='w-4 h-4' />
                          )}
                          {token.change}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right text-slate-900 dark:text-white'>
                        {token.volume}
                      </td>
                      <td className='px-6 py-4 text-right text-slate-900 dark:text-white'>
                        {token.liquidity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
