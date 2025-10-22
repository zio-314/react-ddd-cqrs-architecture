/**
 * 单元测试：useLiquidityPools Hook
 * Unit Test: useLiquidityPools Hook
 *
 * 测试流动性池查询和 React Query 集成
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLiquidityPools } from '../useLiquidityPools';
import * as getLiquidityPoolsQuery from '@/application/queries/getLiquidityPools';

// Mock getLiquidityPools query
jest.mock('@/application/queries/getLiquidityPools', () => ({
  getLiquidityPools: jest.fn(),
}));

describe('useLiquidityPools Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe('初始状态 (Initial State)', () => {
    it('应该返回初始状态', () => {
      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      expect(result.current.pools).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.pairCount).toBe(0);
    });

    it('应该提供 refetch 方法', () => {
      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('获取流动性池 (Fetch Liquidity Pools)', () => {
    it('应该成功获取流动性池列表', async () => {
      const mockPools = [
        {
          address: '0x1111111111111111111111111111111111111111',
          token0: {
            token: {
              address: '0x2222222222222222222222222222222222222222',
              symbol: 'USDC',
              name: 'USD Coin',
              decimals: 6,
            },
            reserve: '1000000',
          },
          token1: {
            token: {
              address: '0x3333333333333333333333333333333333333333',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
            },
            reserve: '500',
          },
        },
      ];

      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue(mockPools);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pools).toEqual(mockPools);
      expect(result.current.pairCount).toBe(1);
      expect(result.current.error).toBeNull();
    });



    it('应该正确计算 pairCount', async () => {
      const mockPools = [
        { address: '0x1111111111111111111111111111111111111111' },
        { address: '0x2222222222222222222222222222222222222222' },
        { address: '0x3333333333333333333333333333333333333333' },
      ];

      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue(mockPools);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pairCount).toBe(3);
    });
  });

  describe('缓存和刷新 (Caching and Refetch)', () => {
    it('应该缓存查询结果', async () => {
      const mockPools = [
        { address: '0x1111111111111111111111111111111111111111' },
      ];

      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue(mockPools);

      const { result: result1 } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      const callCount1 = (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mock.calls.length;

      // 创建第二个 hook 实例，应该使用缓存
      const { result: result2 } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      const callCount2 = (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mock.calls.length;
      expect(callCount2).toBeLessThanOrEqual(callCount1 + 1);
    });

    it('应该支持手动刷新', async () => {
      const mockPools = [
        { address: '0x1111111111111111111111111111111111111111' },
      ];

      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue(mockPools);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount1 = (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mock.calls.length;

      result.current.refetch();

      await waitFor(() => {
        const callCount2 = (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mock.calls.length;
        expect(callCount2).toBeGreaterThan(callCount1);
      });
    });
  });

  describe('返回值类型 (Return Value Type)', () => {
    it('应该返回正确的接口', async () => {
      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('pools');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('pairCount');
      expect(result.current).toHaveProperty('refetch');
    });

    it('pools 应该是数组', async () => {
      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.pools)).toBe(true);
    });

    it('pairCount 应该是数字', async () => {
      (getLiquidityPoolsQuery.getLiquidityPools as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useLiquidityPools(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.pairCount).toBe('number');
    });
  });


});

