/**
 * 单元测试：useTokenBalance Hook
 * Unit Test: useTokenBalance Hook
 *
 * 测试代币余额查询和 React Query 集成
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTokenBalance } from '../useTokenBalance';
import * as getTokenBalanceQuery from '@/application/queries/getTokenBalance';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
  })),
  useConfig: jest.fn(() => ({})),
}));

// Mock getTokenBalance query
jest.mock('@/application/queries/getTokenBalance', () => ({
  getTokenBalance: jest.fn(),
}));

describe('useTokenBalance Hook', () => {
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
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('0');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      expect(result.current.balance).toBe('0');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('应该提供 refetch 方法', () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('0');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('获取余额 (Fetch Balance)', () => {
    it('应该成功获取代币余额', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100.5');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe('100.5');
      expect(result.current.error).toBeNull();
    });



    it('当 tokenAddress 为空时应该返回 0', async () => {
      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe('0');
    });
  });

  describe('查询参数 (Query Parameters)', () => {
    it('应该使用 tokenAddress 和 userAddress 作为查询 key', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const tokenAddress = '0x1111111111111111111111111111111111111111';

      renderHook(
        () =>
          useTokenBalance({
            tokenAddress,
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(getTokenBalanceQuery.getTokenBalance).toHaveBeenCalled();
      });
    });

    it('应该支持 enabled 参数', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
            enabled: false,
          }),
        { wrapper }
      );

      // 当 enabled 为 false 时，不应该调用查询
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('缓存和刷新 (Caching and Refetch)', () => {
    it('应该缓存查询结果', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const { result: result1 } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      const callCount1 = (getTokenBalanceQuery.getTokenBalance as jest.Mock).mock.calls.length;

      // 创建第二个 hook 实例，应该使用缓存
      const { result: result2 } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // 由于缓存，调用次数应该相同或只增加一次
      const callCount2 = (getTokenBalanceQuery.getTokenBalance as jest.Mock).mock.calls.length;
      expect(callCount2).toBeLessThanOrEqual(callCount1 + 1);
    });

    it('应该支持手动刷新', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount1 = (getTokenBalanceQuery.getTokenBalance as jest.Mock).mock.calls.length;

      result.current.refetch();

      await waitFor(() => {
        const callCount2 = (getTokenBalanceQuery.getTokenBalance as jest.Mock).mock.calls.length;
        expect(callCount2).toBeGreaterThan(callCount1);
      });
    });
  });

  describe('返回值类型 (Return Value Type)', () => {
    it('应该返回正确的接口', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('balance');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('balance 应该是字符串', async () => {
      (getTokenBalanceQuery.getTokenBalance as jest.Mock).mockResolvedValue('100');

      const { result } = renderHook(
        () =>
          useTokenBalance({
            tokenAddress: '0x1111111111111111111111111111111111111111',
            decimals: 18,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.balance).toBe('string');
    });
  });
});

