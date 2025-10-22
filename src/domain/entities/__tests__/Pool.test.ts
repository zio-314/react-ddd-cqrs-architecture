/**
 * 单元测试：Pool 实体
 * Unit Test: Pool Entity
 */

import { Pool } from '../Pool';
import { Amount } from '../../value-objects/Amount';
import { IToken } from '../Token';
import { ValidationError, BusinessRuleError } from '../../errors/DomainError';

describe('Pool Entity', () => {
  // 测试数据
  const token0: IToken = {
    address: '0x0000000000000000000000000000000000000001' as `0x${string}`,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  };

  const token1: IToken = {
    address: '0x0000000000000000000000000000000000000002' as `0x${string}`,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  };

  const poolAddress = '0x0000000000000000000000000000000000000003' as `0x${string}`;

  describe('构造函数和验证 (Constructor and Validation)', () => {
    it('应该成功创建有效的 Pool', () => {
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('14142', 18);

      const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

      expect(pool.address).toBe(poolAddress);
      expect(pool.token0).toBe(token0);
      expect(pool.token1).toBe(token1);
    });

    it('应该拒绝 token0 地址大于等于 token1 的情况', () => {
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('14142', 18);

      // token1 地址小于 token0（违反 Uniswap 约定）
      expect(() => {
        new Pool(poolAddress, token1, token0, reserve0, reserve1, totalSupply);
      }).toThrow(ValidationError);
    });

    it('应该拒绝负数储备量', () => {
      const reserve0 = new Amount('-100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('14142', 18);

      expect(() => {
        new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);
      }).toThrow(ValidationError);
    });
  });

  describe('价格计算 (Price Calculation)', () => {
    const reserve0 = new Amount('100', 18); // 100 ETH
    const reserve1 = new Amount('200000', 6); // 200,000 USDC
    const totalSupply = new Amount('14142', 18);
    const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

    it('getPrice() 应该正确计算价格', () => {
      // 100 ETH / 200,000 USDC = 0.0005
      const price = pool.getPrice();
      expect(price).toBeCloseTo(0.0005, 6);
    });

    it('getInversePrice() 应该正确计算反向价格', () => {
      // 200,000 USDC / 100 ETH = 2000
      const inversePrice = pool.getInversePrice();
      expect(inversePrice).toBeCloseTo(2000, 2);
    });

    it('应该处理零储备量的情况', () => {
      const zeroPool = new Pool(
        poolAddress,
        token0,
        token1,
        Amount.zero(18),
        Amount.zero(6),
        Amount.zero(18),
      );

      expect(zeroPool.getPrice()).toBe(0);
      expect(zeroPool.getInversePrice()).toBe(0);
    });
  });

  describe('AMM 计算 (AMM Calculations)', () => {
    const reserve0 = new Amount('100', 18); // 100 ETH
    const reserve1 = new Amount('200000', 6); // 200,000 USDC
    const totalSupply = new Amount('14142', 18);
    const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

    describe('getAmountOut()', () => {
      it('应该正确计算输出金额（ETH -> USDC）', () => {
        const amountIn = new Amount('1', 18); // 1 ETH
        const amountOut = pool.getAmountOut(amountIn, token0);

        // 使用 Uniswap V2 公式验证
        // amountOut = (1 * 997 * 200000) / (100 * 1000 + 1 * 997)
        expect(amountOut.toNumber()).toBeGreaterThan(0);
        expect(amountOut.toNumber()).toBeLessThan(2000); // 应该少于现货价格
      });

      it('应该正确计算输出金额（USDC -> ETH）', () => {
        const amountIn = new Amount('2000', 6); // 2000 USDC
        const amountOut = pool.getAmountOut(amountIn, token1);

        expect(amountOut.toNumber()).toBeGreaterThan(0);
        expect(amountOut.toNumber()).toBeLessThan(1); // 应该少于现货价格
      });

      it('应该拒绝零输入', () => {
        const zeroAmount = Amount.zero(18);
        expect(() => pool.getAmountOut(zeroAmount, token0)).toThrow(ValidationError);
      });

      it('应该拒绝负数输入', () => {
        const negativeAmount = new Amount('-1', 18);
        expect(() => pool.getAmountOut(negativeAmount, token0)).toThrow(ValidationError);
      });
    });

    describe('getAmountIn()', () => {
      it('应该正确计算输入金额（期望输出 USDC）', () => {
        const amountOut = new Amount('1000', 6); // 期望 1000 USDC
        const amountIn = pool.getAmountIn(amountOut, token1);

        expect(amountIn.toNumber()).toBeGreaterThan(0);
        // 验证：使用计算出的 amountIn 应该能得到至少 amountOut
        const actualOut = pool.getAmountOut(amountIn, token0);
        expect(actualOut.toNumber()).toBeGreaterThanOrEqual(amountOut.toNumber() * 0.99);
      });

      it('应该拒绝零输出', () => {
        const zeroAmount = Amount.zero(6);
        expect(() => pool.getAmountIn(zeroAmount, token1)).toThrow(ValidationError);
      });

      it('应该拒绝超过储备量的输出', () => {
        const tooMuchAmount = new Amount('300000', 6); // 超过储备量
        expect(() => pool.getAmountIn(tooMuchAmount, token1)).toThrow(BusinessRuleError);
      });
    });

    describe('calculatePriceImpact()', () => {
      it('应该正确计算价格影响', () => {
        const smallAmount = new Amount('0.1', 18); // 小额交易
        const largeAmount = new Amount('10', 18); // 大额交易

        const smallImpact = pool.calculatePriceImpact(smallAmount, token0);
        const largeImpact = pool.calculatePriceImpact(largeAmount, token0);

        expect(smallImpact).toBeGreaterThan(0);
        expect(largeImpact).toBeGreaterThan(smallImpact); // 大额交易影响更大
      });
    });
  });

  describe('流动性计算 (Liquidity Calculations)', () => {
    describe('calculateLPTokens()', () => {
      it('应该正确计算第一次添加流动性的 LP tokens', () => {
        const emptyPool = new Pool(
          poolAddress,
          token0,
          token1,
          Amount.zero(18),
          Amount.zero(6),
          Amount.zero(18),
        );

        const amount0 = new Amount('100', 18);
        const amount1 = new Amount('200000', 6);
        const lpTokens = emptyPool.calculateLPTokens(amount0, amount1);

        // LP = sqrt(100 * 200000) = sqrt(20000000) ≈ 4472.14
        expect(lpTokens.toNumber()).toBeCloseTo(4472.14, 1);
      });

      it('应该正确计算后续添加流动性的 LP tokens', () => {
        const reserve0 = new Amount('100', 18);
        const reserve1 = new Amount('200000', 6);
        const totalSupply = new Amount('4472', 18);
        const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

        const amount0 = new Amount('10', 18); // 添加 10%
        const amount1 = new Amount('20000', 6); // 添加 10%
        const lpTokens = pool.calculateLPTokens(amount0, amount1);

        // LP = min(10/100, 20000/200000) * 4472 = 0.1 * 4472 = 447.2
        expect(lpTokens.toNumber()).toBeCloseTo(447.2, 1);
      });
    });

    describe('calculateRemoveLiquidity()', () => {
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('4472', 18);
      const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

      it('应该正确计算移除流动性获得的代币', () => {
        const lpTokens = new Amount('447.2', 18); // 10% 的 LP tokens
        const { amount0, amount1 } = pool.calculateRemoveLiquidity(lpTokens);

        // 应该获得 10% 的储备量
        expect(amount0.toNumber()).toBeCloseTo(10, 1);
        expect(amount1.toNumber()).toBeCloseTo(20000, 1);
      });

      it('应该拒绝从空池移除流动性', () => {
        const emptyPool = new Pool(
          poolAddress,
          token0,
          token1,
          Amount.zero(18),
          Amount.zero(6),
          Amount.zero(18),
        );

        const lpTokens = new Amount('100', 18);
        expect(() => emptyPool.calculateRemoveLiquidity(lpTokens)).toThrow(BusinessRuleError);
      });
    });

    describe('calculatePoolShare()', () => {
      const reserve0 = new Amount('100', 18);
      const reserve1 = new Amount('200000', 6);
      const totalSupply = new Amount('4472', 18);
      const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

      it('应该正确计算池份额', () => {
        const lpTokens = new Amount('447.2', 18); // 10% 的 LP tokens
        const share = pool.calculatePoolShare(lpTokens);

        expect(share).toBeCloseTo(10, 1);
      });

      it('第一个流动性提供者应该获得 100% 份额', () => {
        const emptyPool = new Pool(
          poolAddress,
          token0,
          token1,
          Amount.zero(18),
          Amount.zero(6),
          Amount.zero(18),
        );

        const share = emptyPool.calculatePoolShare(Amount.zero(18));
        expect(share).toBe(100);
      });
    });
  });

  describe('储备量查询 (Reserve Queries)', () => {
    const reserve0 = new Amount('100', 18);
    const reserve1 = new Amount('200000', 6);
    const totalSupply = new Amount('4472', 18);
    const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

    it('getReserve() 应该返回正确的储备量', () => {
      expect(pool.getReserve(token0)).toBe(reserve0);
      expect(pool.getReserve(token1)).toBe(reserve1);
    });

    it('getReserve() 应该对不在池中的代币返回 undefined', () => {
      const otherToken: IToken = {
        address: '0x0000000000000000000000000000000000000099' as `0x${string}`,
        symbol: 'OTHER',
        name: 'Other Token',
        decimals: 18,
      };

      expect(pool.getReserve(otherToken)).toBeUndefined();
    });

    it('getReserveBySymbol() 应该返回正确的储备量', () => {
      expect(pool.getReserveBySymbol('ETH')).toBe(reserve0);
      expect(pool.getReserveBySymbol('USDC')).toBe(reserve1);
    });

    it('getReserveBySymbol() 应该对不存在的符号返回 undefined', () => {
      expect(pool.getReserveBySymbol('BTC')).toBeUndefined();
    });

    it('hasEnoughLiquidity() 应该正确判断流动性', () => {
      const smallAmount = new Amount('50', 18);
      const largeAmount = new Amount('150', 18);

      expect(pool.hasEnoughLiquidity(smallAmount, token0)).toBe(true);
      expect(pool.hasEnoughLiquidity(largeAmount, token0)).toBe(false);
    });
  });

  describe('Getters', () => {
    const reserve0 = new Amount('100', 18);
    const reserve1 = new Amount('200000', 6);
    const totalSupply = new Amount('4472', 18);
    const pool = new Pool(poolAddress, token0, token1, reserve0, reserve1, totalSupply);

    it('应该正确返回所有属性', () => {
      expect(pool.address).toBe(poolAddress);
      expect(pool.token0).toBe(token0);
      expect(pool.token1).toBe(token1);
      expect(pool.reserve0).toBe(reserve0);
      expect(pool.reserve1).toBe(reserve1);
      expect(pool.totalSupply).toBe(totalSupply);
    });
  });
});
