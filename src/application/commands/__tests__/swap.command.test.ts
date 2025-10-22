/**
 * 单元测试：Swap 命令
 * Unit Test: Swap Command
 *
 * 测试 Swap 命令的业务逻辑和流程编排
 */

import { getAmountOut, executeSwapCommand } from '../swap.command';
import { PublicClient } from 'viem';
import { Config } from 'wagmi';
import * as wagmiActions from 'wagmi/actions';

// Mock viem PublicClient
const mockPublicClient = {
  readContract: jest.fn(),
} as unknown as PublicClient;

// Mock wagmi Config
const mockConfig = {} as Config;

// Mock wagmi actions
jest.mock('wagmi/actions', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}));

// Mock CONTRACT_ADDRESSES
jest.mock('@/constants/addresses', () => ({
  CONTRACT_ADDRESSES: {
    UniswapV2Router: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  },
}));

// Mock ABI
jest.mock('@/lib/abi', () => ({
  uniswapV2RouterAbi: [],
  ierc20Abi: [],
}));

describe('Swap Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 抑制测试中的 console.error 输出
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAmountOut', () => {
    it('应该成功获取输出金额', async () => {
      const mockAmounts = [BigInt('1000000000000000000'), BigInt('2000000000')];

      (mockPublicClient.readContract as jest.Mock).mockResolvedValue(mockAmounts);

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
        amountIn: '1000',
      };

      const result = await getAmountOut(mockPublicClient, params);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('应该处理 readContract 失败', async () => {
      (mockPublicClient.readContract as jest.Mock).mockRejectedValue(
        new Error('RPC error')
      );

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
        amountIn: '1000',
      };

      await expect(getAmountOut(mockPublicClient, params)).rejects.toThrow('RPC error');
    });

    it('应该处理空的 publicClient', async () => {
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
        amountIn: '1000',
      };

      await expect(getAmountOut(null as unknown as PublicClient, params)).rejects.toThrow(
        'Public client not available',
      );
    });

    it('应该处理没有输出金额的情况', async () => {
      (mockPublicClient.readContract as jest.Mock).mockResolvedValue([]);

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
        amountIn: '1000',
      };

      await expect(getAmountOut(mockPublicClient, params)).rejects.toThrow(
        'No output amount calculated'
      );
    });
  });

  describe('executeSwapCommand', () => {
    it('应该成功执行 swap', async () => {
      const mockApproveTxHash = '0xapprove1234';
      const mockSwapTxHash = '0xswap5678';

      (mockPublicClient.readContract as jest.Mock).mockResolvedValue([
        BigInt('1000000'),
        BigInt('2000000000000000000'),
      ]);

      (wagmiActions.writeContract as jest.Mock)
        .mockResolvedValueOnce(mockApproveTxHash)
        .mockResolvedValueOnce(mockSwapTxHash);

      (wagmiActions.waitForTransactionReceipt as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const params = {
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
        amountIn: '1',
        slippage: '0.5',
      };

      const result = await executeSwapCommand(mockConfig, mockPublicClient, '0x1234567890123456789012345678901234567890', params);

      expect(result).toHaveProperty('txHash');
      expect(result).toHaveProperty('amountOut');
      expect(result.txHash).toBe(mockSwapTxHash);
    });

    it('应该在授权失败时抛出错误', async () => {
      (mockPublicClient.readContract as jest.Mock).mockResolvedValue([
        BigInt('1000000'),
        BigInt('2000000000000000000'),
      ]);

      (wagmiActions.writeContract as jest.Mock).mockRejectedValue(
        new Error('Approve failed')
      );

      const params = {
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
        amountIn: '1',
        slippage: '0.5',
      };

      await expect(
        executeSwapCommand(mockConfig, mockPublicClient, '0x1234567890123456789012345678901234567890', params)
      ).rejects.toThrow('Approve failed');
    });

    it('应该在获取输出金额失败时抛出错误', async () => {
      (mockPublicClient.readContract as jest.Mock).mockRejectedValue(
        new Error('Failed to get amount out')
      );

      const params = {
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
        amountIn: '1000',
        slippage: '0.5',
      };

      await expect(
        executeSwapCommand(mockConfig, mockPublicClient, '0x1234567890123456789012345678901234567890', params)
      ).rejects.toThrow('Failed to get amount out');
    });

    it('应该调用 writeContract 两次（授权和交换）', async () => {
      const mockApproveTxHash = '0xapprove1234';
      const mockSwapTxHash = '0xswap5678';

      (mockPublicClient.readContract as jest.Mock).mockResolvedValue([
        BigInt('1000000'),
        BigInt('2000000000000000000'),
      ]);

      (wagmiActions.writeContract as jest.Mock)
        .mockResolvedValueOnce(mockApproveTxHash)
        .mockResolvedValueOnce(mockSwapTxHash);

      (wagmiActions.waitForTransactionReceipt as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const params = {
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
        amountIn: '1',
        slippage: '0.5',
      };

      await executeSwapCommand(mockConfig, mockPublicClient, '0x1234567890123456789012345678901234567890', params);

      expect(wagmiActions.writeContract).toHaveBeenCalledTimes(2);
    });

    it('应该调用 waitForTransactionReceipt 两次', async () => {
      const mockApproveTxHash = '0xapprove1234';
      const mockSwapTxHash = '0xswap5678';

      (mockPublicClient.readContract as jest.Mock).mockResolvedValue([
        BigInt('1000000'),
        BigInt('2000000000000000000'),
      ]);

      (wagmiActions.writeContract as jest.Mock)
        .mockResolvedValueOnce(mockApproveTxHash)
        .mockResolvedValueOnce(mockSwapTxHash);

      (wagmiActions.waitForTransactionReceipt as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const params = {
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
        amountIn: '1',
        slippage: '0.5',
      };

      await executeSwapCommand(mockConfig, mockPublicClient, '0x1234567890123456789012345678901234567890', params);

      expect(wagmiActions.waitForTransactionReceipt).toHaveBeenCalledTimes(2);
    });
  });
});

