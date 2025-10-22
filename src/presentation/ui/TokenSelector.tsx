'use client';

import { useState } from 'react';
import { ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { IToken, Token } from '@/domain/entities/Token';
import { useTokens } from '@/application/hooks/useTokens';

interface TokenSelectorProps {
  selectedToken?: IToken;
  onSelectToken: (token: IToken) => void;
  label?: string;
  balance?: string;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  label = 'Select a token',
  balance,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 从 API 获取代币列表（Token 类实例）
  const { tokens, isLoading } = useTokens();

  const filteredTokens = tokens.filter(
    token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectToken = (token: Token) => {
    // ⭐ 将 Token 类实例转换为 IToken 接口
    const tokenObject = token.toObject();

    // 调用父组件的回调函数
    onSelectToken(tokenObject);
    // 关闭弹窗
    setOpen(false);
    // 清空搜索框
    setSearchQuery('');
  };

  return (
    <>
      {/* Trigger Button - Compact Pill Style */}
      <Button
        type='button'
        onClick={() => setOpen(true)}
        className='h-10 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap'
      >
        <div className='flex items-center gap-2'>
          {selectedToken ? (
            <>
              <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs'>
                {selectedToken.symbol[0]}
              </div>
              <span>{selectedToken.symbol}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </div>
        <ChevronDown className='w-4 h-4' />
      </Button>

      {/* Dialog Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Search Section */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
              <Input
                placeholder='Search tokens'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-pink-500 text-sm'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>

            {/* Popular Tokens Label */}
            {!searchQuery && (
              <div className='pt-2'>
                <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                  Popular Tokens
                </p>
              </div>
            )}

            {/* Token List */}
            <div className='max-h-96 overflow-y-auto space-y-1'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-slate-400' />
                  <span className='ml-2 text-sm text-slate-500 dark:text-slate-400'>
                    Loading tokens...
                  </span>
                </div>
              ) : filteredTokens.length > 0 ? (
                filteredTokens.map(token => (
                  <button
                    key={token.symbol}
                    type='button'
                    onClick={() => handleSelectToken(token)}
                    className='w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          className='w-10 h-10 rounded-full flex-shrink-0'
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>
                          {token.symbol[0]}
                        </div>
                      )}
                      <div className='text-left'>
                        <div className='font-semibold text-slate-900 dark:text-white text-sm'>
                          {token.symbol}
                        </div>
                        <div className='text-xs text-slate-500 dark:text-slate-400'>
                          {token.name}
                        </div>
                      </div>
                    </div>
                    {selectedToken?.symbol === token.symbol && (
                      <div className='w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center'>
                        <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className='text-center py-8 text-slate-500 dark:text-slate-400 text-sm'>
                  No tokens found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
