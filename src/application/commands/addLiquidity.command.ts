/**
 * 命令：添加流动性
 * Command: Add Liquidity
 *
 * 职责：
 * - 执行添加流动性的业务逻辑
 * - 授权代币
 * - 调用 Router 合约添加流动性
 * - 等待交易确认
 * - 使用 Liquidity 充血聚合根管理业务逻辑
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 管理 UI 状态
 * - 直接操作 DOM
 * - 包含业务规则（业务规则在 Liquidity 聚合根中）
 *
 * 优势：
 * - 业务逻辑与 React 解耦
 * - 可以在非 React 环境中使用
 * - 易于测试（纯函数）
 * - 业务规则集中在领域层
 */

import { parseUnits } from 'viem';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import type { Config } from 'wagmi';
import {
  CONTRACT_ADDRESSES,
  uniswapV2RouterAbi,
  ierc20Abi,
} from '@/infrastructure/blockchain';
import { Liquidity } from '@/domain/aggregates/Liquidity';
import { Amount } from '@/domain/value-objects/Amount';
import type { AddLiquidityResult } from '@/types/liquidity';

/**
 * 执行添加流动性命令（使用 Liquidity 聚合根）
 *
 * 完整流程：
 * 1. Liquidity 聚合根验证业务规则
 * 2. 标记为执行中
 * 3. 授权 TokenA
 * 4. 等待 TokenA 授权确认
 * 5. 授权 TokenB
 * 6. 等待 TokenB 授权确认
 * 7. 调用 addLiquidity
 * 8. 等待 addLiquidity 确认
 * 9. 标记为成功
 *
 * @param config - wagmi Config
 * @param userAddress - 用户地址
 * @param liquidity - Liquidity 聚合根实例
 * @returns 添加流动性结果
 *
 * @example
 * const liquidity = new Liquidity(
 *   LiquidityOperationType.ADD,
 *   tokenA,
 *   tokenB,
 *   new Amount('1.0', tokenA.decimals),
 *   new Amount('10.0', tokenB.decimals),
 *   new Slippage(0.5)
 * );
 * const result = await executeAddLiquidityCommand(config, userAddress, liquidity);
 */
export async function executeAddLiquidityCommand(
  config: Config,
  userAddress: `0x${string}`,
  liquidity: Liquidity,
): Promise<AddLiquidityResult> {
  try {
    // 1. 标记为执行中（业务规则验证在 Liquidity 构造函数中）
    liquidity.markAsExecuting();

    const token0 = liquidity.token0;
    const token1 = liquidity.token1;
    const amount0 = liquidity.amount0;
    const amount1 = liquidity.amount1;

    const token0Address = token0.address as `0x${string}`;
    const token1Address = token1.address as `0x${string}`;
    const routerAddress = CONTRACT_ADDRESSES.UniswapV2Router as `0x${string}`;

    // 2. 计算最小金额（使用 Liquidity 聚合根的业务逻辑）
    const { min0, min1 } = liquidity.calculateMinAmounts();

    // 3. 解析金额（转换为 wei）
    const amount0Desired = parseUnits(amount0.toString(), token0.decimals);
    const amount1Desired = parseUnits(amount1.toString(), token1.decimals);
    const amount0Min = parseUnits(min0.toString(), token0.decimals);
    const amount1Min = parseUnits(min1.toString(), token1.decimals);

    // 调试日志
    console.log('=== Add Liquidity Command ===');
    console.log('Liquidity ID:', liquidity.id);
    console.log('Token 0:', token0.symbol, 'Decimals:', token0.decimals);
    console.log('Token 1:', token1.symbol, 'Decimals:', token1.decimals);
    console.log('Amounts:', {
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      min0: min0.toString(),
      min1: min1.toString(),
    });
    console.log('Parsed amounts (wei):', {
      amount0Desired: amount0Desired.toString(),
      amount1Desired: amount1Desired.toString(),
      amount0Min: amount0Min.toString(),
      amount1Min: amount1Min.toString(),
    });
    console.log('Router address:', routerAddress);
    console.log('User address:', userAddress);

    // 4. 授权 Token0
    const token0Hash = await writeContract(config, {
      address: token0Address,
      abi: ierc20Abi,
      functionName: 'approve',
      args: [routerAddress, amount0Desired],
    });

    // 5. 等待 Token0 授权确认
    await waitForTransactionReceipt(config, {
      hash: token0Hash,
      timeout: 60_000,
    });

    console.log('Token0 approved:', token0Hash);

    // 6. 授权 Token1
    const token1Hash = await writeContract(config, {
      address: token1Address,
      abi: ierc20Abi,
      functionName: 'approve',
      args: [routerAddress, amount1Desired],
    });

    // 7. 等待 Token1 授权确认
    await waitForTransactionReceipt(config, {
      hash: token1Hash,
      timeout: 60_000,
    });

    console.log('Token1 approved:', token1Hash);

    // 8. 调用 addLiquidity
    const addLiquidityHash = await writeContract(config, {
      address: routerAddress,
      abi: uniswapV2RouterAbi,
      functionName: 'addLiquidity',
      args: [
        token0Address,
        token1Address,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        userAddress,
      ],
    });

    // 9. 等待 addLiquidity 确认
    await waitForTransactionReceipt(config, {
      hash: addLiquidityHash,
      timeout: 120_000,
    });

    console.log('Liquidity added:', addLiquidityHash);

    // 10. 标记为成功（假设 LP tokens 为 0，实际应该从事件中获取）
    const lpTokens = new Amount('0', 18); // TODO: 从交易回执中获取实际的 LP tokens
    liquidity.markAsSuccess(addLiquidityHash, lpTokens);

    return {
      success: true,
      txHash: addLiquidityHash,
      lpTokens: '0', // TODO: 从交易回执中获取实际的 LP tokens
      amount0: amount0.toString(),
      amount1: amount1.toString(),
    };
  } catch (err) {
    console.error('Failed to add liquidity:', err);

    // 标记为失败
    try {
      liquidity.markAsFailed();
    } catch (e) {
      // Ignore state transition errors
    }

    throw err;
  }
}

/**
 * 授权代币
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币地址
 * @param spenderAddress - 授权地址（通常是 Router）
 * @param amount - 授权金额
 * @returns 交易哈希
 */
export async function approveToken(
  config: Config,
  tokenAddress: `0x${string}`,
  spenderAddress: `0x${string}`,
  amount: bigint,
): Promise<`0x${string}`> {
  try {
    const txHash = await writeContract(config, {
      address: tokenAddress,
      abi: ierc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amount],
    });

    await waitForTransactionReceipt(config, {
      hash: txHash,
      timeout: 60_000,
    });

    return txHash;
  } catch (err) {
    console.error('Failed to approve token:', err);
    throw err;
  }
}
