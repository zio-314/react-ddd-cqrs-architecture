/**
 * 单元测试：useSwap Hook
 * Unit Test: useSwap Hook
 *
 * 测试 React Query 状态管理和命令层集成
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSwap } from '../useSwap';
import * as swapCommand from '@/application/commands/swap.command';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
  })),
  useConfig: jest.fn(() => ({})),
  usePublicClient: jest.fn(() => ({
    readContract: jest.fn(),
  })),
}));

// Mock swap command
jest.mock('@/application/commands/swap.command', () => ({
  executeSwapCommand: jest.fn(),
  getAmountOut: jest.fn(),
}));

describe('useSwap Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    // 抑制测试中的 console 输出
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe('初始状态 (Initial State)', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useSwap(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });

    it('应该提供 executeSwap 和 executeSwapAsync 方法', () => {
      const { result } = renderHook(() => useSwap(), { wrapper });

      expect(typeof result.current.executeSwap).toBe('function');
      expect(typeof result.current.executeSwapAsync).toBe('function');
    });

    it('应该提供 getAmountOut 方法', () => {
      const { result } = renderHook(() => useSwap(), { wrapper });

      expect(typeof result.current.getAmountOut).toBe('function');
    });

    it('应该提供 reset 方法', () => {
      const { result } = renderHook(() => useSwap(), { wrapper });

      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('Swap 执行 (Swap Execution)', () => {
    it('应该成功执行 swap', async () => {
      const mockResult = {
        txHash: '0xabcd1234',
        amountOut: '100',
      };

      (swapCommand.executeSwapCommand as jest.Mock).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useSwap(), { wrapper });

      const swapParams = {
        tokenIn: {
          address: '0x1111111111111111111111111111111111111111',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
        },
        tokenOut: {
          address: '0x2222222222222222222222222222222222222222',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
        },
        amountIn: '100',
        slippage: '0.5',
      };

      result.current.executeSwapAsync(swapParams);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });




  });

  describe('获取输出金额 (Get Amount Out)', () => {
    it('应该成功获取输出金额', async () => {
      (swapCommand.getAmountOut as jest.Mock).mockResolvedValue('100.5');

      const { result } = renderHook(() => useSwap(), { wrapper });

      const params = {
        tokenIn: {
          address: '0x1111111111111111111111111111111111111111',
          symbol: 'USDC',
          decimals: 6,
        },
        tokenOut: {
          address: '0x2222222222222222222222222222222222222222',
          symbol: 'ETH',
          decimals: 18,
        },
        amountIn: '100',
      };

      const amountOut = await result.current.getAmountOut(params);

      expect(amountOut).toBe('100.5');
    });

    it('应该处理获取输出金额失败', async () => {
      (swapCommand.getAmountOut as jest.Mock).mockRejectedValue(new Error('Failed to get amount'));

      const { result } = renderHook(() => useSwap(), { wrapper });

      const params = {
        tokenIn: {
          address: '0x1111111111111111111111111111111111111111',
          symbol: 'USDC',
          decimals: 6,
        },
        tokenOut: {
          address: '0x2222222222222222222222222222222222222222',
          symbol: 'ETH',
          decimals: 18,
        },
        amountIn: '100',
      };

      await expect(result.current.getAmountOut(params)).rejects.toThrow('Failed to get amount');
    });
  });

});

