/**
 * 领域服务：AMM 计算服务
 * Domain Service: AMM Calculation Service
 *
 * 职责：
 * - 封装 Uniswap V2 的 AMM 公式计算
 * - 提供价格和流动性相关的计算
 * - 作为无状态的纯函数服务
 *
 * 为什么是 Domain Service：
 * - AMM 计算逻辑是核心业务规则，但不自然属于任何单个实体
 * - 可以被 Pool、Swap、Liquidity 等多个领域对象使用
 * - 无状态，只包含计算逻辑
 * - 符合单一职责原则
 *
 * 优势：
 * - 将复杂的计算逻辑从实体中分离
 * - 易于测试（纯函数）
 * - 易于复用
 * - 符合 DDD 的 Domain Service 模式
 *
 * @example
 * const service = new AMMCalculationService();
 * const amountOut = service.calculateAmountOut(
 *   amountIn,
 *   reserveIn,
 *   reserveOut
 * );
 */

import { Amount } from '../value-objects/Amount';
import { ValidationError, BusinessRuleError } from '../errors/DomainError';

/**
 * AMM 计算服务
 *
 * 封装 Uniswap V2 的恒定乘积做市商（Constant Product Market Maker）公式
 * x * y = k
 */
export class AMMCalculationService {
  // Uniswap V2 常量
  private static readonly FEE_RATE = 0.003; // 0.3% 手续费
  private static readonly FEE_MULTIPLIER = 997; // 1000 - 3 (0.3% fee)
  private static readonly FEE_DENOMINATOR = 1000;
  private static readonly MINIMUM_LIQUIDITY = 1000; // Uniswap V2 最小流动性

  /**
   * 计算输出金额（给定输入）
   *
   * Uniswap V2 公式：
   * amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
   *
   * 原理：
   * - 恒定乘积公式：x * y = k
   * - 扣除 0.3% 手续费后的输入：amountIn * 0.997
   * - 保持 k 不变的情况下计算输出
   *
   * @param amountIn 输入金额
   * @param reserveIn 输入代币的储备量
   * @param reserveOut 输出代币的储备量
   * @param decimalsOut 输出代币的小数位数
   * @returns 输出金额
   *
   * @throws ValidationError 如果输入金额无效
   * @throws BusinessRuleError 如果流动性不足
   *
   * @example
   * const amountOut = service.calculateAmountOut(
   *   new Amount('1.0', 18),  // 1 ETH
   *   new Amount('100', 18),  // 池子有 100 ETH
   *   new Amount('200000', 6) // 池子有 200,000 USDC
   *   6                       // USDC 6 位小数
   * );
   * // 返回约 1980 USDC（考虑手续费和价格影响）
   */
  calculateAmountOut(
    amountIn: Amount,
    reserveIn: Amount,
    reserveOut: Amount,
    decimalsOut: number,
  ): Amount {
    // 验证输入
    if (amountIn.isZero() || amountIn.isNegative()) {
      throw new ValidationError('Amount in must be positive');
    }

    if (reserveIn.isZero() || reserveOut.isZero()) {
      throw new BusinessRuleError('Insufficient liquidity in pool');
    }

    // 扣除手续费后的输入金额
    const amountInWithFee = amountIn.toNumber() * AMMCalculationService.FEE_MULTIPLIER;

    // AMM 公式计算
    const numerator = amountInWithFee * reserveOut.toNumber();
    const denominator =
      reserveIn.toNumber() * AMMCalculationService.FEE_DENOMINATOR + amountInWithFee;

    if (denominator === 0) {
      throw new BusinessRuleError('Invalid pool state: denominator is zero');
    }

    const amountOut = numerator / denominator;

    // 检查输出是否有效
    if (amountOut <= 0) {
      throw new BusinessRuleError('Calculated output amount is zero or negative');
    }

    if (amountOut >= reserveOut.toNumber()) {
      throw new BusinessRuleError('Insufficient liquidity for this trade');
    }

    return new Amount(amountOut.toString(), decimalsOut);
  }

