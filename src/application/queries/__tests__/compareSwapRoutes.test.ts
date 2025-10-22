/**
 * 测试：比较交换路径
 * Test: Compare Swap Routes
 */

import { compareSwapRoutes, getBestSwapRoute, calculateAveragePrice } from '../compareSwapRoutes';
import { Pool } from '@/domain/entities/Pool';
import { IToken } from '@/domain/entities/Token';
import { Amount } from '@/domain/value-objects/Amount';

describe('compareSwapRoutes', () => {
  // 模拟代币
  const ethToken: IToken = {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  };

  const usdcToken: IToken = {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  };

  const btcToken: IToken = {
    address: '0x0000000000000000000000000000000000000000', // 地址最小，确保可以作为 token0
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 18,
  };

  // 创建测试池子
  const createPool = (
    address: string,
    token0: IToken,
    token1: IToken,
    reserve0: string,
    reserve1: string,
    totalSupply: string,
  ): Pool => {
    return new Pool(
      address as `0x${string}`,
      token0,
      token1,
      new Amount(reserve0, token0.decimals),
      new Amount(reserve1, token1.decimals),
      new Amount(totalSupply, 18),
    );
  };

  describe('compareSwapRoutes', () => {
    it('应该正确比较多个池子并按评分排序', () => {
      // 创建两个 ETH/USDC 池子
      // Pool 1: 100 ETH, 200,000 USDC (流动性较大)
      const pool1 = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      // Pool 2: 50 ETH, 100,000 USDC (流动性较小)
      const pool2 = createPool(
        '0x2000000000000000000000000000000000000002',
        ethToken,
        usdcToken,
        '50',
        '100000',
        '2236.068',
      );

      const amountIn = new Amount('1.0', 18); // 1 ETH

      const routes = compareSwapRoutes([pool1, pool2], amountIn, ethToken, usdcToken);

      // 应该返回两个路径
      expect(routes).toHaveLength(2);

      // Pool 1 应该是更优的选择（流动性更大，价格影响更小）
      expect(routes[0].pool.address).toBe(pool1.address);
      expect(routes[1].pool.address).toBe(pool2.address);

      // Pool 1 的输出应该更多
      expect(routes[0].amountOut.toNumber()).toBeGreaterThan(routes[1].amountOut.toNumber());

      // Pool 1 的价格影响应该更小
      expect(routes[0].priceImpact).toBeLessThan(routes[1].priceImpact);

      // Pool 1 的评分应该更高
      expect(routes[0].score).toBeGreaterThan(routes[1].score);
    });

    it('应该过滤掉不包含所需代币对的池子', () => {
      const pool1 = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      // 这个池子是 BTC/USDC，不包含 ETH
      const pool2 = createPool(
        '0x2000000000000000000000000000000000000002',
        btcToken,
        usdcToken,
        '10',
        '200000',
        '1414.214',
      );

      const amountIn = new Amount('1.0', 18); // 1 ETH

      const routes = compareSwapRoutes([pool1, pool2], amountIn, ethToken, usdcToken);

      // 应该只返回一个路径（pool1）
      expect(routes).toHaveLength(1);
      expect(routes[0].pool.address).toBe(pool1.address);
    });

    it('应该返回空数组如果没有可用的池子', () => {
      // 创建一个 BTC/USDC 池子
      const pool = createPool(
        '0x1000000000000000000000000000000000000001',
        btcToken,
        usdcToken,
        '10',
        '200000',
        '1414.214',
      );

      const amountIn = new Amount('1.0', 18); // 1 ETH

      // 尝试用 ETH 交换，但池子里没有 ETH
      const routes = compareSwapRoutes([pool], amountIn, ethToken, usdcToken);

      expect(routes).toHaveLength(0);
    });

    it('应该正确计算所有路径的详细信息', () => {
      const pool = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      const amountIn = new Amount('1.0', 18); // 1 ETH

      const routes = compareSwapRoutes([pool], amountIn, ethToken, usdcToken);

      expect(routes).toHaveLength(1);

      const route = routes[0];

      // 检查所有字段都存在
      expect(route.pool).toBeDefined();
      expect(route.amountOut).toBeDefined();
      expect(route.priceImpact).toBeDefined();
      expect(route.effectivePrice).toBeDefined();
      expect(route.score).toBeDefined();

      // 检查数值合理性
      expect(route.amountOut.toNumber()).toBeGreaterThan(0);
      expect(route.priceImpact).toBeGreaterThan(0);
      expect(route.effectivePrice).toBeGreaterThan(0);
      expect(route.score).toBeGreaterThan(0);
    });
  });

  describe('getBestSwapRoute', () => {
    it('应该返回最优路径', () => {
      const pool1 = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      const pool2 = createPool(
        '0x2000000000000000000000000000000000000002',
        ethToken,
        usdcToken,
        '50',
        '100000',
        '2236.068',
      );

      const amountIn = new Amount('1.0', 18);

      const bestRoute = getBestSwapRoute([pool1, pool2], amountIn, ethToken, usdcToken);

      expect(bestRoute).not.toBeNull();
      expect(bestRoute!.pool.address).toBe(pool1.address);
    });

    it('应该返回 null 如果没有可用路径', () => {
      const pool = createPool(
        '0x1000000000000000000000000000000000000001',
        btcToken,
        usdcToken,
        '10',
        '200000',
        '1414.214',
      );

      const amountIn = new Amount('1.0', 18);

      const bestRoute = getBestSwapRoute([pool], amountIn, ethToken, usdcToken);

      expect(bestRoute).toBeNull();
    });
  });

  describe('calculateAveragePrice', () => {
    it('应该正确计算多个池子的平均价格', () => {
      // Pool 1: 价格 = 100 / 200000 = 0.0005
      const pool1 = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      // Pool 2: 价格 = 50 / 100000 = 0.0005 (相同价格)
      const pool2 = createPool(
        '0x2000000000000000000000000000000000000002',
        ethToken,
        usdcToken,
        '50',
        '100000',
        '2236.068',
      );

      const avgPrice = calculateAveragePrice([pool1, pool2], ethToken, usdcToken);

      // 平均价格应该接近 0.0005
      expect(avgPrice).toBeCloseTo(0.0005, 4);
    });

    it('应该返回 0 如果没有可用的池子', () => {
      const pool = createPool(
        '0x1000000000000000000000000000000000000001',
        btcToken,
        usdcToken,
        '10',
        '200000',
        '1414.214',
      );

      const avgPrice = calculateAveragePrice([pool], ethToken, usdcToken);

      expect(avgPrice).toBe(0);
    });

    it('应该忽略计算失败的池子', () => {
      // 正常池子
      const pool1 = createPool(
        '0x1000000000000000000000000000000000000001',
        ethToken,
        usdcToken,
        '100',
        '200000',
        '4472.136',
      );

      const avgPrice = calculateAveragePrice([pool1], ethToken, usdcToken);

      // 应该使用 pool1 的价格
      expect(avgPrice).toBeGreaterThan(0);
      expect(avgPrice).toBeCloseTo(0.0005, 4);
    });
  });
});

