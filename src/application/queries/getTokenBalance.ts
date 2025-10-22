/**
 * 查询：获取代币余额
 * Query: Get Token Balance
 *
 * 职责：
 * - 查询代币余额
 * - 格式化余额
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 执行写操作
 * - 管理 UI 状态
 */

import { readContract } from 'wagmi/actions';
import type { Config } from 'wagmi';
import { formatUnits } from 'viem';
import { ierc20Abi } from '@/infrastructure/blockchain';

/**
 * 获取代币余额参数
 */
export interface GetTokenBalanceParams {
  config: Config;
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  decimals: number;
}

/**
 * 获取代币余额
 *
 * @param params - 获取余额参数
 * @returns 格式化后的余额（字符串）
 *
 * @example
 * const balance = await getTokenBalance({
 *   config,
 *   tokenAddress: '0x...',
 *   userAddress: '0x...',
 *   decimals: 18,
 * });
 */
export async function getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
  try {
    const { config, tokenAddress, userAddress, decimals } = params;

    // 使用 readContract 纯函数
    const balanceWei = await readContract(config, {
      address: tokenAddress,
      abi: ierc20Abi,
      functionName: 'balanceOf',
      args: [userAddress],
    });

    // 格式化余额
    const balanceFormatted = formatUnits(balanceWei, decimals);

    return balanceFormatted;
  } catch (err) {
    console.error('Failed to get token balance:', err);
    throw err;
  }
}
