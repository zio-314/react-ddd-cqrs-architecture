/**
 * 领域实体：Pool（流动性池）
 * Domain Entity: Pool
 *
 * 充血模型：封装流动性池的业务规则和计算逻辑
 *
 * 职责：
 * - 管理 token0 和 token1 的储备量
 * - 计算价格和汇率
 * - 计算交易输出（AMM 公式）
 * - 验证流动性操作
 * - 封装 Uniswap V2 的业务规则
 */

import { IToken } from './Token';
import { Amount } from '../value-objects/Amount';
import { Address } from 'viem';
import type { LiquidityPool } from '@/types/pool';
import { ValidationError, BusinessRuleError } from '../errors/DomainError';

/**
 * Pool 实体（充血模型）
 *
 * 封装流动性池的所有业务逻辑
 */
export class Pool {
  private readonly _address: Address;
  private readonly _token0: IToken;
  private readonly _token1: IToken;
  private readonly _reserve0: Amount;
  private readonly _reserve1: Amount;
  private readonly _totalSupply: Amount;

  // Uniswap V2 常量
  private static readonly FEE_RATE = 0.003; // 0.3%
  private static readonly FEE_MULTIPLIER = 997; // 1000 - 3 (0.3% fee)
  private static readonly FEE_DENOMINATOR = 1000;

  constructor(
    address: Address,
    token0: IToken,
    token1: IToken,
    reserve0: Amount,
    reserve1: Amount,
    totalSupply: Amount,
  ) {
    this._address = address;
    this._token0 = token0;
    this._token1 = token1;
    this._reserve0 = reserve0;
    this._reserve1 = reserve1;
    this._totalSupply = totalSupply;

    // 创建时立即验证
    this.validate();
  }

  /**
   * 业务规则：验证池子状态
   */
  private validate(): void {
    // token0 地址必须小于 token1（Uniswap 约定）
    if (this._token0.address.toLowerCase() >= this._token1.address.toLowerCase()) {
      throw new ValidationError(
        'token0 address must be less than token1 address (Uniswap convention)',
      );
    }

    // 储备量不能为负
    if (this._reserve0.isNegative() || this._reserve1.isNegative()) {
      throw new ValidationError('Reserves cannot be negative');
    }
  }

  /**
   * 业务计算：获取价格（token0 相对于 token1）
   *
   * @returns token0 的价格（以 token1 计价）
   * @example 如果 1 ETH = 2000 USDC，则返回 2000
   */
  getPrice(): number {
    if (this._reserve1.isZero()) return 0;
    return this._reserve0.toNumber() / this._reserve1.toNumber();
  }

  /**
   * 业务计算：获取反向价格（token1 相对于 token0）
   *
   * @returns token1 的价格（以 token0 计价）
   * @example 如果 1 ETH = 2000 USDC，则返回 0.0005
   */
  getInversePrice(): number {
    if (this._reserve0.isZero()) return 0;
    return this._reserve1.toNumber() / this._reserve0.toNumber();
  }

  /**
   * 业务计算：根据输入计算输出（AMM 公式）
   *
   * Uniswap V2 公式：
   * amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
   *
   * @param amountIn 输入金额
   * @param tokenIn 输入代币
   * @returns 输出金额
   */
  getAmountOut(amountIn: Amount, tokenIn: IToken): Amount {
    const isToken0In = tokenIn.address.toLowerCase() === this._token0.address.toLowerCase();
    const reserveIn = isToken0In ? this._reserve0 : this._reserve1;
    const reserveOut = isToken0In ? this._reserve1 : this._reserve0;
    const decimalsOut = isToken0In ? this._token1.decimals : this._token0.decimals;

    // 验证输入
    if (amountIn.isZero() || amountIn.isNegative()) {
      throw new ValidationError('Amount in must be positive');
    }

    // 扣除手续费后的输入金额
    const amountInWithFee = amountIn.toNumber() * Pool.FEE_MULTIPLIER;
    const numerator = amountInWithFee * reserveOut.toNumber();
    const denominator = reserveIn.toNumber() * Pool.FEE_DENOMINATOR + amountInWithFee;

    if (denominator === 0) {
      throw new BusinessRuleError('Insufficient liquidity');
    }

    const amountOut = numerator / denominator;
    return new Amount(amountOut.toString(), decimalsOut);
  }

