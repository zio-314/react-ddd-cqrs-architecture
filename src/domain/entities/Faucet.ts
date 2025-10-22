/**
 * 领域实体：Faucet（水龙头）
 * Domain Entity: Faucet
 *
 * 充血模型：封装水龙头的业务规则和状态管理
 *
 * 职责：
 * - 验证铸币金额
 * - 管理冷却时间
 * - 管理铸币状态
 * - 封装业务规则
 */

import { IToken } from './Token';
import { Address } from 'viem';
import { ValidationError, BusinessRuleError } from '../errors/DomainError';

/**
 * 水龙头代币信息
 *
 * 扩展 IToken，添加 mintAmount 字段
 */
export interface IFaucetToken extends IToken {
  /** 每次铸币的数量 */
  mintAmount: string;
}

/**
 * 水龙头状态
 */
export enum FaucetStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Faucet 实体（充血模型）
 *
 * 封装水龙头的所有业务逻辑和状态管理
 */
export class Faucet {
  private readonly id: string;
  private readonly token: IFaucetToken;
  private readonly userAddress: Address;
  private lastMintTime?: Date;
  private status: FaucetStatus;
  private txHash?: string;
  private readonly createdAt: Date;

  // 业务常量
  private static readonly COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(token: IFaucetToken, userAddress: Address, lastMintTime?: Date) {
    this.id = this.generateId();
    this.token = token;
    this.userAddress = userAddress;
    this.lastMintTime = lastMintTime;
    this.status = FaucetStatus.IDLE;
    this.createdAt = new Date();
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `faucet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 业务规则：验证铸币金额
   *
   * 规则：
   * 1. 金额必须是有效数字
   * 2. 金额必须大于 0
   * 3. 金额不能超过最大铸币数量
   */
  validateMintAmount(amount: string): void {
    const amountNum = parseFloat(amount);
    const maxAmount = parseFloat(this.token.mintAmount);

    // 规则 1：必须是有效数字
    if (isNaN(amountNum)) {
      throw new ValidationError('Mint amount must be a valid number');
    }

    // 规则 2：必须大于 0
    if (amountNum <= 0) {
      throw new ValidationError('Mint amount must be greater than 0');
    }

    // 规则 3：不能超过最大值
    if (amountNum > maxAmount) {
      throw new ValidationError(
        `Mint amount exceeds maximum: ${this.token.mintAmount} ${this.token.symbol}`,
      );
    }
  }

  /**
   * 业务规则：检查是否可以铸币（冷却时间）
   *
   * 规则：
   * - 如果从未铸币，可以铸币
   * - 如果距离上次铸币超过 24 小时，可以铸币
   * - 否则不能铸币
   */
  canMint(): boolean {
    if (!this.lastMintTime) return true;

    const timeSinceLastMint = Date.now() - this.lastMintTime.getTime();
    return timeSinceLastMint > Faucet.COOLDOWN_MS;
  }

  /**
   * 业务逻辑：计算下次可铸币时间
   */
  getNextMintTime(): Date | null {
    if (!this.lastMintTime) return null;

    return new Date(this.lastMintTime.getTime() + Faucet.COOLDOWN_MS);
  }

  /**
   * 业务逻辑：计算剩余冷却时间（秒）
   */
  getRemainingCooldown(): number {
    if (!this.lastMintTime) return 0;

    const timeSinceLastMint = Date.now() - this.lastMintTime.getTime();
    const remaining = Faucet.COOLDOWN_MS - timeSinceLastMint;

    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * 业务逻辑：准备铸币
   *
   * 执行所有铸币前的验证：
   * 1. 验证金额
   * 2. 检查冷却时间
   * 3. 更新状态为 PENDING
   */
  prepareToMint(amount: string): void {
    // 验证金额
    this.validateMintAmount(amount);

    // 检查冷却时间
    if (!this.canMint()) {
      const nextTime = this.getNextMintTime();
      const remaining = this.getRemainingCooldown();
      throw new BusinessRuleError(
        `Cannot mint yet. Please wait ${remaining} seconds. Next mint time: ${nextTime?.toISOString()}`,
      );
    }

    // 状态转换
    if (this.status !== FaucetStatus.IDLE && this.status !== FaucetStatus.ERROR) {
      throw new BusinessRuleError(`Cannot prepare to mint in ${this.status} status`);
    }

    this.status = FaucetStatus.PENDING;
  }

  /**
   * 状态管理：标记铸币成功
   */
  markMintSuccess(txHash: string): void {
    if (this.status !== FaucetStatus.PENDING) {
      throw new BusinessRuleError(`Cannot mark as success in ${this.status} status`);
    }

    this.lastMintTime = new Date();
    this.txHash = txHash;
    this.status = FaucetStatus.SUCCESS;
  }

  /**
   * 状态管理：标记铸币失败
   */
  markMintFailed(error?: string): void {
    if (this.status !== FaucetStatus.PENDING) {
      throw new BusinessRuleError(`Cannot mark as failed in ${this.status} status`);
    }

    this.status = FaucetStatus.ERROR;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.status = FaucetStatus.IDLE;
    this.txHash = undefined;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getToken(): IFaucetToken {
    return this.token;
  }

  getUserAddress(): Address {
    return this.userAddress;
  }

  getStatus(): FaucetStatus {
    return this.status;
  }

  getTxHash(): string | undefined {
    return this.txHash;
  }

  getLastMintTime(): Date | undefined {
    return this.lastMintTime;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * 获取 Faucet 信息（用于日志、调试）
   */
  getInfo() {
    return {
      id: this.id,
      token: {
        address: this.token.address,
        symbol: this.token.symbol,
        name: this.token.name,
        mintAmount: this.token.mintAmount,
      },
      userAddress: this.userAddress,
      status: this.status,
      txHash: this.txHash,
      lastMintTime: this.lastMintTime?.toISOString(),
      canMint: this.canMint(),
      remainingCooldown: this.getRemainingCooldown(),
      nextMintTime: this.getNextMintTime()?.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

// ============================================================================
// 类型定义（用于向后兼容和外部接口）
// ============================================================================

/**
 * 铸币参数
 */
export interface MintTokenParams {
  token: IFaucetToken;
  amount: string;
  userAddress: `0x${string}`;
}

/**
 * 铸币结果
 */
export interface FaucetResult {
  success: boolean;
  txHash: string;
  token: IFaucetToken;
  amount: string;
}

/**
 * @deprecated 使用 FaucetStatus 代替
 */
export enum FaucetTransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