  /**
   * 计算输入金额（给定期望的输出）
   *
   * Uniswap V2 反向公式：
   * amountIn = (reserveIn * amountOut * 1000) / ((reserveOut - amountOut) * 997) + 1
   *
   * 原理：
   * - 从恒定乘积公式反推
   * - 考虑 0.3% 手续费
   * - +1 向上取整，确保有足够的输入
   *
   * @param amountOut 期望的输出金额
   * @param reserveIn 输入代币的储备量
   * @param reserveOut 输出代币的储备量
   * @param decimalsIn 输入代币的小数位数
   * @returns 需要的输入金额
   *
   * @throws ValidationError 如果输出金额无效
   * @throws BusinessRuleError 如果流动性不足
   *
   * @example
   * const amountIn = service.calculateAmountIn(
   *   new Amount('2000', 6),  // 想要 2000 USDC
   *   new Amount('100', 18),  // 池子有 100 ETH
   *   new Amount('200000', 6) // 池子有 200,000 USDC
   *   18                      // ETH 18 位小数
   * );
   * // 返回约 1.01 ETH（考虑手续费和价格影响）
   */
  calculateAmountIn(
    amountOut: Amount,
    reserveIn: Amount,
    reserveOut: Amount,
    decimalsIn: number,
  ): Amount {
    // 验证输入
    if (amountOut.isZero() || amountOut.isNegative()) {
      throw new ValidationError('Amount out must be positive');
    }

    if (reserveIn.isZero() || reserveOut.isZero()) {
      throw new BusinessRuleError('Insufficient liquidity in pool');
    }

    if (amountOut.toNumber() >= reserveOut.toNumber()) {
      throw new BusinessRuleError('Insufficient liquidity for desired output');
    }

    // 反向 AMM 公式计算
    const numerator =
      reserveIn.toNumber() * amountOut.toNumber() * AMMCalculationService.FEE_DENOMINATOR;
    const denominator =
      (reserveOut.toNumber() - amountOut.toNumber()) * AMMCalculationService.FEE_MULTIPLIER;

    if (denominator === 0) {
      throw new BusinessRuleError('Invalid pool state: denominator is zero');
    }

    // +1 向上取整，确保有足够的输入
    const amountIn = numerator / denominator + 1;

    return new Amount(amountIn.toString(), decimalsIn);
  }

  /**
   * 计算价格影响
   *
   * 价格影响 = |执行价格 - 现货价格| / 现货价格 * 100%
   *
   * 原理：
   * - 现货价格：当前池子的价格比率
   * - 执行价格：实际交易的价格
   * - 价格影响反映了交易对池子价格的扰动
   *
   * @param amountIn 输入金额
   * @param amountOut 输出金额
   * @param reserveIn 输入代币的储备量
   * @param reserveOut 输出代币的储备量
   * @returns 价格影响（百分比）
   *
   * @example
   * const impact = service.calculatePriceImpact(
   *   new Amount('1.0', 18),
   *   new Amount('1980', 6),
   *   new Amount('100', 18),
   *   new Amount('200000', 6)
   * );
   * // 返回约 1.0（表示 1% 的价格影响）
   */
  calculatePriceImpact(
    amountIn: Amount,
    amountOut: Amount,
    reserveIn: Amount,
    reserveOut: Amount,
  ): number {
    if (reserveIn.isZero() || reserveOut.isZero()) {
      return 0;
    }

    // 现货价格（不考虑交易的情况下）
    const spotPrice = reserveIn.toNumber() / reserveOut.toNumber();

    // 执行价格（实际交易的价格）
    const executionPrice = amountIn.toNumber() / amountOut.toNumber();

    // 价格影响百分比
    const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;

    return priceImpact;
  }

