/**
 * 命令：执行 Swap
 * Command: Execute Swap
 *
 * 职责：
 * - 使用 Swap 聚合根封装业务逻辑
 * - 协调基础设施层操作（授权、交易）
 * - 等待交易确认
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 管理 UI 状态
 * - 直接操作 DOM
 * - 包含业务逻辑计算（应在 Swap 聚合根中）
 *
 * 优势：
 * - 业务逻辑在 Swap 聚合根中，符合 DDD 原则
 * - 命令层只负责流程编排
 * - 易于测试（纯函数）
 */

import { parseUnits, formatUnits, type PublicClient } from 'viem';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import type { Config } from 'wagmi';
import {
  CONTRACT_ADDRESSES,
  uniswapV2RouterAbi,
  ierc20Abi,
} from '@/infrastructure/blockchain';
import { Swap } from '@/domain/aggregates/Swap';
import { Amount } from '@/domain/value-objects/Amount';
import { Slippage } from '@/domain/value-objects/Slippage';
import type { SwapParams, SwapResult, GetAmountOutParams } from '@/types/swap';

/**
 * 获取输出金额
 *
 * @param publicClient - viem PublicClient
 * @param params - 获取输出金额参数
 * @returns 输出金额（格式化后的字符串）
 */
export async function getAmountOut(
  publicClient: PublicClient,
  params: GetAmountOutParams,
): Promise<string> {
  try {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const routerAddress = CONTRACT_ADDRESSES.UniswapV2Router as `0x${string}`;
    const tokenInAddress = params.tokenIn.address as `0x${string}`;
    const tokenOutAddress = params.tokenOut.address as `0x${string}`;

    const amountInWei = parseUnits(params.amountIn, params.tokenIn.decimals);

    // 调用 getAmountsOut 获取输出金额
    const result = await publicClient.readContract({
      address: routerAddress,
      abi: uniswapV2RouterAbi,
      functionName: 'getAmountsOut',
      args: [amountInWei, [tokenInAddress, tokenOutAddress]],
    });

    const amounts = result as bigint[];
    const lastAmount = amounts[amounts.length - 1];
    if (!lastAmount) {
      throw new Error('No output amount calculated');
    }
    return formatUnits(lastAmount, params.tokenOut.decimals);
  } catch (err) {
    console.error('Failed to get amount out:', err);
    throw err;
  }
}

/**
 * 执行 Swap 命令（使用 Swap 聚合根）
 *
 * 完整流程：
 * 1. 创建 Swap 聚合根（自动验证业务规则）
 * 2. 获取预期输出金额
 * 3. 使用聚合根计算最小输出（封装业务逻辑）
 * 4. 标记为执行中
 * 5. 授权 TokenIn
 * 6. 等待授权确认
 * 7. 执行 Swap
 * 8. 等待 Swap 确认
 * 9. 标记为成功
 *
 * @param config - wagmi Config
 * @param publicClient - viem PublicClient
 * @param userAddress - 用户地址
 * @param params - Swap 参数
 * @returns Swap 结果
 *
 * @example
 * const result = await executeSwapCommand(config, publicClient, userAddress, {
 *   tokenIn: { address: '0x...', symbol: 'USDC', decimals: 6 },
 *   tokenOut: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *   amountIn: '100',
 *   slippage: '0.5',
 * });
 */
export async function executeSwapCommand(
  config: Config,
  publicClient: PublicClient,
  userAddress: `0x${string}`,
  params: SwapParams,
): Promise<SwapResult> {
  try {
    const tokenInAddress = params.tokenIn.address as `0x${string}`;
    const tokenOutAddress = params.tokenOut.address as `0x${string}`;
    const routerAddress = CONTRACT_ADDRESSES.UniswapV2Router as `0x${string}`;

    // 1. 创建 Swap 聚合根（自动验证业务规则）
    const amountIn = new Amount(params.amountIn, params.tokenIn.decimals);
    const slippage = new Slippage(Number(params.slippage));
    const swap = new Swap(params.tokenIn, params.tokenOut, amountIn, slippage);

    // 2. 获取预期输出金额
    const amountOutStr = await getAmountOut(publicClient, {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
    });
    const expectedOutput = new Amount(amountOutStr, params.tokenOut.decimals);

    // 3. 使用聚合根计算最小输出（封装业务逻辑）
    const minimumOutput = swap.calculateMinimumOutput(expectedOutput);

    // 4. 标记为执行中
    swap.markAsExecuting();

    // 5. 授权 TokenIn
    const amountInWei = parseUnits(params.amountIn, params.tokenIn.decimals);
    const approveTxHash = await writeContract(config, {
      address: tokenInAddress,
      abi: ierc20Abi,
      functionName: 'approve',
      args: [routerAddress, amountInWei],
    });

    // 6. 等待授权确认
    await waitForTransactionReceipt(config, {
      hash: approveTxHash,
      timeout: 60_000,
    });

    // 7. 执行 Swap
    const swapTxHash = await writeContract(config, {
      address: routerAddress,
      abi: uniswapV2RouterAbi,
      functionName: 'swapExactTokensForTokens',
      args: [
        amountInWei,
        minimumOutput.toBigInt(), // 使用聚合根计算的最小输出
        [tokenInAddress, tokenOutAddress],
        userAddress,
      ],
    });

    // 8. 等待 Swap 确认
    await waitForTransactionReceipt(config, {
      hash: swapTxHash,
      timeout: 120_000,
    });

    // 9. 标记为成功
    swap.markAsSuccess(swapTxHash, expectedOutput);

    return {
      txHash: swapTxHash,
      amountOut: amountOutStr,
    };
  } catch (err) {
    console.error('Failed to execute swap:', err);
    throw err;
  }
}
