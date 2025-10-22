import { z } from 'zod';
import { CONTRACT_ADDRESSES } from '@/infrastructure/blockchain';

/**
 * Faucet Token 配置
 * 所有地址从 constants/addresses.ts 导入
 */
export const FAUCET_TOKENS = {
  BTC: {
    address: CONTRACT_ADDRESSES.BTC,
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    defaultAmount: '0.1',
  },
  ETH: {
    address: CONTRACT_ADDRESSES.ETH,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    defaultAmount: '1',
  },
  USDC: {
    address: CONTRACT_ADDRESSES.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    defaultAmount: '100',
  },
  USDT: {
    address: CONTRACT_ADDRESSES.USDT,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    defaultAmount: '100',
  },
} as const;

export type FaucetTokenSymbol = keyof typeof FAUCET_TOKENS;

/**
 * Faucet 表单验证 Schema
 */
export const faucetFormSchema = z.object({
  token: z
    .enum(['BTC', 'ETH', 'USDC', 'USDT'])
    .refine(val => ['BTC', 'ETH', 'USDC', 'USDT'].includes(val), {
      message: 'Please select a valid token',
    }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number')
    .refine(val => Number(val) <= 10000, 'Amount cannot exceed 10000 per transaction'),
  recipientAddress: z
    .string()
    .min(1, 'Recipient address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type FaucetFormValues = z.infer<typeof faucetFormSchema>;

/**
 * Faucet 交易状态
 */
export enum FaucetTransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Faucet 交易结果
 */
export interface FaucetTransactionResult {
  status: FaucetTransactionStatus;
  txHash?: string;
  error?: string;
  token?: FaucetTokenSymbol;
  amount?: string;
  recipient?: string;
}
