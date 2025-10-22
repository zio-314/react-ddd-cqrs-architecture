import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'https://app.elfi.xyz/tokens/ETH.svg',
      price: '$2,345.67',
      change: '+5.2%',
      volume: '$12.4B',
      liquidity: '$5.8B',
      positive: true,
      decimals: 18,
      address: '0x0e53A1e35cAfe2d7Ae3C9640f6FA264CAFa94168',
    },
    {
      symbol: 'BTC',
      name: 'Wrapped Bitcoin',
      icon: 'https://app.elfi.xyz/tokens/BTC.svg',
      price: '$42,567.89',
      change: '+3.8%',
      volume: '$3.2B',
      liquidity: '$2.1B',
      positive: true,
      decimals: 8,
      address: '0x6267CadFaB5Acbe6059C0Fa9eaF4033552fbB699',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'https://app.elfi.xyz/tokens/USDC.svg',
      price: '$1.00',
      change: '+0.1%',
      volume: '$8.2B',
      liquidity: '$3.2B',
      positive: true,
      decimals: 6,
      address: '0x39178499db768d39AB2Bac060462B2B0D51C011C',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: 'https://app.elfi.xyz/tokens/USDT.svg',
      price: '$0.99',
      change: '-0.2%',
      volume: '$6.8B',
      liquidity: '$2.8B',
      positive: false,
      decimals: 6,
      address: '0xaBCaba07136B2928c42023ec414D5cFA3938ABEc',
    },
  ]);
}
