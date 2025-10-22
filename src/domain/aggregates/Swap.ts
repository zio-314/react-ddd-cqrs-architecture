/**
 * 领域聚合根：Swap（交换）
 * Domain Aggregate Root: Swap
 *
 * 代表一个具体的代币交换操作
 * 这是一个聚合根，包含交换的所有信息和状态
 *
 * 职责：
 * - 封装交换的业务规则
 * - 验证交换的有效性
 * - 管理交换的状态
 * - 计算交换相关的数值
 */

import { IToken } from '../entities/Token';
import { Amount } from '../value-objects/Amount';
import { Slippage } from '../value-objects/Slippage';
import { ValidationError, BusinessRuleError } from '../errors/DomainError';

/**
 * 交换状态
 */
export enum SwapStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * Swap 聚合根
 */
export class Swap {
  private readonly _id: string;
  private readonly _tokenIn: IToken;
  private readonly _tokenOut: IToken;
  private readonly _amountIn: Amount;
  private readonly _slippage: Slippage;
  private _status: SwapStatus;
  private _txHash?: string;
  private _amountOut?: Amount;
  private readonly _createdAt: Date;

  constructor(tokenIn: IToken, tokenOut: IToken, amountIn: Amount, slippage: Slippage) {
    this._id = this.generateId();
    this._tokenIn = tokenIn;
    this._tokenOut = tokenOut;
    this._amountIn = amountIn;
    this._slippage = slippage;
    this._status = SwapStatus.PENDING;
    this._createdAt = new Date();

    // 创建时立即验证
    this.validate();
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `swap_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 验证交换是否有效
   *
   * 业务规则：
   * 1. 不能交换相同的代币
   * 2. 金额必须大于 0
   * 3. 滑点必须在合理范围内（0-50%）
   */
  private validate(): void {
    // 业务规则 1：不能交换相同的代币
    if (this._tokenIn.address.toLowerCase() === this._tokenOut.address.toLowerCase()) {
      throw new ValidationError('Cannot swap the same token');
    }

    // 业务规则 2：金额必须大于 0
    if (this._amountIn.isZero() || this._amountIn.isNegative()) {
      throw new ValidationError('Amount must be greater than 0');
    }

    // 业务规则 3：滑点必须在合理范围内
    if (this._slippage.getValue() > 0.5) {
      throw new ValidationError('Slippage too high (max 50%)');
    }

    if (this._slippage.getValue() < 0) {
      throw new ValidationError('Slippage cannot be negative');
    }
  }

  /**
   * 计算最小输出金额
   *
   * @param expectedOutput 预期输出金额
   * @returns 最小输出金额（考虑滑点）
   */
  calculateMinimumOutput(expectedOutput: Amount): Amount {
    return expectedOutput.applySlippage(this._slippage);
  }

  /**
   * 检查价格影响
   *
   * 业务规则：价格影响超过 5% 需要警告
   *
   * @param priceImpact 价格影响（百分比）
   * @throws BusinessRuleError 如果价格影响过高
   */
  checkPriceImpact(priceImpact: number): void {
    if (priceImpact > 5) {
      throw new BusinessRuleError(
        `Price impact too high: ${priceImpact.toFixed(2)}%. Consider reducing the amount.`,
      );
    }
  }

  /**
   * 标记为执行中
   */
  markAsExecuting(): void {
    if (this._status !== SwapStatus.PENDING) {
      throw new BusinessRuleError(`Cannot execute swap in ${this._status} status`);
    }
    this._status = SwapStatus.EXECUTING;
  }

  /**
   * 标记为成功
   *
   * @param txHash 交易哈希
   * @param amountOut 实际输出金额
   */
  markAsSuccess(txHash: string, amountOut: Amount): void {
    if (this._status !== SwapStatus.EXECUTING) {
      throw new BusinessRuleError(`Cannot mark as success in ${this._status} status`);
    }
    this._status = SwapStatus.SUCCESS;
    this._txHash = txHash;
    this._amountOut = amountOut;
  }

  /**
   * 标记为失败
   */
  markAsFailed(): void {
    if (this._status === SwapStatus.SUCCESS) {
      throw new BusinessRuleError('Cannot mark successful swap as failed');
    }
    this._status = SwapStatus.FAILED;
  }

  /**
   * 检查是否可以执行
   */
  canExecute(): boolean {
    return this._status === SwapStatus.PENDING;
  }

  /**
   * 检查是否已完成（成功或失败）
   */
  isCompleted(): boolean {
    return this._status === SwapStatus.SUCCESS || this._status === SwapStatus.FAILED;
  }

  /**
   * 获取交换信息
   */
  get info() {
    return {
      id: this._id,
      tokenIn: {
        address: this._tokenIn.address,
        symbol: this._tokenIn.symbol,
        name: this._tokenIn.name,
      },
      tokenOut: {
        address: this._tokenOut.address,
        symbol: this._tokenOut.symbol,
        name: this._tokenOut.name,
      },
      amountIn: this._amountIn.toString(),
      amountOut: this._amountOut?.toString(),
      slippage: this._slippage.toString(),
      status: this._status,
      txHash: this._txHash,
      createdAt: this._createdAt.toISOString(),
    };
  }

  // Getters (使用 TypeScript getter 语法)
  get id(): string {
    return this._id;
  }

  get tokenIn(): IToken {
    return this._tokenIn;
  }

  get tokenOut(): IToken {
    return this._tokenOut;
  }

  get amountIn(): Amount {
    return this._amountIn;
  }

  get slippage(): Slippage {
    return this._slippage;
  }

  get status(): SwapStatus {
    return this._status;
  }

  get txHash(): string | undefined {
    return this._txHash;
  }

  get amountOut(): Amount | undefined {
    return this._amountOut;
  }
}