  /**
   * 业务计算：根据输出计算输入（反向 AMM 公式）
   *
   * Uniswap V2 反向公式：
   * amountIn = (reserveIn * amountOut * 1000) / ((reserveOut - amountOut) * 997) + 1
   *
   * @param amountOut 期望的输出金额
   * @param tokenOut 输出代币
   * @returns 需要的输入金额
   */
  getAmountIn(amountOut: Amount, tokenOut: IToken): Amount {
    const isToken0Out = tokenOut.address.toLowerCase() === this._token0.address.toLowerCase();
    const reserveIn = isToken0Out ? this._reserve1 : this._reserve0;
    const reserveOut = isToken0Out ? this._reserve0 : this._reserve1;
    const decimalsIn = isToken0Out ? this._token1.decimals : this._token0.decimals;

    // 验证输入
    if (amountOut.isZero() || amountOut.isNegative()) {
      throw new ValidationError('Amount out must be positive');
    }

    if (amountOut.toNumber() >= reserveOut.toNumber()) {
      throw new BusinessRuleError('Insufficient liquidity for desired output');
    }

    const numerator = reserveIn.toNumber() * amountOut.toNumber() * Pool.FEE_DENOMINATOR;
    const denominator = (reserveOut.toNumber() - amountOut.toNumber()) * Pool.FEE_MULTIPLIER;

    if (denominator === 0) {
      throw new BusinessRuleError('Insufficient liquidity');
    }

    const amountIn = numerator / denominator + 1; // +1 to round up
    return new Amount(amountIn.toString(), decimalsIn);
  }

  /**
   * 业务计算：计算价格影响
   *
   * 价格影响 = |执行价格 - 现货价格| / 现货价格 * 100%
   *
   * @param amountIn 输入金额
   * @param tokenIn 输入代币
   * @returns 价格影响（百分比）
   */
  calculatePriceImpact(amountIn: Amount, tokenIn: IToken): number {
    const amountOut = this.getAmountOut(amountIn, tokenIn);
    const isToken0In = tokenIn.address.toLowerCase() === this._token0.address.toLowerCase();

    // 现货价格
    const spotPrice = isToken0In ? this.getPrice() : this.getInversePrice();

    // 执行价格
    const executionPrice = amountIn.toNumber() / amountOut.toNumber();

    // 价格影响
    return Math.abs((executionPrice - spotPrice) / spotPrice) * 100;
  }

  /**
   * 业务规则：检查流动性是否充足
   *
   * @param amountOut 期望的输出金额
   * @param tokenOut 输出代币
   * @returns 是否有足够的流动性
   */
  hasEnoughLiquidity(amountOut: Amount, tokenOut: IToken): boolean {
    const isToken0Out = tokenOut.address.toLowerCase() === this._token0.address.toLowerCase();
    const reserve = isToken0Out ? this._reserve0 : this._reserve1;

    return reserve.toNumber() > amountOut.toNumber();
  }

  /**
   * 业务计算：计算添加流动性时获得的 LP token 数量
   *
   * Uniswap V2 公式：
   * - 第一次添加：liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
   * - 后续添加：liquidity = min(amount0/reserve0, amount1/reserve1) * totalSupply
   *
   * @param amount0 token0 的数量
   * @param amount1 token1 的数量
   * @returns LP token 数量
   */
  calculateLPTokens(amount0: Amount, amount1: Amount): Amount {
    if (this._totalSupply.isZero()) {
      // 第一次添加流动性：LP = sqrt(amount0 * amount1)
      const liquidity = Math.sqrt(amount0.toNumber() * amount1.toNumber());
      return new Amount(liquidity.toString(), 18);
    }

    // 后续添加流动性：LP = min(amount0/reserve0, amount1/reserve1) * totalSupply
    const liquidity0 =
      (amount0.toNumber() / this._reserve0.toNumber()) * this._totalSupply.toNumber();
    const liquidity1 =
      (amount1.toNumber() / this._reserve1.toNumber()) * this._totalSupply.toNumber();

    return new Amount(Math.min(liquidity0, liquidity1).toString(), 18);
  }

  /**
   * 业务计算：计算移除流动性时获得的代币数量
   *
   * @param lpTokens LP token 数量
   * @returns { amount0, amount1 } 获得的 token0 和 token1 数量
   */
  calculateRemoveLiquidity(lpTokens: Amount): { amount0: Amount; amount1: Amount } {
    if (this._totalSupply.isZero()) {
      throw new BusinessRuleError('No liquidity in pool');
    }

    const lpRatio = lpTokens.toNumber() / this._totalSupply.toNumber();

    const amount0 = this._reserve0.toNumber() * lpRatio;
    const amount1 = this._reserve1.toNumber() * lpRatio;

    return {
      amount0: new Amount(amount0.toString(), this._token0.decimals),
      amount1: new Amount(amount1.toString(), this._token1.decimals),
    };
  }

