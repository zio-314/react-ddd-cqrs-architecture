/**
 * 类型定义：Swap（交换）
 * Type Definitions: Swap
 *
 * 纯数据类型，用于数据传输和接口定义
 * 不包含业务逻辑
 */

import { IToken } from '@/domain/entities/Token';

/**
 * Swap 参数
 */
export interface SwapParams {
  tokenIn: IToken;
  tokenOut: IToken;
  amountIn: string;
  slippage: string; // 百分比，例如 "0.5" 表示 0.5%
}

/**
 * Swap 结果
 */
export interface SwapResult {
  txHash: string;
  amountOut: string;
}

/**
 * 获取输出金额参数
 */
export interface GetAmountOutParams {
  tokenIn: IToken;
  tokenOut: IToken;
  amountIn: string;
}
