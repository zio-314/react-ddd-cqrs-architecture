/**
 * 命令：Faucet（水龙头）
 * Command: Faucet
 *
 * 职责：
 * - 执行铸币操作
 * - 等待交易确认
 * - 使用 Faucet 充血模型管理业务逻辑
 *
 * 不应该：
 * - 依赖 React Hooks
 * - 管理 UI 状态
 * - 直接操作 DOM
 * - 包含业务规则（业务规则在 Faucet 实体中）
 *
 * 优势：
 * - 业务逻辑与 React 解耦
 * - 可以在非 React 环境中使用
 * - 易于测试（纯函数）
 * - 业务规则集中在领域层
 */

import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import type { Config } from 'wagmi';
import { parseUnits } from 'viem';
import { Faucet, type FaucetResult } from '@/domain/entities/Faucet';

// ERC20 ABI - mint 函数
const ERC20_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

/**
 * 执行铸币命令（使用 Faucet 充血模型）
 *
 * 完整流程：
 * 1. 使用 Faucet 实体验证业务规则
 * 2. 解析金额
 * 3. 调用 mint 函数
 * 4. 等待交易确认
 * 5. 更新 Faucet 状态
 *
 * @param config - wagmi Config
 * @param faucet - Faucet 实体（充血模型）
 * @param amount - 铸币金额
 * @returns 铸币结果
 *
 * @example
 * const faucet = new Faucet(token, userAddress);
 * const result = await executeMintTokenCommand(config, faucet, '1000');
 */
export async function executeMintTokenCommand(
  config: Config,
  faucet: Faucet,
  amount: string,
): Promise<FaucetResult> {
  try {
    const token = faucet.getToken();
    const userAddress = faucet.getUserAddress();

    // 调试日志
    console.log('=== Mint Token Command ===');
    console.log('Token:', token.symbol, 'Decimals:', token.decimals);
    console.log('Amount:', amount);
    console.log('User address:', userAddress);

    // 1. 业务规则验证（在 Faucet 实体中）
    faucet.prepareToMint(amount);

    // 2. 解析金额（转换为 wei）
    const amountWei = parseUnits(amount, token.decimals);

    console.log('Amount (wei):', amountWei.toString());

    // 3. 调用 mint 函数（使用 writeContract 纯函数）
    const txHash = await writeContract(config, {
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [userAddress, amountWei],
    });

    console.log('Mint transaction hash:', txHash);

    // 4. 等待交易确认
    await waitForTransactionReceipt(config, {
      hash: txHash,
      timeout: 60_000,
    });

    console.log('Mint transaction confirmed');

    // 5. 更新 Faucet 状态
    faucet.markMintSuccess(txHash);

    return {
      success: true,
      txHash,
      token,
      amount,
    };
  } catch (err) {
    console.error('Failed to mint token:', err);

    // 标记失败
    try {
      faucet.markMintFailed();
    } catch (e) {
      // 忽略状态转换错误
    }

    throw err;
  }
}
