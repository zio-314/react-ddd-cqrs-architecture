'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <Link href='/' className='flex items-center gap-2 font-bold text-xl'>
              <div className='w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold'>
                U
              </div>
              <span className='hidden sm:inline text-slate-900 dark:text-white'>Uniswap</span>
            </Link>
            <Badge
              variant='outline'
              className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 28 28'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='flex-shrink-0'
              >
                <path
                  d='M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28Z'
                  fill='#213147'
                />
                <path
                  d='M14.0001 22.8L8.40015 17.2L9.80015 15.8L14.0001 20L18.2001 15.8L19.6001 17.2L14.0001 22.8Z'
                  fill='#12AAFF'
                />
                <path
                  d='M14.0001 18.4L8.40015 12.8L9.80015 11.4L14.0001 15.6L18.2001 11.4L19.6001 12.8L14.0001 18.4Z'
                  fill='#9DCCED'
                />
                <path
                  d='M14.0001 14L8.40015 8.40002L9.80015 7.00002L14.0001 11.2L18.2001 7.00002L19.6001 8.40002L14.0001 14Z'
                  fill='#FFFFFF'
                />
              </svg>
              <span className='text-xs font-medium'>Arbitrum Sepolia</span>
            </Badge>
          </div>

          {/* Navigation - Desktop */}
          <nav className='hidden md:flex items-center gap-8'>
            <Link
              href='/'
              className='text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
            >
              Swap
            </Link>
            <Link
              href='/pool'
              className='text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
            >
              Pool
            </Link>
            <Link
              href='/tokens'
              className='text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
            >
              Tokens
            </Link>
            <Link
              href='/faucet'
              className='text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
            >
              Faucet
            </Link>
          </nav>

          {/* Right Section */}
          <div className='flex items-center gap-4'>
            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-lg'>
                  <Settings className='w-5 h-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuItem>
                  <span className='text-sm'>Slippage Tolerance</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className='text-sm'>Transaction Deadline</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className='text-sm'>Expert Mode</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Connect Wallet Button */}
            <div className='hidden sm:block'>
              <ConnectWalletButton />
            </div>

            {/* Mobile Menu */}
            <button className='md:hidden p-2' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className='md:hidden pb-4 space-y-2'>
            <Link
              href='/'
              className='block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            >
              Swap
            </Link>
            <Link
              href='/pool'
              className='block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            >
              Pool
            </Link>
            <Link
              href='/tokens'
              className='block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            >
              Tokens
            </Link>
            <Link
              href='/faucet'
              className='block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            >
              Faucet
            </Link>
            <div className='mt-4'>
              <ConnectWalletButton />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
