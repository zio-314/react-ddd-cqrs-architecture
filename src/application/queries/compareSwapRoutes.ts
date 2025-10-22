/**
 * Application Query: 比较多个池子的交换路径
 * Compare Swap Routes
 *
 * 使用场景：
 * - 当有多个池子可以完成同一个交换时，比较哪个池子更优
 * - 展示 Domain Service 的正确用法
 *
 * 架构说明：
 * - Application Layer 调用 Domain Service
 * - Domain Service 使用 Entity 的数据进行计算
 * - Entity 不调用 Domain Service（保持依赖方向清晰）
 */

import { Pool } from '@/domain/entities/Pool';
import { IToken } from '@/domain/entities/Token';
import { Amount } from '@/domain/value-objects/Amount';
import { AMMCalculationService } from '@/domain/services/AMMCalculationService';

/**
 * 交换路径比较结果
 */
export interface SwapRouteComparison {
  pool: Pool;
  amountOut: Amount;
  priceImpact: number;
  effectivePrice: number; // 实际执行价格
  score: number; // 综合评分（越高越好）
}

/**
 * 比较多个池子的交换路径
 *
 * 这个 Query 展示了 Domain Service 的正确用法：
 * 1. Application Layer 调用 Domain Service
 * 2. Domain Service 使用多个 Pool 的数据进行计算和比较
 * 3. Pool Entity 不需要知道 AMMCalculationService 的存在
 *
 * @param pools 可用的流动性池列表
 * @param amountIn 输入金额
 * @param tokenIn 输入代币
 * @param tokenOut 输出代币
 * @returns 排序后的交换路径列表（按综合评分从高到低）
 *
 * @example
 * // 假设有两个 ETH/USDC 池子
 * const pools = [pool1, pool2];
 * const routes = compareSwapRoutes(
 *   pools,
 *   new Amount('1.0', 18), // 1 ETH
 *   ethToken,
 *   usdcToken
 * );
 *
 * // routes[0] 是最优路径
 * console.log(`最优池子: ${routes[0].pool.address}`);
 * console.log(`输出金额: ${routes[0].amountOut.toString()}`);
 * console.log(`价格影响: ${routes[0].priceImpact.toFixed(2)}%`);
 */
export function compareSwapRoutes(
  pools: Pool[],
  amountIn: Amount,
  tokenIn: IToken,
  tokenOut: IToken,
): SwapRouteComparison[] {
  // 创建 Domain Service 实例
  const ammService = new AMMCalculationService();

  // 过滤出包含所需代币对的池子
  const eligiblePools = pools.filter((pool) => {
    const hasTokenIn =
      pool.token0.address.toLowerCase() === tokenIn.address.toLowerCase() ||
      pool.token1.address.toLowerCase() === tokenIn.address.toLowerCase();

    const hasTokenOut =
      pool.token0.address.toLowerCase() === tokenOut.address.toLowerCase() ||
      pool.token1.address.toLowerCase() === tokenOut.address.toLowerCase();

    return hasTokenIn && hasTokenOut;
  });

  // 对每个池子进行计算和评分
  const comparisons: SwapRouteComparison[] = eligiblePools.map((pool) => {
    // 确定储备量和小数位数
    const isToken0In = pool.token0.address.toLowerCase() === tokenIn.address.toLowerCase();
    const reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
    const reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;
    const decimalsOut = isToken0In ? pool.token1.decimals : pool.token0.decimals;

    // 使用 Domain Service 计算输出金额
    const amountOut = ammService.calculateAmountOut(amountIn, reserveIn, reserveOut, decimalsOut);

    // 使用 Domain Service 计算价格影响
    const priceImpact = ammService.calculatePriceImpact(
      amountIn,
      amountOut,
      reserveIn,
      reserveOut,
    );

    // 计算实际执行价格
    const effectivePrice = amountIn.toNumber() / amountOut.toNumber();

    // 计算综合评分
    // 评分规则：
    // - 输出金额越大越好（权重 60%）
    // - 价格影响越小越好（权重 30%）
    // - 流动性越大越好（权重 10%）
    const outputScore = amountOut.toNumber();
    const impactScore = 1 / (priceImpact + 0.1); // 避免除以零
    const liquidityScore = Math.log(pool.totalSupply.toNumber() + 1);

    const score = outputScore * 0.6 + impactScore * 100 * 0.3 + liquidityScore * 0.1;

    return {
      pool,
      amountOut,
      priceImpact,
      effectivePrice,
      score,
    };
  });

  // 按评分从高到低排序
  return comparisons.sort((a, b) => b.score - a.score);
}

/**
 * 获取最优交换路径
 *
 * @param pools 可用的流动性池列表
 * @param amountIn 输入金额
 * @param tokenIn 输入代币
 * @param tokenOut 输出代币
 * @returns 最优路径，如果没有可用路径则返回 null
 */
export function getBestSwapRoute(
  pools: Pool[],
  amountIn: Amount,
  tokenIn: IToken,
  tokenOut: IToken,
): SwapRouteComparison | null {
  const routes = compareSwapRoutes(pools, amountIn, tokenIn, tokenOut);
  return routes.length > 0 ? routes[0] : null;
}

/**
 * 计算多个池子的平均价格
 *
 * 这个函数展示了 Domain Service 的另一个用法：
 * 跨多个 Pool 进行聚合计算
 *
 * @param pools 流动性池列表
 * @param tokenIn 输入代币
 * @param tokenOut 输出代币
 * @returns 平均价格，如果没有可用池子则返回 0
 */
export function calculateAveragePrice(
  pools: Pool[],
  tokenIn: IToken,
  tokenOut: IToken,
): number {
  const ammService = new AMMCalculationService();

  // 使用小额（1 单位）计算价格，避免价格影响
  const testAmount = new Amount('1.0', tokenIn.decimals);

  const prices = pools
    .filter((pool) => {
      const hasTokenIn =
        pool.token0.address.toLowerCase() === tokenIn.address.toLowerCase() ||
        pool.token1.address.toLowerCase() === tokenIn.address.toLowerCase();

      const hasTokenOut =
        pool.token0.address.toLowerCase() === tokenOut.address.toLowerCase() ||
        pool.token1.address.toLowerCase() === tokenOut.address.toLowerCase();

      return hasTokenIn && hasTokenOut;
    })
    .map((pool) => {
      const isToken0In = pool.token0.address.toLowerCase() === tokenIn.address.toLowerCase();
      const reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
      const reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;
      const decimalsOut = isToken0In ? pool.token1.decimals : pool.token0.decimals;

      try {
        const amountOut = ammService.calculateAmountOut(
          testAmount,
          reserveIn,
          reserveOut,
          decimalsOut,
        );
        return testAmount.toNumber() / amountOut.toNumber();
      } catch {
        return 0;
      }
    })
    .filter((price) => price > 0);

  if (prices.length === 0) return 0;

  // 计算加权平均（按流动性加权）
  const totalLiquidity = pools.reduce((sum, pool) => sum + pool.totalSupply.toNumber(), 0);

  const weightedSum = pools.reduce((sum, pool, index) => {
    const weight = pool.totalSupply.toNumber() / totalLiquidity;
    return sum + prices[index] * weight;
  }, 0);

  return weightedSum;
}

