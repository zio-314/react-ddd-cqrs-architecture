/**
 * 领域值对象：Amount（金额）
 * Domain Value Object: Amount
 *
 * 表示代币金额，提供格式化、验证和计算功能
 */

import { parseUnits, formatUnits } from 'viem';

/**
 * Amount 值对象
 *
 * 不可变对象，表示代币金额
 */
export class Amount {
  /**
   * 金额值（字符串格式，人类可读）
   */
  private readonly value: string;

  /**
   * 小数位数
   */
  private readonly decimals: number;

  /**
   * 构造函数
   *
   * @param value - 金额值（字符串格式）
   * @param decimals - 小数位数
   * @throws Error 如果金额无效
   */
  constructor(value: string, decimals: number) {
    if (!Amount.isValid(value)) {
      throw new Error(`Invalid amount: ${value}`);
    }

    if (decimals < 0 || decimals > 18) {
      throw new Error(`Invalid decimals: ${decimals}`);
    }

    this.value = value;
    this.decimals = decimals;
  }

  /**
   * 获取金额值（字符串格式）
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 获取小数位数
   */
  getDecimals(): number {
    return this.decimals;
  }

  /**
   * 转换为 Wei（bigint）
   */
  toWei(): bigint {
    return parseUnits(this.value, this.decimals);
  }

  /**
   * 转换为 BigInt（别名方法，与 toWei 相同）
   */
  toBigInt(): bigint {
    return this.toWei();
  }

  /**
   * 转换为数字
   */
  toNumber(): number {
    return Number(this.value);
  }

  /**
   * 格式化显示（保留指定小数位）
   *
   * @param maxDecimals - 最大小数位数（默认 6）
   */
  format(maxDecimals: number = 6): string {
    const num = this.toNumber();

    if (num === 0) return '0';

    // 如果是整数，直接返回
    if (Number.isInteger(num)) return num.toString();

    // 格式化小数
    const formatted = num.toFixed(maxDecimals);

    // 移除尾部的 0
    return formatted.replace(/\.?0+$/, '');
  }

  /**
   * 是否为零
   */
  isZero(): boolean {
    return this.toNumber() === 0;
  }

  /**
   * 是否为正数
   */
  isPositive(): boolean {
    return this.toNumber() > 0;
  }

  /**
   * 是否为负数
   */
  isNegative(): boolean {
    return this.toNumber() < 0;
  }

  /**
   * 比较大小
   *
   * @param other - 另一个金额
   * @returns 1 (大于), 0 (等于), -1 (小于)
   */
  compare(other: Amount): number {
    const thisNum = this.toNumber();
    const otherNum = other.toNumber();

    if (thisNum > otherNum) return 1;
    if (thisNum < otherNum) return -1;
    return 0;
  }

  /**
   * 是否大于
   */
  isGreaterThan(other: Amount): boolean {
    return this.compare(other) > 0;
  }

  /**
   * 是否小于
   */
  isLessThan(other: Amount): boolean {
    return this.compare(other) < 0;
  }

  /**
   * 是否等于
   */
  equals(other: Amount): boolean {
    return this.compare(other) === 0;
  }

  /**
   * 加法
   */
  add(other: Amount): Amount {
    if (this.decimals !== other.decimals) {
      throw new Error('Cannot add amounts with different decimals');
    }

    const sum = this.toNumber() + other.toNumber();
    return new Amount(sum.toString(), this.decimals);
  }

  /**
   * 减法
   */
  subtract(other: Amount): Amount {
    if (this.decimals !== other.decimals) {
      throw new Error('Cannot subtract amounts with different decimals');
    }

    const diff = this.toNumber() - other.toNumber();
    return new Amount(diff.toString(), this.decimals);
  }

  /**
   * 乘法（乘以一个数字）
   */
  multiply(multiplier: number): Amount {
    const product = this.toNumber() * multiplier;
    return new Amount(product.toString(), this.decimals);
  }

  /**
   * 除法（除以一个数字）
   */
  divide(divisor: number | Amount): Amount {
    if (typeof divisor === 'number') {
      if (divisor === 0) {
        throw new Error('Cannot divide by zero');
      }
      const quotient = this.toNumber() / divisor;
      return new Amount(quotient.toString(), this.decimals);
    } else {
      // 除以另一个 Amount
      if (divisor.isZero()) {
        throw new Error('Cannot divide by zero');
      }
      const quotient = this.toNumber() / divisor.toNumber();
      return new Amount(quotient.toString(), this.decimals);
    }
  }

  /**
   * 计算百分比
   *
   * @param percentage - 百分比（例如 50 表示 50%）
   */
  percentage(percentage: number): Amount {
    return this.multiply(percentage / 100);
  }

  /**
   * 应用滑点
   *
   * @param slippage - 滑点值对象
   * @returns 应用滑点后的金额
   */
  applySlippage(slippage: { getValue(): number }): Amount {
    const slippageMultiplier = 1 - slippage.getValue();
    return this.multiply(slippageMultiplier);
  }

  /**
   * 验证金额字符串是否有效
   */
  static isValid(value: string): boolean {
    if (!value || value.trim() === '') return false;

    const num = Number(value);

    // 检查是否为有效数字
    if (isNaN(num)) return false;

    // 检查是否为有限数字
    if (!isFinite(num)) return false;

    return true;
  }

  /**
   * 从 Wei 创建 Amount
   *
   * @param wei - Wei 值（bigint）
   * @param decimals - 小数位数
   */
  static fromWei(wei: bigint, decimals: number): Amount {
    const value = formatUnits(wei, decimals);
    return new Amount(value, decimals);
  }

  /**
   * 创建零金额
   *
   * @param decimals - 小数位数
   */
  static zero(decimals: number): Amount {
    return new Amount('0', decimals);
  }

  /**
   * 从数字创建 Amount
   *
   * @param num - 数字
   * @param decimals - 小数位数
   */
  static fromNumber(num: number, decimals: number): Amount {
    return new Amount(num.toString(), decimals);
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 转换为 JSON
   */
  toJSON(): { value: string; decimals: number } {
    return {
      value: this.value,
      decimals: this.decimals,
    };
  }
}
