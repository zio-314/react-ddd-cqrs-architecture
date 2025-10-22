/**
 * 领域聚合根：Liquidity（流动性）
 * Domain Aggregate Root: Liquidity
 *
 * 代表一个具体的流动性操作（添加或移除）
 * 这是一个聚合根，包含流动性的所有信息和状态
 *
 * 职责：
 * - 封装流动性的业务规则
 * - 验证流动性的有效性
 * - 管理流动性的状态
 * - 计算流动性相关的数值
 */

import { IToken } from '../entities/Token';
import { Amount } from '../value-objects/Amount';
import { Slippage } from '../value-objects/Slippage';
import { ValidationError, BusinessRuleError } from '../errors/DomainError';

/**
 * 流动性操作类型
 */
export enum LiquidityOperationType {
  ADD = 'add',
  REMOVE = 'remove',
}

/**
 * 流动性状态
 */
export enum LiquidityStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * Liquidity 聚合根
 */
export class Liquidity {
  private readonly _id: string;
  private readonly _operationType: LiquidityOperationType;
  private readonly _token0: IToken;
  private readonly _token1: IToken;
  private readonly _amount0: Amount;
  private readonly _amount1: Amount;
  private readonly _slippage: Slippage;
  private _status: LiquidityStatus;
  private _txHash?: string;
  private _lpTokens?: Amount;
  private readonly _createdAt: Date;

  constructor(
    operationType: LiquidityOperationType,
    token0: IToken,
    token1: IToken,
    amount0: Amount,
    amount1: Amount,
    slippage: Slippage,
  ) {
    this._id = this.generateId(operationType);
    this._operationType = operationType;
    this._token0 = token0;
    this._token1 = token1;
    this._amount0 = amount0;
    this._amount1 = amount1;
    this._slippage = slippage;
    this._status = LiquidityStatus.PENDING;
    this._createdAt = new Date();

    // 创建时立即验证
    this.validate();
  }

  /**
   * 生成唯一 ID
   */
  private generateId(operationType: LiquidityOperationType): string {
    return `liquidity_${operationType}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 验证流动性操作是否有效
   *
   * 业务规则：
   * 1. 不能使用相同的代币
   * 2. 金额必须大于 0
   * 3. 滑点必须在合理范围内（0-50%）
   */
  private validate(): void {
    // 业务规则 1：不能使用相同的代币
    if (this._token0.address.toLowerCase() === this._token1.address.toLowerCase()) {
      throw new ValidationError('Cannot use the same token for both sides');
    }

    // 业务规则 2：金额必须大于 0
    if (this._amount0.isZero() || this._amount0.isNegative()) {
      throw new ValidationError('Amount 0 must be greater than 0');
    }

    if (this._amount1.isZero() || this._amount1.isNegative()) {
      throw new ValidationError('Amount 1 must be greater than 0');
    }

    // 业务规则 3：滑点必须在合理范围内
    if (this._slippage.getValue() < 0 || this._slippage.getValue() > 0.5) {
      throw new ValidationError('Slippage must be between 0% and 50%');
    }
  }

  /**
   * 业务计算：计算最小金额（考虑滑点）
   */
  calculateMinAmounts(): { min0: Amount; min1: Amount } {
    return {
      min0: this._amount0.applySlippage(this._slippage),
      min1: this._amount1.applySlippage(this._slippage),
    };
  }

  /**
   * 业务规则：检查价格影响
   *
   * 规则：价格影响不应超过 5%
   */
  checkPriceImpact(priceImpact: number): void {
    if (priceImpact > 5) {
      throw new BusinessRuleError(
        `Price impact too high: ${priceImpact.toFixed(2)}%. Maximum allowed is 5%.`,
      );
    }
  }

  /**
   * 业务计算：计算池份额
   */
  calculatePoolShare(totalSupply: Amount, lpTokens: Amount): number {
    if (totalSupply.isZero()) {
      return 100; // 第一个流动性提供者获得 100% 份额
    }

    return (lpTokens.toNumber() / totalSupply.toNumber()) * 100;
  }

  /**
   * 业务计算：计算价格比率
   */
  getPriceRatio(): number {
    return this._amount0.toNumber() / this._amount1.toNumber();
  }

  /**
   * 状态管理：标记为执行中
   */
  markAsExecuting(): void {
    if (this._status !== LiquidityStatus.PENDING) {
      throw new BusinessRuleError(`Cannot execute in ${this._status} status`);
    }
    this._status = LiquidityStatus.EXECUTING;
  }

  /**
   * 状态管理：标记为成功
   */
  markAsSuccess(txHash: string, lpTokens: Amount): void {
    if (this._status !== LiquidityStatus.EXECUTING) {
      throw new BusinessRuleError(`Cannot mark as success in ${this._status} status`);
    }
    this._status = LiquidityStatus.SUCCESS;
    this._txHash = txHash;
    this._lpTokens = lpTokens;
  }

  /**
   * 状态管理：标记为失败
   */
  markAsFailed(): void {
    if (this._status !== LiquidityStatus.EXECUTING) {
      throw new BusinessRuleError(`Cannot mark as failed in ${this._status} status`);
    }
    this._status = LiquidityStatus.FAILED;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this._status = LiquidityStatus.PENDING;
    this._txHash = undefined;
    this._lpTokens = undefined;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get operationType(): LiquidityOperationType {
    return this._operationType;
  }

  get token0(): IToken {
    return this._token0;
  }

  get token1(): IToken {
    return this._token1;
  }

  get amount0(): Amount {
    return this._amount0;
  }

  get amount1(): Amount {
    return this._amount1;
  }

  get slippage(): Slippage {
    return this._slippage;
  }

  get status(): LiquidityStatus {
    return this._status;
  }

  get txHash(): string | undefined {
    return this._txHash;
  }

  get lpTokens(): Amount | undefined {
    return this._lpTokens;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 获取流动性信息（用于日志、调试）
   */
  getInfo() {
    const minAmounts = this.calculateMinAmounts();

    return {
      id: this._id,
      operationType: this._operationType,
      token0: {
        address: this._token0.address,
        symbol: this._token0.symbol,
        name: this._token0.name,
        amount: this._amount0.toString(),
        minAmount: minAmounts.min0.toString(),
      },
      token1: {
        address: this._token1.address,
        symbol: this._token1.symbol,
        name: this._token1.name,
        amount: this._amount1.toString(),
        minAmount: minAmounts.min1.toString(),
      },
      slippage: this._slippage.toString(),
      priceRatio: this.getPriceRatio(),
      status: this._status,
      txHash: this._txHash,
      lpTokens: this._lpTokens?.toString(),
      createdAt: this._createdAt.toISOString(),
    };
  }
}
