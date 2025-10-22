import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationContainer } from '@/components/NotificationContainer';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Uniswap - Decentralized Exchange',
  description:
    'The leading decentralized exchange for swapping tokens on Ethereum and other blockchains.',
  keywords: ['DEX', 'Swap', 'Ethereum', 'DeFi', 'Uniswap'],
  authors: [{ name: 'Uniswap Labs' }],
  openGraph: {
    title: 'Uniswap - Decentralized Exchange',
    description: 'The leading decentralized exchange for swapping tokens.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ErrorBoundary>
            <Providers>
              {children}
              <NotificationContainer />
              <Toaster richColors position='top-right' />
            </Providers>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
