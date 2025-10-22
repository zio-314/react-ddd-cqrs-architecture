/**
 * 领域值对象：Slippage（滑点）
 * Domain Value Object: Slippage
 *
 * 表示交易滑点容忍度，提供验证和计算功能
 */

import { Amount } from './Amount';

/**
 * Slippage 值对象
 *
 * 不可变对象，表示滑点百分比
 */
export class Slippage {
  /**
   * 滑点值（小数形式，例如 0.005 表示 0.5%）
   */
  private readonly value: number;

  /**
   * 最小滑点（0%）
   */
  static readonly MIN = 0;

  /**
   * 最大滑点（50%）
   */
  static readonly MAX = 0.5;

  /**
   * 默认滑点（0.5%）
   */
  static readonly DEFAULT = 0.005;

  /**
   * 构造函数
   *
   * @param value - 滑点值（小数形式，例如 0.005 表示 0.5%）
   * @throws Error 如果滑点无效
   */
  constructor(value: number) {
    if (!Slippage.isValid(value)) {
      throw new Error(
        `Invalid slippage: ${value}. Must be between ${Slippage.MIN} and ${Slippage.MAX}`,
      );
    }

    this.value = value;
  }

  /**
   * 获取滑点值（小数形式）
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 获取滑点百分比（例如 0.5）
   */
  getPercentage(): number {
    return this.value * 100;
  }

  /**
   * 获取滑点基点（例如 50 基点 = 0.5%）
   */
  getBasisPoints(): number {
    return this.value * 10000;
  }

  /**
   * 格式化显示（例如 "0.5%"）
   */
  format(): string {
    return `${this.getPercentage().toFixed(2)}%`;
  }

  /**
   * 计算最小输出金额（考虑滑点）
   *
   * @param expectedAmount - 预期金额
   * @returns 最小金额
   */
  calculateMinimumAmount(expectedAmount: Amount): Amount {
    const multiplier = 1 - this.value;
    return expectedAmount.multiply(multiplier);
  }

  /**
   * 计算最大输入金额（考虑滑点）
   *
   * @param expectedAmount - 预期金额
   * @returns 最大金额
   */
  calculateMaximumAmount(expectedAmount: Amount): Amount {
    const multiplier = 1 + this.value;
    return expectedAmount.multiply(multiplier);
  }

  /**
   * 检查实际金额是否在滑点范围内
   *
   * @param expectedAmount - 预期金额
   * @param actualAmount - 实际金额
   * @returns 是否在范围内
   */
  isWithinRange(expectedAmount: Amount, actualAmount: Amount): boolean {
    const minAmount = this.calculateMinimumAmount(expectedAmount);
    return actualAmount.isGreaterThan(minAmount) || actualAmount.equals(minAmount);
  }

  /**
   * 计算价格影响百分比
   *
   * @param expectedAmount - 预期金额
   * @param actualAmount - 实际金额
   * @returns 价格影响百分比（小数形式）
   */
  calculatePriceImpact(expectedAmount: Amount, actualAmount: Amount): number {
    if (expectedAmount.isZero()) return 0;

    const diff = expectedAmount.subtract(actualAmount);
    const impact = diff.toNumber() / expectedAmount.toNumber();

    return Math.abs(impact);
  }

  /**
   * 是否为高滑点（> 1%）
   */
  isHigh(): boolean {
    return this.value > 0.01;
  }

  /**
   * 是否为低滑点（< 0.1%）
   */
  isLow(): boolean {
    return this.value < 0.001;
  }

  /**
   * 比较大小
   */
  compare(other: Slippage): number {
    if (this.value > other.value) return 1;
    if (this.value < other.value) return -1;
    return 0;
  }

  /**
   * 是否等于
   */
  equals(other: Slippage): boolean {
    return this.value === other.value;
  }

  /**
   * 验证滑点值是否有效
   *
   * @param value - 滑点值（小数形式）
   */
  static isValid(value: number): boolean {
    // 检查是否为有效数字
    if (isNaN(value) || !isFinite(value)) return false;

    // 检查范围
    if (value < Slippage.MIN || value > Slippage.MAX) return false;

    return true;
  }

  /**
   * 从百分比创建 Slippage
   *
   * @param percentage - 百分比（例如 0.5 表示 0.5%）
   */
  static fromPercent(percentage: number): Slippage {
    return new Slippage(percentage / 100);
  }

  /**
   * 从基点创建 Slippage
   *
   * @param basisPoints - 基点（例如 50 基点 = 0.5%）
   */
  static fromBasisPoints(basisPoints: number): Slippage {
    return new Slippage(basisPoints / 10000);
  }

  /**
   * 从字符串创建 Slippage
   *
   * @param str - 字符串（例如 "0.5" 表示 0.5%）
   */
  static fromString(str: string): Slippage {
    const num = Number(str);
    if (isNaN(num)) {
      throw new Error(`Invalid slippage string: ${str}`);
    }
    return Slippage.fromPercent(num);
  }

  /**
   * 创建默认滑点（0.5%）
   */
  static default(): Slippage {
    return new Slippage(Slippage.DEFAULT);
  }

  /**
   * 创建低滑点（0.1%）
   */
  static low(): Slippage {
    return Slippage.fromPercent(0.1);
  }

  /**
   * 创建中等滑点（0.5%）
   */
  static medium(): Slippage {
    return Slippage.fromPercent(0.5);
  }

  /**
   * 创建高滑点（1%）
   */
  static high(): Slippage {
    return Slippage.fromPercent(1);
  }

  /**
   * 转换为字符串（百分比格式）
   */
  toString(): string {
    return this.getPercentage().toString();
  }

  /**
   * 转换为 JSON
   */
  toJSON(): { value: number; percentage: number; basisPoints: number } {
    return {
      value: this.value,
      percentage: this.getPercentage(),
      basisPoints: this.getBasisPoints(),
    };
  }
}
