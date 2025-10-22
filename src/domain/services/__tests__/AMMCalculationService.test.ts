/**
 * 测试：AMM 计算服务
 * Test: AMM Calculation Service
 */

import { AMMCalculationService } from '../AMMCalculationService';
import { Amount } from '../../value-objects/Amount';
import { ValidationError, BusinessRuleError } from '../../errors/DomainError';

describe('AMMCalculationService', () => {
  let service: AMMCalculationService;

  beforeEach(() => {
    service = new AMMCalculationService();
  });

  describe('calculateAmountOut', () => {
    it('应该正确计算输出金额', () => {
      // 模拟一个 ETH/USDC 池子
      // 100 ETH, 200,000 USDC
      // 输入 1 ETH，期望输出约 1,980 USDC（考虑 0.3% 手续费）
      const amountIn = new Amount('1.0', 18);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      const amountOut = service.calculateAmountOut(amountIn, reserveIn, reserveOut, 6);

      // 手工计算：
      // amountInWithFee = 1 * 997 = 997
      // numerator = 997 * 200000 = 199,400,000
      // denominator = 100 * 1000 + 997 = 100,997
      // amountOut = 199,400,000 / 100,997 ≈ 1,974.32
      expect(amountOut.toNumber()).toBeCloseTo(1974.32, 0);
    });

    it('应该在输入为零时抛出错误', () => {
      const amountIn = new Amount('0', 18);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      expect(() => {
        service.calculateAmountOut(amountIn, reserveIn, reserveOut, 6);
      }).toThrow(ValidationError);
    });

    it('应该在流动性不足时抛出错误', () => {
      const amountIn = new Amount('1.0', 18);
      const reserveIn = new Amount('0', 18);
      const reserveOut = new Amount('200000', 6);

      expect(() => {
        service.calculateAmountOut(amountIn, reserveIn, reserveOut, 6);
      }).toThrow(BusinessRuleError);
    });

    it('应该在输入过大导致输出接近储备时计算正确', () => {
      // 输入金额很大，但不会导致错误，只是输出接近储备量
      const amountIn = new Amount('1000', 18);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      const amountOut = service.calculateAmountOut(amountIn, reserveIn, reserveOut, 6);

      // 输出应该小于储备量
      expect(amountOut.toNumber()).toBeLessThan(reserveOut.toNumber());
      expect(amountOut.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('calculateAmountIn', () => {
    it('应该正确计算输入金额', () => {
      // 期望输出 2000 USDC，计算需要多少 ETH
      const amountOut = new Amount('2000', 6);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      const amountIn = service.calculateAmountIn(amountOut, reserveIn, reserveOut, 18);

      // 手工计算：
      // numerator = 100 * 2000 * 1000 = 200,000,000
      // denominator = (200000 - 2000) * 997 = 197,406,000
      // amountIn = 200,000,000 / 197,406,000 + 1 ≈ 2.013
      expect(amountIn.toNumber()).toBeCloseTo(2.013, 2);
    });

    it('应该在期望输出为零时抛出错误', () => {
      const amountOut = new Amount('0', 6);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      expect(() => {
        service.calculateAmountIn(amountOut, reserveIn, reserveOut, 18);
      }).toThrow(ValidationError);
    });

    it('应该在期望输出超过储备时抛出错误', () => {
      const amountOut = new Amount('300000', 6); // 超过储备的 200,000
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      expect(() => {
        service.calculateAmountIn(amountOut, reserveIn, reserveOut, 18);
      }).toThrow(BusinessRuleError);
    });
  });

  describe('calculatePriceImpact', () => {
    it('应该正确计算价格影响', () => {
      // 小额交易，价格影响应该很小
      const amountIn = new Amount('1.0', 18);
      const amountOut = new Amount('1974.08', 6);
      const reserveIn = new Amount('100', 18);
      const reserveOut = new Amount('200000', 6);

      const impact = service.calculatePriceImpact(amountIn, amountOut, reserveIn, reserveOut);

      // 现货价格 = 100 / 200000 = 0.0005
      // 执行价格 = 1 / 1974.08 ≈ 0.000507
      // 价格影响 = |0.000507 - 0.0005| / 0.0005 * 100 ≈ 1.4%
      expect(impact).toBeCloseTo(1.4, 0);
    });

    it('应该在储备为零时返回零', () => {
      const amountIn = new Amount('1.0', 18);
      const amountOut = new Amount('2000', 6);
      const reserveIn = new Amount('0', 18);
      const reserveOut = new Amount('0', 6);

      const impact = service.calculatePriceImpact(amountIn, amountOut, reserveIn, reserveOut);

      expect(impact).toBe(0);
    });
  });

  describe('calculateLPTokens', () => {
    it('应该正确计算第一次添加流动性的 LP Token', () => {
      // 第一次添加：100 ETH + 200,000 USDC
      const amount0 = new Amount('100', 18);
      const amount1 = new Amount('200000', 6);
      const reserve0 = new Amount('0', 18);
      const reserve1 = new Amount('0', 6);
      const totalSupply = new Amount('0', 18);

      const lpTokens = service.calculateLPTokens(amount0, amount1, reserve0, reserve1, totalSupply);

      // sqrt(100 * 200000) - 1000 = sqrt(20,000,000) - 1000 ≈ 4472.136 - 1000 = 3472.136
      expect(lpTokens.toNumber()).toBeCloseTo(3472.136, 1);
    });

    it('应该正确计算后续添加流动性的 LP Token', () => {
      // 池子已有：100 ETH + 200,000 USDC，总供应 3472.136 LP
      // 添加：10 ETH + 20,000 USDC（10% 的流动性）
      const amount0 = new Amount('10', 18);
      const amount1 = new Amount('20000', 6);
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('3472.136', 18);

      const lpTokens = service.calculateLPTokens(amount0, amount1, reserve0, reserve1, totalSupply);

      // liquidity0 = (10 / 100) * 3472.136 = 347.2136
      // liquidity1 = (20000 / 200000) * 3472.136 = 347.2136
      // min(347.2136, 347.2136) = 347.2136
      expect(lpTokens.toNumber()).toBeCloseTo(347.2136, 2);
    });

    it('应该在初始流动性太小时抛出错误', () => {
      // 初始流动性小于 MINIMUM_LIQUIDITY (1000)
      const amount0 = new Amount('1', 18);
      const amount1 = new Amount('1', 6);
      const reserve0 = new Amount('0', 18);
      const reserve1 = new Amount('0', 6);
      const totalSupply = new Amount('0', 18);

      expect(() => {
        service.calculateLPTokens(amount0, amount1, reserve0, reserve1, totalSupply);
      }).toThrow(BusinessRuleError);
    });
  });

  describe('calculateRemoveLiquidity', () => {
    it('应该正确计算移除流动性获得的代币数量', () => {
      // 移除 347.2136 LP（占总供应的 10%）
      const lpTokens = new Amount('347.2136', 18);
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('3472.136', 18);

      const result = service.calculateRemoveLiquidity(
        lpTokens,
        reserve0,
        reserve1,
        totalSupply,
        18,
        6,
      );

      // amount0 = (347.2136 / 3472.136) * 100 = 10
      // amount1 = (347.2136 / 3472.136) * 200000 = 20000
      expect(result.amount0.toNumber()).toBeCloseTo(10, 2);
      expect(result.amount1.toNumber()).toBeCloseTo(20000, 1);
    });

    it('应该在总供应为零时抛出错误', () => {
      const lpTokens = new Amount('100', 18);
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('0', 18);

      expect(() => {
        service.calculateRemoveLiquidity(lpTokens, reserve0, reserve1, totalSupply, 18, 6);
      }).toThrow(BusinessRuleError);
    });

    it('应该在 LP Token 超过总供应时抛出错误', () => {
      const lpTokens = new Amount('5000', 18);
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('3472.136', 18);

      expect(() => {
        service.calculateRemoveLiquidity(lpTokens, reserve0, reserve1, totalSupply, 18, 6);
      }).toThrow(ValidationError);
    });
  });

  describe('getter methods', () => {
    it('应该返回正确的手续费率', () => {
      expect(service.getFeeRate()).toBe(0.003);
    });

    it('应该返回正确的手续费乘数', () => {
      expect(service.getFeeMultiplier()).toBe(997);
    });

    it('应该返回正确的手续费分母', () => {
      expect(service.getFeeDenominator()).toBe(1000);
    });
  });
});

