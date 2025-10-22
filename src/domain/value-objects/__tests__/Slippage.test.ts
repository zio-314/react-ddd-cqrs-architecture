/**
 * 单元测试：Slippage 值对象
 * Unit Test: Slippage Value Object
 */

import { Slippage } from '../Slippage';
import { Amount } from '../Amount';

describe('Slippage Value Object', () => {
  describe('构造函数 (Constructor)', () => {
    it('应该成功创建有效的 Slippage', () => {
      const slippage = new Slippage(0.005);
      expect(slippage.getValue()).toBe(0.005);
    });

    it('应该拒绝无效的滑点值', () => {
      expect(() => new Slippage(-0.1)).toThrow('Invalid slippage');
      expect(() => new Slippage(0.6)).toThrow('Invalid slippage');
      expect(() => new Slippage(NaN)).toThrow('Invalid slippage');
      expect(() => new Slippage(Infinity)).toThrow('Invalid slippage');
    });

    it('应该接受边界值', () => {
      expect(() => new Slippage(Slippage.MIN)).not.toThrow();
      expect(() => new Slippage(Slippage.MAX)).not.toThrow();
    });
  });

  describe('常量 (Constants)', () => {
    it('应该定义正确的常量值', () => {
      expect(Slippage.MIN).toBe(0);
      expect(Slippage.MAX).toBe(0.5);
      expect(Slippage.DEFAULT).toBe(0.005);
    });
  });

  describe('静态工厂方法 (Static Factory Methods)', () => {
    it('fromPercent() 应该从百分比创建 Slippage', () => {
      const slippage = Slippage.fromPercent(0.5);
      expect(slippage.getValue()).toBe(0.005);
      expect(slippage.getPercentage()).toBe(0.5);
    });

    it('fromBasisPoints() 应该从基点创建 Slippage', () => {
      const slippage = Slippage.fromBasisPoints(50);
      expect(slippage.getValue()).toBe(0.005);
      expect(slippage.getBasisPoints()).toBe(50);
    });

    it('fromString() 应该从字符串创建 Slippage', () => {
      const slippage = Slippage.fromString('0.5');
      expect(slippage.getPercentage()).toBe(0.5);
    });

    it('fromString() 应该拒绝无效字符串', () => {
      expect(() => Slippage.fromString('abc')).toThrow('Invalid slippage string');
    });

    it('default() 应该创建默认滑点', () => {
      const slippage = Slippage.default();
      expect(slippage.getValue()).toBe(Slippage.DEFAULT);
    });

    it('low() 应该创建低滑点', () => {
      const slippage = Slippage.low();
      expect(slippage.getPercentage()).toBe(0.1);
    });

    it('medium() 应该创建中等滑点', () => {
      const slippage = Slippage.medium();
      expect(slippage.getPercentage()).toBe(0.5);
    });

    it('high() 应该创建高滑点', () => {
      const slippage = Slippage.high();
      expect(slippage.getPercentage()).toBe(1);
    });

    it('isValid() 应该正确验证滑点值', () => {
      expect(Slippage.isValid(0.005)).toBe(true);
      expect(Slippage.isValid(0)).toBe(true);
      expect(Slippage.isValid(0.5)).toBe(true);
      expect(Slippage.isValid(-0.1)).toBe(false);
      expect(Slippage.isValid(0.6)).toBe(false);
      expect(Slippage.isValid(NaN)).toBe(false);
      expect(Slippage.isValid(Infinity)).toBe(false);
    });
  });

  describe('转换方法 (Conversion Methods)', () => {
    const slippage = new Slippage(0.005);

    it('getValue() 应该返回小数形式', () => {
      expect(slippage.getValue()).toBe(0.005);
    });

    it('getPercentage() 应该返回百分比', () => {
      expect(slippage.getPercentage()).toBe(0.5);
    });

    it('getBasisPoints() 应该返回基点', () => {
      expect(slippage.getBasisPoints()).toBe(50);
    });

    it('format() 应该格式化为百分比字符串', () => {
      expect(slippage.format()).toBe('0.50%');
    });

    it('toString() 应该返回百分比字符串', () => {
      expect(slippage.toString()).toBe('0.5');
    });

    it('toJSON() 应该返回完整的 JSON 对象', () => {
      expect(slippage.toJSON()).toEqual({
        value: 0.005,
        percentage: 0.5,
        basisPoints: 50,
      });
    });
  });

  describe('判断方法 (Predicate Methods)', () => {
    it('isHigh() 应该正确判断高滑点', () => {
      expect(Slippage.fromPercent(2).isHigh()).toBe(true);
      expect(Slippage.fromPercent(0.5).isHigh()).toBe(false);
    });

    it('isLow() 应该正确判断低滑点', () => {
      expect(Slippage.fromPercent(0.05).isLow()).toBe(true);
      expect(Slippage.fromPercent(0.5).isLow()).toBe(false);
    });
  });

  describe('比较方法 (Comparison Methods)', () => {
    const slippage1 = Slippage.fromPercent(0.5);
    const slippage2 = Slippage.fromPercent(1);
    const slippage3 = Slippage.fromPercent(0.5);

    it('compare() 应该正确比较大小', () => {
      expect(slippage1.compare(slippage2)).toBe(-1);
      expect(slippage2.compare(slippage1)).toBe(1);
      expect(slippage1.compare(slippage3)).toBe(0);
    });

    it('equals() 应该正确判断相等', () => {
      expect(slippage1.equals(slippage3)).toBe(true);
      expect(slippage1.equals(slippage2)).toBe(false);
    });
  });

  describe('金额计算 (Amount Calculations)', () => {
    const slippage = Slippage.fromPercent(5); // 5% 滑点
    const amount = new Amount('100', 18);

    it('calculateMinimumAmount() 应该正确计算最小金额', () => {
      const minAmount = slippage.calculateMinimumAmount(amount);
      expect(minAmount.toNumber()).toBe(95);
    });

    it('calculateMaximumAmount() 应该正确计算最大金额', () => {
      const maxAmount = slippage.calculateMaximumAmount(amount);
      expect(maxAmount.toNumber()).toBe(105);
    });

    it('isWithinRange() 应该正确判断是否在范围内', () => {
      const actualAmount1 = new Amount('96', 18);
      const actualAmount2 = new Amount('94', 18);
      const actualAmount3 = new Amount('95', 18); // 边界值

      expect(slippage.isWithinRange(amount, actualAmount1)).toBe(true);
      expect(slippage.isWithinRange(amount, actualAmount2)).toBe(false);
      expect(slippage.isWithinRange(amount, actualAmount3)).toBe(true);
    });

    it('calculatePriceImpact() 应该正确计算价格影响', () => {
      const actualAmount = new Amount('97', 18);
      const impact = slippage.calculatePriceImpact(amount, actualAmount);
      expect(impact).toBe(0.03); // 3% 价格影响
    });

    it('calculatePriceImpact() 应该处理零金额', () => {
      const zeroAmount = Amount.zero(18);
      const impact = slippage.calculatePriceImpact(zeroAmount, amount);
      expect(impact).toBe(0);
    });

    it('calculatePriceImpact() 应该返回绝对值', () => {
      const higherAmount = new Amount('103', 18);
      const impact = slippage.calculatePriceImpact(amount, higherAmount);
      expect(impact).toBe(0.03); // 应该是正数
    });
  });

  describe('边界情况 (Edge Cases)', () => {
    it('应该处理零滑点', () => {
      const zeroSlippage = new Slippage(0);
      const amount = new Amount('100', 18);

      expect(zeroSlippage.calculateMinimumAmount(amount).toNumber()).toBe(100);
      expect(zeroSlippage.calculateMaximumAmount(amount).toNumber()).toBe(100);
    });

    it('应该处理最大滑点', () => {
      const maxSlippage = new Slippage(Slippage.MAX);
      const amount = new Amount('100', 18);

      expect(maxSlippage.calculateMinimumAmount(amount).toNumber()).toBe(50);
      expect(maxSlippage.calculateMaximumAmount(amount).toNumber()).toBe(150);
    });

    it('应该处理小数滑点', () => {
      const slippage = Slippage.fromPercent(0.123);
      expect(slippage.format()).toBe('0.12%');
    });
  });

  describe('不可变性 (Immutability)', () => {
    it('计算方法应该返回新的 Amount 实例', () => {
      const slippage = Slippage.fromPercent(5);
      const amount = new Amount('100', 18);

      const minAmount = slippage.calculateMinimumAmount(amount);
      const maxAmount = slippage.calculateMaximumAmount(amount);

      expect(amount.toNumber()).toBe(100);
      expect(minAmount).not.toBe(amount);
      expect(maxAmount).not.toBe(amount);
    });

    it('所有操作不应该修改原始对象', () => {
      const slippage = Slippage.fromPercent(5);
      const originalValue = slippage.getValue();
      const amount = new Amount('100', 18);

      slippage.calculateMinimumAmount(amount);
      slippage.calculateMaximumAmount(amount);
      slippage.format();
      slippage.toString();

      expect(slippage.getValue()).toBe(originalValue);
    });
  });

  describe('实际使用场景 (Real-world Scenarios)', () => {
    it('应该正确处理 Uniswap 默认滑点 (0.5%)', () => {
      const slippage = Slippage.fromPercent(0.5);
      const expectedOutput = new Amount('1000', 18);
      const minOutput = slippage.calculateMinimumAmount(expectedOutput);

      expect(minOutput.toNumber()).toBe(995);
    });

    it('应该正确处理高波动性代币的滑点 (5%)', () => {
      const slippage = Slippage.fromPercent(5);
      const expectedOutput = new Amount('1000', 18);
      const minOutput = slippage.calculateMinimumAmount(expectedOutput);

      expect(minOutput.toNumber()).toBe(950);
    });

    it('应该正确处理稳定币交易的低滑点 (0.1%)', () => {
      const slippage = Slippage.fromPercent(0.1);
      const expectedOutput = new Amount('1000', 6); // USDC
      const minOutput = slippage.calculateMinimumAmount(expectedOutput);

      expect(minOutput.toNumber()).toBe(999);
    });
  });
});