  /**
   * 计算添加流动性时获得的 LP Token 数量
   *
   * Uniswap V2 公式：
   * - 第一次添加：liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
   * - 后续添加：liquidity = min(amount0/reserve0, amount1/reserve1) * totalSupply
   *
   * 原理：
   * - 第一次添加：使用几何平均数
   * - 后续添加：按比例分配，取较小值防止套利
   *
   * @param amount0 token0 的数量
   * @param amount1 token1 的数量
   * @param reserve0 token0 的储备量
   * @param reserve1 token1 的储备量
   * @param totalSupply LP Token 总供应量
   * @returns LP Token 数量
   *
   * @example
   * // 第一次添加流动性
   * const lpTokens = service.calculateLPTokens(
   *   new Amount('100', 18),
   *   new Amount('200000', 6),
   *   new Amount('0', 18),
   *   new Amount('0', 6),
   *   new Amount('0', 18)
   * );
   * // 返回 sqrt(100 * 200000) - 1000 ≈ 4471.136
   */
  calculateLPTokens(
    amount0: Amount,
    amount1: Amount,
    reserve0: Amount,
    reserve1: Amount,
    totalSupply: Amount,
  ): Amount {
    if (totalSupply.isZero()) {
      // 第一次添加流动性：LP = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
      const liquidity =
        Math.sqrt(amount0.toNumber() * amount1.toNumber()) -
        AMMCalculationService.MINIMUM_LIQUIDITY;

      if (liquidity <= 0) {
        throw new BusinessRuleError(
          'Initial liquidity too small (must be greater than MINIMUM_LIQUIDITY)',
        );
      }

      return new Amount(liquidity.toString(), 18);
    }

    // 后续添加流动性：LP = min(amount0/reserve0, amount1/reserve1) * totalSupply
    if (reserve0.isZero() || reserve1.isZero()) {
      throw new BusinessRuleError('Invalid pool state: reserves are zero but totalSupply is not');
    }

    const liquidity0 = (amount0.toNumber() / reserve0.toNumber()) * totalSupply.toNumber();
    const liquidity1 = (amount1.toNumber() / reserve1.toNumber()) * totalSupply.toNumber();

    // 取较小值，防止套利
    const liquidity = Math.min(liquidity0, liquidity1);

    if (liquidity <= 0) {
      throw new BusinessRuleError('Calculated LP tokens is zero or negative');
    }

    return new Amount(liquidity.toString(), 18);
  }

  /**
   * 计算移除流动性时获得的代币数量
   *
   * Uniswap V2 公式：
   * amount0 = (lpTokens / totalSupply) * reserve0
   * amount1 = (lpTokens / totalSupply) * reserve1
   *
   * 原理：
   * - 按 LP Token 占总供应量的比例分配储备
   *
   * @param lpTokens LP Token 数量
   * @param reserve0 token0 的储备量
   * @param reserve1 token1 的储备量
   * @param totalSupply LP Token 总供应量
   * @param decimals0 token0 的小数位数
   * @param decimals1 token1 的小数位数
   * @returns { amount0, amount1 } 获得的代币数量
   */
  calculateRemoveLiquidity(
    lpTokens: Amount,
    reserve0: Amount,
    reserve1: Amount,
    totalSupply: Amount,
    decimals0: number,
    decimals1: number,
  ): { amount0: Amount; amount1: Amount } {
    if (totalSupply.isZero()) {
      throw new BusinessRuleError('No liquidity in pool');
    }

    if (lpTokens.toNumber() > totalSupply.toNumber()) {
      throw new ValidationError('LP tokens exceed total supply');
    }

    const lpRatio = lpTokens.toNumber() / totalSupply.toNumber();

    const amount0 = reserve0.toNumber() * lpRatio;
    const amount1 = reserve1.toNumber() * lpRatio;

    return {
      amount0: new Amount(amount0.toString(), decimals0),
      amount1: new Amount(amount1.toString(), decimals1),
    };
  }

  /**
   * 获取手续费率
   */
  getFeeRate(): number {
    return AMMCalculationService.FEE_RATE;
  }

  /**
   * 获取手续费乘数
   */
  getFeeMultiplier(): number {
    return AMMCalculationService.FEE_MULTIPLIER;
  }

  /**
   * 获取手续费分母
   */
  getFeeDenominator(): number {
    return AMMCalculationService.FEE_DENOMINATOR;
  }
}

