import { z } from 'zod';

/**
 * Token Schema（用于表单验证）
 */
const tokenSchema = z.object({
  address: z.custom<`0x${string}`>(val => {
    return typeof val === 'string' && /^0x[a-fA-F0-9]{40}$/.test(val);
  }, 'Invalid token address'),
  symbol: z.string().min(1, 'Token symbol is required'),
  name: z.string().min(1, 'Token name is required'),
  decimals: z.number().min(0).max(18),
});

/**
 * AddLiquidity 表单验证 Schema
 */
export const addLiquidityFormSchema = z.object({
  tokenA: tokenSchema,
  tokenB: tokenSchema,
  amountA: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be greater than 0'),
  amountB: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be greater than 0'),
  slippage: z
    .string()
    .refine(
      val => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50,
      'Slippage must be between 0 and 50',
    ),
  priceImpactWarning: z.boolean().optional(),
});

export type AddLiquidityFormValues = z.infer<typeof addLiquidityFormSchema>;

/**
 * RemoveLiquidity 表单验证 Schema
 */
export const removeLiquidityFormSchema = z.object({
  tokenA: tokenSchema,
  tokenB: tokenSchema,
  liquidity: z
    .string()
    .min(1, 'Liquidity amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Liquidity must be greater than 0'),
  percentage: z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
  slippage: z
    .string()
    .refine(
      val => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50,
      'Slippage must be between 0 and 50',
    ),
});

export type RemoveLiquidityFormValues = z.infer<typeof removeLiquidityFormSchema>;

/**
 * 流动性计算结果
 */
export interface LiquidityQuote {
  amountA: string;
  amountB: string;
  amountAMin: string;
  amountBMin: string;
  lpTokens: string;
  priceImpact: number;
  poolShare: number;
  fee: string;
}
