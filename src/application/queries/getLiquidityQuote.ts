/**
 * 查询：获取流动性报价
 * Query: Get Liquidity Quote
 *
 * 职责：
 * - 调用 Pool 实体计算流动性报价
 * - 协调数据转换
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 执行写操作
 * - 管理 UI 状态
 * - 包含业务逻辑计算（应在 Pool 实体中）
 *
 * 注意：
 * - 这是一个简化版本，实际应该从链上获取池子数据
 * - 目前使用模拟的池子数据进行计算
 */

import type { GetLiquidityQuoteParams, LiquidityQuote } from '@/types';
import { Pool } from '@/domain/entities/Pool';
import { Amount } from '@/domain/value-objects/Amount';
import { Slippage } from '@/domain/value-objects/Slippage';
import type { IToken } from '@/domain/entities/Token';

/**
 * 获取流动性报价（使用 Pool 实体）
 *
 * 注意：这是一个简化版本，使用模拟的池子数据
 * 实际应该从链上获取真实的池子储备量
 *
 * @param params - 获取报价参数
 * @returns 流动性报价
 *
 * @example
 * const quote = await getLiquidityQuote({
 *   token0: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *   token1: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *   amount0: '1.0',
 *   amount1: '10.0',
 *   slippage: '0.5',
 * });
 */
export async function getLiquidityQuote(params: GetLiquidityQuoteParams): Promise<LiquidityQuote> {
  try {
    const { amount0, amount1, slippage } = params;

    // 验证输入
    const amount0Num = Number(amount0);
    const amount1Num = Number(amount1);
    const slippageNum = Number(slippage);

    if (isNaN(amount0Num) || isNaN(amount1Num) || isNaN(slippageNum)) {
      throw new Error('Invalid input amounts');
    }

    if (amount0Num <= 0 || amount1Num <= 0) {
      throw new Error('Amounts must be greater than 0');
    }

    if (slippageNum < 0 || slippageNum > 100) {
      throw new Error('Slippage must be between 0 and 100');
    }

    // 创建值对象
    const amount0Obj = new Amount(amount0, 18); // 假设 18 位小数
    const amount1Obj = new Amount(amount1, 18);
    const slippageObj = new Slippage(slippageNum);

    // 创建模拟的 Pool 实体
    // 注意：实际应该从链上获取真实的池子数据
    const mockToken0: IToken = {
      address: '0x0000000000000000000000000000000000000001' as `0x${string}`,
      symbol: 'TOKEN0',
      name: 'Token 0',
      decimals: 18,
    };

    const mockToken1: IToken = {
      address: '0x0000000000000000000000000000000000000002' as `0x${string}`,
      symbol: 'TOKEN1',
      name: 'Token 1',
      decimals: 18,
    };

    // 使用模拟的储备量创建池子
    // 实际应该从链上获取
    const mockReserve0 = new Amount('1000000', 18); // 100万
    const mockReserve1 = new Amount('1000000', 18); // 100万
    const mockTotalSupply = new Amount('1000000', 18);

    const pool = new Pool(
      '0x0000000000000000000000000000000000000000' as `0x${string}`,
      mockToken0,
      mockToken1,
      mockReserve0,
      mockReserve1,
      mockTotalSupply,
    );

    // 使用 Pool 实体的业务方法计算
    const lpTokens = pool.calculateLPTokens(amount0Obj, amount1Obj);
    const poolShare = pool.calculatePoolShare(lpTokens);

    // 计算最小金额（应用滑点）
    const amount0Min = amount0Obj.applySlippage(slippageObj);
    const amount1Min = amount1Obj.applySlippage(slippageObj);

    // 计算费用（Uniswap V2 的费用是 0.3%）
    const fee = amount0Obj.multiply(0.003);

    // 简化的价格影响计算
    // 实际应该使用 pool.calculatePriceImpact()，但需要知道是哪个代币输入
    const priceImpact = 0.1; // 简化为固定值

    return {
      amount0,
      amount1,
      amount0Min: amount0Min.toString(),
      amount1Min: amount1Min.toString(),
      lpTokens: lpTokens.toString(),
      priceImpact,
      poolShare,
      fee: fee.toString(),
    };
  } catch (err) {
    console.error('Failed to get liquidity quote:', err);
    throw err;
  }
}
