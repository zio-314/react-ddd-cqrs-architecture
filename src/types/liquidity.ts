/**
 * 类型定义：Liquidity（流动性）
 * Type Definitions: Liquidity
 *
 * 纯数据类型，用于数据传输和接口定义
 * 不包含业务逻辑
 */

import { IToken } from '@/domain/entities/Token';

/**
 * 添加流动性参数
 */
export interface AddLiquidityParams {
  token0: IToken;
  token1: IToken;
  amount0: string; // 用户输入的金额（字符串，避免精度丢失）
  amount1: string; // 用户输入的金额（字符串，避免精度丢失）
  slippage: string; // 滑点百分比，例如 "0.5" 表示 0.5%
}

/**
 * 流动性报价
 */
export interface LiquidityQuote {
  amount0: string; // Token0 数量
  amount1: string; // Token1 数量
  amount0Min: string; // Token0 最小数量（考虑滑点）
  amount1Min: string; // Token1 最小数量（考虑滑点）
  lpTokens: string; // 预期获得的 LP Token 数量
  priceImpact: number; // 价格影响（百分比）
  poolShare: number; // 池份额（百分比）
  fee: string; // 预估费用
}

/**
 * 添加流动性结果
 */
export interface AddLiquidityResult {
  success: boolean;
  txHash: string;
  lpTokens: string;
  amount0: string;
  amount1: string;
}

/**
 * 获取流动性报价参数
 */
export interface GetLiquidityQuoteParams {
  token0: IToken;
  token1: IToken;
  amount0: string;
  amount1: string;
  slippage: string;
}

/**
 * 移除流动性参数
 */
export interface RemoveLiquidityParams {
  token0: IToken;
  token1: IToken;
  liquidity: string; // LP Token 数量（字符串，避免精度丢失）
  slippage: string; // 滑点百分比，例如 "0.5" 表示 0.5%
}

/**
 * 移除流动性报价
 */
export interface RemoveLiquidityQuote {
  amount0: string; // 预期获得的 Token0 数量
  amount1: string; // 预期获得的 Token1 数量
  amount0Min: string; // Token0 最小数量（考虑滑点）
  amount1Min: string; // Token1 最小数量（考虑滑点）
  poolShare: number; // 移除的池份额（百分比）
  priceImpact: number; // 价格影响（百分比）
}

/**
 * 移除流动性结果
 */
export interface RemoveLiquidityResult {
  success: boolean;
  txHash: string;
  amount0: string;
  amount1: string;
}

/**
 * LP Token 信息
 */
export interface LPTokenInfo {
  pairAddress: string;
  token0: IToken;
  token1: IToken;
  balance: string; // 用户的 LP Token 余额
  totalSupply: string; // LP Token 总供应量
  reserve0: string; // 储备量 0
  reserve1: string; // 储备量 1
}
