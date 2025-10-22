'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className='border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          {/* Brand */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 font-bold text-lg'>
              <div className='w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold'>
                U
              </div>
              <span className='text-slate-900 dark:text-white'>Uniswap</span>
            </div>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              The leading decentralized exchange for swapping tokens on Ethereum and other
              blockchains.
            </p>
          </div>

          {/* Product */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>Product</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href='/swap'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  Swap
                </Link>
              </li>
              <li>
                <Link
                  href='/pool'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  Pool
                </Link>
              </li>
              <li>
                <Link
                  href='/tokens'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  Tokens
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>Developers</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href='#'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>Community</h3>
            <div className='flex gap-4'>
              <Link
                href='#'
                className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
              >
                <Twitter className='w-5 h-5' />
              </Link>
              <Link
                href='#'
                className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
              >
                <Github className='w-5 h-5' />
              </Link>
              <Link
                href='#'
                className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
              >
                <Linkedin className='w-5 h-5' />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className='border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            © 2024 Uniswap Labs. All rights reserved.
          </p>
          <div className='flex gap-6 text-sm'>
            <Link
              href='#'
              className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='#'
              className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
