/**
 * 单元测试：Amount 值对象
 * Unit Test: Amount Value Object
 */

import { Amount } from '../Amount';

describe('Amount Value Object', () => {
  describe('构造函数 (Constructor)', () => {
    it('应该成功创建有效的 Amount', () => {
      const amount = new Amount('100', 18);
      expect(amount.getValue()).toBe('100');
      expect(amount.getDecimals()).toBe(18);
    });

    it('应该拒绝无效的金额值', () => {
      expect(() => new Amount('', 18)).toThrow('Invalid amount');
      expect(() => new Amount('abc', 18)).toThrow('Invalid amount');
      expect(() => new Amount('NaN', 18)).toThrow('Invalid amount');
      expect(() => new Amount('Infinity', 18)).toThrow('Invalid amount');
    });

    it('应该拒绝无效的小数位数', () => {
      expect(() => new Amount('100', -1)).toThrow('Invalid decimals');
      expect(() => new Amount('100', 19)).toThrow('Invalid decimals');
    });

    it('应该接受边界值的小数位数', () => {
      expect(() => new Amount('100', 0)).not.toThrow();
      expect(() => new Amount('100', 18)).not.toThrow();
    });
  });

  describe('静态工厂方法 (Static Factory Methods)', () => {
    it('zero() 应该创建零金额', () => {
      const zero = Amount.zero(18);
      expect(zero.getValue()).toBe('0');
      expect(zero.isZero()).toBe(true);
    });

    it('fromNumber() 应该从数字创建 Amount', () => {
      const amount = Amount.fromNumber(123.456, 18);
      expect(amount.toNumber()).toBe(123.456);
    });

    it('fromWei() 应该从 Wei 创建 Amount', () => {
      const wei = BigInt('1000000000000000000'); // 1 ETH
      const amount = Amount.fromWei(wei, 18);
      expect(amount.getValue()).toBe('1');
    });

    it('isValid() 应该正确验证金额字符串', () => {
      expect(Amount.isValid('100')).toBe(true);
      expect(Amount.isValid('0.5')).toBe(true);
      expect(Amount.isValid('0')).toBe(true);
      expect(Amount.isValid('')).toBe(false);
      expect(Amount.isValid('abc')).toBe(false);
      expect(Amount.isValid('Infinity')).toBe(false);
    });
  });

  describe('转换方法 (Conversion Methods)', () => {
    it('toWei() 应该正确转换为 Wei', () => {
      const amount = new Amount('1', 18);
      expect(amount.toWei()).toBe(BigInt('1000000000000000000'));
    });

    it('toBigInt() 应该与 toWei() 返回相同值', () => {
      const amount = new Amount('1.5', 18);
      expect(amount.toBigInt()).toBe(amount.toWei());
    });

    it('toNumber() 应该正确转换为数字', () => {
      const amount = new Amount('123.456', 18);
      expect(amount.toNumber()).toBe(123.456);
    });

    it('toString() 应该返回原始值', () => {
      const amount = new Amount('100.5', 18);
      expect(amount.toString()).toBe('100.5');
    });

    it('toJSON() 应该返回正确的 JSON 对象', () => {
      const amount = new Amount('100', 18);
      expect(amount.toJSON()).toEqual({ value: '100', decimals: 18 });
    });
  });

  describe('格式化方法 (Formatting Methods)', () => {
    it('format() 应该正确格式化金额', () => {
      const amount1 = new Amount('123.456789', 18);
      expect(amount1.format(2)).toBe('123.46');
      expect(amount1.format(4)).toBe('123.4568');
    });

    it('format() 应该移除尾部的零', () => {
      const amount = new Amount('100.5000', 18);
      expect(amount.format(6)).toBe('100.5');
    });

    it('format() 应该正确处理零', () => {
      const zero = Amount.zero(18);
      expect(zero.format()).toBe('0');
    });

    it('format() 应该正确处理整数', () => {
      const amount = new Amount('100', 18);
      expect(amount.format()).toBe('100');
    });
  });

  describe('判断方法 (Predicate Methods)', () => {
    it('isZero() 应该正确判断零', () => {
      expect(Amount.zero(18).isZero()).toBe(true);
      expect(new Amount('0.0', 18).isZero()).toBe(true);
      expect(new Amount('1', 18).isZero()).toBe(false);
    });

    it('isPositive() 应该正确判断正数', () => {
      expect(new Amount('1', 18).isPositive()).toBe(true);
      expect(new Amount('0.1', 18).isPositive()).toBe(true);
      expect(Amount.zero(18).isPositive()).toBe(false);
      expect(new Amount('-1', 18).isPositive()).toBe(false);
    });

    it('isNegative() 应该正确判断负数', () => {
      expect(new Amount('-1', 18).isNegative()).toBe(true);
      expect(new Amount('-0.1', 18).isNegative()).toBe(true);
      expect(Amount.zero(18).isNegative()).toBe(false);
      expect(new Amount('1', 18).isNegative()).toBe(false);
    });
  });

  describe('比较方法 (Comparison Methods)', () => {
    const amount1 = new Amount('100', 18);
    const amount2 = new Amount('200', 18);
    const amount3 = new Amount('100', 18);

    it('compare() 应该正确比较大小', () => {
      expect(amount1.compare(amount2)).toBe(-1);
      expect(amount2.compare(amount1)).toBe(1);
      expect(amount1.compare(amount3)).toBe(0);
    });

    it('isGreaterThan() 应该正确判断大于', () => {
      expect(amount2.isGreaterThan(amount1)).toBe(true);
      expect(amount1.isGreaterThan(amount2)).toBe(false);
      expect(amount1.isGreaterThan(amount3)).toBe(false);
    });

    it('isLessThan() 应该正确判断小于', () => {
      expect(amount1.isLessThan(amount2)).toBe(true);
      expect(amount2.isLessThan(amount1)).toBe(false);
      expect(amount1.isLessThan(amount3)).toBe(false);
    });

    it('equals() 应该正确判断相等', () => {
      expect(amount1.equals(amount3)).toBe(true);
      expect(amount1.equals(amount2)).toBe(false);
    });
  });

  describe('算术运算 (Arithmetic Operations)', () => {
    it('add() 应该正确执行加法', () => {
      const a = new Amount('100', 18);
      const b = new Amount('50', 18);
      const sum = a.add(b);
      expect(sum.toNumber()).toBe(150);
    });

    it('add() 应该拒绝不同小数位数的金额', () => {
      const a = new Amount('100', 18);
      const b = new Amount('50', 6);
      expect(() => a.add(b)).toThrow('Cannot add amounts with different decimals');
    });

    it('subtract() 应该正确执行减法', () => {
      const a = new Amount('100', 18);
      const b = new Amount('30', 18);
      const diff = a.subtract(b);
      expect(diff.toNumber()).toBe(70);
    });

    it('subtract() 应该拒绝不同小数位数的金额', () => {
      const a = new Amount('100', 18);
      const b = new Amount('30', 6);
      expect(() => a.subtract(b)).toThrow('Cannot subtract amounts with different decimals');
    });

    it('multiply() 应该正确执行乘法', () => {
      const amount = new Amount('100', 18);
      const product = amount.multiply(2.5);
      expect(product.toNumber()).toBe(250);
    });

    it('divide() 应该正确执行除法（除以数字）', () => {
      const amount = new Amount('100', 18);
      const quotient = amount.divide(4);
      expect(quotient.toNumber()).toBe(25);
    });

    it('divide() 应该正确执行除法（除以 Amount）', () => {
      const a = new Amount('100', 18);
      const b = new Amount('4', 18);
      const quotient = a.divide(b);
      expect(quotient.toNumber()).toBe(25);
    });

    it('divide() 应该拒绝除以零', () => {
      const amount = new Amount('100', 18);
      expect(() => amount.divide(0)).toThrow('Cannot divide by zero');
      expect(() => amount.divide(Amount.zero(18))).toThrow('Cannot divide by zero');
    });

    it('percentage() 应该正确计算百分比', () => {
      const amount = new Amount('100', 18);
      const fifty = amount.percentage(50);
      expect(fifty.toNumber()).toBe(50);
    });
  });

  describe('滑点应用 (Slippage Application)', () => {
    it('applySlippage() 应该正确应用滑点', () => {
      const amount = new Amount('100', 18);
      const slippage = { getValue: () => 0.05 }; // 5% 滑点
      const result = amount.applySlippage(slippage);
      expect(result.toNumber()).toBe(95);
    });

    it('applySlippage() 应该处理零滑点', () => {
      const amount = new Amount('100', 18);
      const slippage = { getValue: () => 0 }; // 0% 滑点
      const result = amount.applySlippage(slippage);
      expect(result.toNumber()).toBe(100);
    });
  });

  describe('不可变性 (Immutability)', () => {
    it('算术运算应该返回新的 Amount 实例', () => {
      const original = new Amount('100', 18);
      const doubled = original.multiply(2);

      expect(original.toNumber()).toBe(100);
      expect(doubled.toNumber()).toBe(200);
      expect(original).not.toBe(doubled);
    });

    it('所有操作不应该修改原始对象', () => {
      const amount = new Amount('100', 18);
      const originalValue = amount.getValue();

      amount.add(new Amount('50', 18));
      amount.multiply(2);
      amount.format();

      expect(amount.getValue()).toBe(originalValue);
    });
  });
});