  /**
   * 业务计算：计算池份额
   *
   * @param lpTokens LP token 数量
   * @returns 池份额（百分比）
   */
  calculatePoolShare(lpTokens: Amount): number {
    if (this._totalSupply.isZero()) {
      return 100; // 第一个流动性提供者获得 100% 份额
    }

    return (lpTokens.toNumber() / this._totalSupply.toNumber()) * 100;
  }

  /**
   * 获取指定代币的储备量
   *
   * @param token 代币
   * @returns 储备量，如果代币不在池中则返回 undefined
   */
  getReserve(token: IToken): Amount | undefined {
    if (token.address.toLowerCase() === this._token0.address.toLowerCase()) {
      return this._reserve0;
    }
    if (token.address.toLowerCase() === this._token1.address.toLowerCase()) {
      return this._reserve1;
    }
    return undefined;
  }

  /**
   * 获取指定代币符号的储备量
   *
   * @param tokenSymbol 代币符号
   * @returns 储备量，如果代币不在池中则返回 undefined
   */
  getReserveBySymbol(tokenSymbol: string): Amount | undefined {
    if (this._token0.symbol === tokenSymbol) {
      return this._reserve0;
    }
    if (this._token1.symbol === tokenSymbol) {
      return this._reserve1;
    }
    return undefined;
  }

  // ============================================================================
  // Getters (使用 TypeScript getter 语法)
  // ============================================================================

  /**
   * 获取池子地址
   */
  get address(): Address {
    return this._address;
  }

  /**
   * 获取 token0
   */
  get token0(): IToken {
    return this._token0;
  }

  /**
   * 获取 token1
   */
  get token1(): IToken {
    return this._token1;
  }

  /**
   * 获取 token0 的储备量
   */
  get reserve0(): Amount {
    return this._reserve0;
  }

  /**
   * 获取 token1 的储备量
   */
  get reserve1(): Amount {
    return this._reserve1;
  }

  /**
   * 获取 LP Token 总供应量
   */
  get totalSupply(): Amount {
    return this._totalSupply;
  }

  /**
   * 获取池子信息（用于日志、调试）
   */
  get info() {
    return {
      address: this._address,
      token0: {
        address: this._token0.address,
        symbol: this._token0.symbol,
        name: this._token0.name,
        reserve: this._reserve0.toString(),
      },
      token1: {
        address: this._token1.address,
        symbol: this._token1.symbol,
        name: this._token1.name,
        reserve: this._reserve1.toString(),
      },
      totalSupply: this._totalSupply.toString(),
      price: this.getPrice(),
      inversePrice: this.getInversePrice(),
    };
  }

  /**
   * 转换为普通对象（用于序列化）
   */
  toObject() {
    return {
      address: this._address,
      token0: {
        token: this._token0,
        reserve: {
          amount: this._reserve0.toWei().toString(),
          amountFormatted: this._reserve0.toString(),
        },
      },
      token1: {
        token: this._token1,
        reserve: {
          amount: this._reserve1.toWei().toString(),
          amountFormatted: this._reserve1.toString(),
        },
      },
      metrics: {
        totalSupply: this._totalSupply.toWei().toString(),
        totalSupplyFormatted: this._totalSupply.toString(),
      },
    };
  }

  // ============================================================================
  // 工厂方法
  // ============================================================================

  /**
   * 从 LiquidityPool 接口创建 Pool 实体
   *
   * 这是一个工厂方法，用于将贫血的 LiquidityPool 数据转换为充血的 Pool 实体
   *
   * @param liquidityPool LiquidityPool 接口数据
   * @returns Pool 实体实例
   *
   * @example
   * const pools = await getLiquidityPools();
   * const pool = Pool.fromLiquidityPool(pools[0]);
   * const price = pool.getPrice();
   * const amountOut = pool.getAmountOut(amountIn, tokenIn);
   */
  static fromLiquidityPool(liquidityPool: LiquidityPool): Pool {
    // 转换 Token 类型为 IToken
    const token0: IToken = {
      address: liquidityPool.token0.token.address as Address,
      symbol: liquidityPool.token0.token.symbol,
      name: liquidityPool.token0.token.name,
      decimals: liquidityPool.token0.token.decimals,
    };

    const token1: IToken = {
      address: liquidityPool.token1.token.address as Address,
      symbol: liquidityPool.token1.token.symbol,
      name: liquidityPool.token1.token.name,
      decimals: liquidityPool.token1.token.decimals,
    };

    return new Pool(
      liquidityPool.address as Address,
      token0,
      token1,
      new Amount(liquidityPool.token0.reserve.amountFormatted, liquidityPool.token0.token.decimals),
      new Amount(liquidityPool.token1.reserve.amountFormatted, liquidityPool.token1.token.decimals),
      new Amount(liquidityPool.metrics.totalSupplyFormatted, 18),
    );
  }
}
