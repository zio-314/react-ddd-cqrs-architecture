'use client';

/**
 * 应用层 Hook：Faucet（水龙头）
 * Application Hook: Faucet
 *
 * 职责：
 * - 使用 React Query 管理铸币操作状态
 * - 调用命令层执行铸币
 * - 返回状态给 UI
 *
 * 不应该：
 * - 包含业务逻辑（应在 commands 层）
 * - 直接处理数据转换（应在 commands 层）
 * - 直接调用区块链（应在 commands 层）
 * - 手动管理 loading、error 状态（应使用 React Query）
 *
 * 优势：
 * - 使用 React Query 的 useMutation 管理写操作状态
 * - 自动处理 loading、error、success 状态
 * - 支持乐观更新、重试等高级功能
 * - Hook 只负责状态管理，业务逻辑在 commands 层
 * - 命令逻辑可以在非 React 环境中复用
 */

import { useMutation } from '@tanstack/react-query';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { executeMintTokenCommand } from '@/application/commands/faucet.command';
import { Faucet, type IFaucetToken, type FaucetResult } from '@/domain/entities/Faucet';
import { FAUCET_TOKENS, FaucetTokenSymbol } from '@/application/validators/faucet';

// 重新导出领域实体，方便使用
export type { IFaucetToken, FaucetResult } from '@/domain/entities/Faucet';
export { Faucet } from '@/domain/entities/Faucet';

/**
 * Hook：Faucet（水龙头）
 *
 * 使用 React Query 的 useMutation 管理铸币操作状态
 *
 * @returns 铸币操作的状态和方法
 *
 * @example
 * const { mint, isLoading, isSuccess, error, data } = useFaucet();
 *
 * const handleMint = () => {
 *   mint({
 *     token: FAUCET_TOKENS.USDC,
 *     amount: '1000',
 *   });
 * };
 */
export function useFaucet() {
  const config = useConfig();
  const { address: userAddress, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // 检查是否在正确的网络上
  const isCorrectChain = chainId === arbitrumSepolia.id;

  // 使用 React Query 的 useMutation 管理铸币操作
  const mintMutation = useMutation({
    mutationFn: async ({
      token,
      amount,
    }: {
      token: IFaucetToken;
      amount: string;
    }): Promise<FaucetResult> => {
      if (!isConnected || !userAddress) {
        throw new Error('Please connect your wallet first');
      }

      if (!isCorrectChain) {
        throw new Error('Please switch to Arbitrum Sepolia network');
      }

      // 创建 Faucet 实体（充血模型）
      const faucet = new Faucet(token, userAddress);

      // 调用命令层的纯函数（使用充血模型）
      return await executeMintTokenCommand(config, faucet, amount);
    },
    onSuccess: data => {
      console.log('Token minted successfully:', data.txHash);
    },
    onError: error => {
      console.error('Failed to mint token:', error);
    },
  });

  // 切换到 Arbitrum Sepolia 网络
  const switchToArbitrumSepolia = async () => {
    try {
      await switchChain({ chainId: arbitrumSepolia.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  return {
    // 铸币操作
    mint: mintMutation.mutate,
    mintAsync: mintMutation.mutateAsync,

    // 状态
    isLoading: mintMutation.isPending,
    isSuccess: mintMutation.isSuccess,
    isError: mintMutation.isError,
    error: mintMutation.error?.message ?? null,
    data: mintMutation.data,

    // 网络相关
    isConnected,
    isCorrectChain,
    switchToArbitrumSepolia,
    userAddress,

    // 重置状态
    reset: mintMutation.reset,

    // 兼容旧的 API（用于平滑迁移）
    result:
      mintMutation.isSuccess && mintMutation.data
        ? { status: 'success' as const, txHash: mintMutation.data.txHash }
        : mintMutation.isError
          ? { status: 'error' as const, error: mintMutation.error?.message ?? 'Unknown error' }
          : mintMutation.isPending
            ? { status: 'pending' as const }
            : { status: 'idle' as const },
    txHash: mintMutation.data?.txHash,
  };
}
