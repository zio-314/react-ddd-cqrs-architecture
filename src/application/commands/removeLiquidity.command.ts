/**
 * 命令：移除流动性
 * Command: Remove Liquidity
 *
 * 职责：
 * - 执行移除流动性的业务逻辑
 * - 授权 LP Token
 * - 调用 Router 合约移除流动性
 * - 等待交易确认
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 管理 UI 状态
 * - 直接操作 DOM
 *
 * 优势：
 * - 业务逻辑与 React 解耦
 * - 可以在非 React 环境中使用
 * - 易于测试（纯函数）
 */

import { parseUnits } from 'viem';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import type { Config } from 'wagmi';
import {
  CONTRACT_ADDRESSES,
  uniswapV2RouterAbi,
  uniswapV2PairAbi,
} from '@/infrastructure/blockchain';
import { RemoveLiquidityParams, RemoveLiquidityQuote, RemoveLiquidityResult } from '@/types';

/**
 * 执行移除流动性命令
 *
 * 完整流程：
 * 1. 解析金额
 * 2. 授权 LP Token
 * 3. 等待 LP Token 授权确认
 * 4. 调用 removeLiquidity
 * 5. 等待 removeLiquidity 确认
 *
 * @param config - wagmi Config
 * @param userAddress - 用户地址
 * @param pairAddress - 交易对地址
 * @param params - 移除流动性参数
 * @param quote - 移除流动性报价
 * @returns 移除流动性结果
 *
 * @example
 * const result = await executeRemoveLiquidityCommand(
 *   config,
 *   userAddress,
 *   pairAddress,
 *   {
 *     tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *     tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *     liquidity: '1.0',
 *     slippage: '0.5',
 *   },
 *   quote
 * );
 */
export async function executeRemoveLiquidityCommand(
  config: Config,
  userAddress: `0x${string}`,
  pairAddress: `0x${string}`,
  params: RemoveLiquidityParams,
  quote: RemoveLiquidityQuote,
): Promise<RemoveLiquidityResult> {
  try {
    const token0Address = params.token0.address as `0x${string}`;
    const token1Address = params.token1.address as `0x${string}`;
    const routerAddress = CONTRACT_ADDRESSES.UniswapV2Router as `0x${string}`;

    // 1. 解析金额（转换为 wei）
    const liquidity = parseUnits(params.liquidity, 18); // LP Token 固定 18 位小数
    const amount0Min = parseUnits(quote.amount0Min, params.token0.decimals);
    const amount1Min = parseUnits(quote.amount1Min, params.token1.decimals);

    console.log('Remove liquidity params:', {
      token0: token0Address,
      token1: token1Address,
      liquidity: liquidity.toString(),
      amount0Min: amount0Min.toString(),
      amount1Min: amount1Min.toString(),
    });

    // 2. 授权 LP Token 给 Router
    console.log('Approving LP Token...');
    const approveLPHash = await writeContract(config, {
      address: pairAddress,
      abi: uniswapV2PairAbi,
      functionName: 'approve',
      args: [routerAddress, liquidity],
    });

    // 3. 等待 LP Token 授权确认
    await waitForTransactionReceipt(config, {
      hash: approveLPHash,
      timeout: 120_000, // 2 分钟超时
    });

    console.log('LP Token approved:', approveLPHash);

    // 4. 调用 removeLiquidity（使用 writeContract 纯函数）
    console.log('Removing liquidity...');
    const removeLiquidityHash = await writeContract(config, {
      address: routerAddress,
      abi: uniswapV2RouterAbi,
      functionName: 'removeLiquidity',
      args: [token0Address, token1Address, liquidity, amount0Min, amount1Min, userAddress],
    });

    // 5. 等待 removeLiquidity 确认
    await waitForTransactionReceipt(config, {
      hash: removeLiquidityHash,
      timeout: 120_000,
    });

    console.log('Liquidity removed:', removeLiquidityHash);

    return {
      success: true,
      txHash: removeLiquidityHash,
      amount0: quote.amount0,
      amount1: quote.amount1,
    };
  } catch (err) {
    console.error('Failed to remove liquidity:', err);
    throw err;
  }
}
