/**
 * 领域实体：Token（代币）
 * Domain Entity: Token
 *
 * ⭐ 充血模型 - 封装代币相关的业务逻辑
 */

import { Address } from 'viem';
import { ITokenRaw } from '@/types';
import { ValidationError } from '../errors/DomainError';

/**
 * Token 接口（用于数据传输）
 *
 * 注意：内部使用 Token 类，对外可以使用 IToken 接口
 */
export interface IToken {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  balance?: string;

  // 统计字段（可选，用于 tokens 页面）
  price?: string;
  change?: string;
  volume?: string;
  liquidity?: string;
  positive?: boolean;
}

/**
 * Token 类（充血模型）
 *
 * ⭐ 设计决策：
 * - Token 是值对象（Value Object）
 * - 不可变（所有字段 readonly）
 * - 通过值相等性比较（equals 方法）
 * - 封装业务逻辑和工具方法
 * - 内部存储原始数据（raw），通过 getter 提供访问
 */
export class Token {
  private readonly raw: ITokenRaw;

  /**
   * 私有构造函数 - 强制使用工厂方法创建
   */
  private constructor(raw: ITokenRaw) {
    this.raw = raw;
  }

  /**
   * ⭐ 工厂方法：从原始数据创建 Token 实例
   */
  static fromRaw(raw: ITokenRaw): Token {
    // ⭐ 业务规则验证
    Token.validate(raw);

    // 规范化地址（统一小写）
    const normalizedRaw = {
      ...raw,
      address: raw.address.toLowerCase(),
    };

    return new Token(normalizedRaw);
  }

  /**
   * ⭐ 业务规则验证
   */
  private static validate(raw: ITokenRaw): void {
    if (!raw.address || raw.address === '0x') {
      throw new ValidationError('Token address is required');
    }

    if (!raw.symbol || raw.symbol.trim() === '') {
      throw new ValidationError('Token symbol is required');
    }

    if (!raw.name || raw.name.trim() === '') {
      throw new ValidationError('Token name is required');
    }

    if (raw.decimals < 0 || raw.decimals > 18) {
      throw new ValidationError('Token decimals must be between 0 and 18');
    }
  }

  // ==================== Getters ====================

  get address(): Address {
    return this.raw.address as Address;
  }

  get symbol(): string {
    return this.raw.symbol;
  }

  get name(): string {
    return this.raw.name;
  }

  get decimals(): number {
    return this.raw.decimals;
  }

  get logo(): string | undefined {
    return this.raw.icon;
  }

  get price(): string | undefined {
    return this.raw.price;
  }

  get change(): string | undefined {
    return this.raw.change;
  }

  get volume(): string | undefined {
    return this.raw.volume;
  }

  get liquidity(): string | undefined {
    return this.raw.liquidity;
  }

  get positive(): boolean | undefined {
    return this.raw.positive;
  }

  // ==================== ⭐ 业务方法 ====================

  /**
   * 获取简短地址（0x1234...5678）
   */
  get shortAddress(): string {
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  }

  /**
   * 获取图标 URL
   */
  get iconURL(): string {
    return this.logo ?? '';
  }

  /**
   * 格式化代币名称
   */
  get nameFormatted(): string {
    if (this.name === 'USDCe') return 'USDC.e';
    return this.name;
  }

  /**
   * 检查是否为 ETH/WETH
   */
  get isETH(): boolean {
    return this.symbol === 'ETH' || this.symbol === 'WETH';
  }

  /**
   * 检查是否为原生代币
   */
  isNative(): boolean {
    return this.isETH;
  }

  /**
   * ⭐ 值对象的核心方法 - 值相等性比较
   */
  equals(other: Token): boolean {
    return this.address === other.address;
  }

  /**
   * 转换为普通对象（用于序列化）
   */
  toObject(): IToken {
    return {
      address: this.address,
      symbol: this.symbol,
      name: this.name,
      decimals: this.decimals,
      logo: this.logo,
      price: this.price,
      change: this.change,
      volume: this.volume,
      liquidity: this.liquidity,
      positive: this.positive,
    };
  }

  /**
   * 从普通对象创建 Token 实例（工厂方法）
   */
  static fromObject(obj: IToken): Token {
    return Token.fromRaw({
      address: obj.address,
      symbol: obj.symbol,
      name: obj.name,
      decimals: obj.decimals,
      icon: obj.logo,
      price: obj.price,
      change: obj.change,
      volume: obj.volume,
      liquidity: obj.liquidity,
      positive: obj.positive,
    });
  }

  /**
   * ⭐ 创建一个新的 Token 实例（带更新的字段）
   * 因为 Token 是不可变的，所以需要创建新实例
   */
  withBalance(balance: string): Token {
    // 注意：balance 不在 ITokenRaw 中，这里需要扩展
    // 暂时通过 toObject 转换
    const obj = this.toObject();
    return Token.fromObject({ ...obj, balance });
  }

  withPrice(price: string): Token {
    return Token.fromRaw({
      ...this.raw,
      price,
    });
  }
}
