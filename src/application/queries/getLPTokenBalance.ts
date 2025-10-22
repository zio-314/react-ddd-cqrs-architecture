/**
 * 查询层：获取 LP Token 余额
 * Query: Get LP Token Balance
 *
 * 职责：
 * - 查询用户在指定交易对的 LP Token 余额
 * - 查询交易对的储备量和总供应量
 * - 计算用户可以获得的代币数量
 *
 * 特点：
 * - 纯函数，无副作用
 * - 不依赖 React Hooks
 * - 可在任何环境运行
 * - 易于测试
 */

import { readContract, readContracts } from 'wagmi/actions';
import type { Config } from 'wagmi';
import { formatUnits } from 'viem';
import {
  uniswapV2FactoryAbi,
  uniswapV2PairAbi,
  CONTRACT_ADDRESSES,
} from '@/infrastructure/blockchain';
import type { LPTokenInfo } from '@/types';
import type { IToken } from '@/domain/entities/Token';

/**
 * 获取 LP Token 余额参数
 */
export interface GetLPTokenBalanceParams {
  tokenA: IToken;
  tokenB: IToken;
  userAddress: string;
}

/**
 * 获取 LP Token 余额
 *
 * @param config - wagmi Config
 * @param params - 查询参数
 * @returns LP Token 信息
 *
 * @example
 * const lpTokenInfo = await getLPTokenBalance(config, {
 *   tokenA: { address: '0x...', symbol: 'BTC', decimals: 18 },
 *   tokenB: { address: '0x...', symbol: 'ETH', decimals: 18 },
 *   userAddress: '0x...',
 * });
 */
export async function getLPTokenBalance(
  config: Config,
  params: GetLPTokenBalanceParams,
): Promise<LPTokenInfo | null> {
  try {
    const { tokenA, tokenB, userAddress } = params;
    const factoryAddress = CONTRACT_ADDRESSES.UniswapV2Factory as `0x${string}`;

    // 1. 获取交易对地址
    const pairAddress = await readContract(config, {
      address: factoryAddress,
      abi: uniswapV2FactoryAbi,
      functionName: 'getPair',
      args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`],
    });

    // 如果交易对不存在，返回 null
    if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    // 2. 批量查询 LP Token 信息
    const results = await readContracts(config, {
      contracts: [
        // 用户的 LP Token 余额
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`],
        },
        // LP Token 总供应量
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'totalSupply',
        },
        // 储备量
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'getReserves',
        },
        // token0 地址
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'token0',
        },
        // token1 地址
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'token1',
        },
      ],
    });

    // 3. 解析结果
    const balance = results[0].result as bigint;
    const totalSupply = results[1].result as bigint;
    const reserves = results[2].result as [bigint, bigint, number];
    const token0Address = results[3].result as string;
    const token1Address = results[4].result as string;

    // 4. 确定 token0 和 token1 的顺序
    const isTokenAFirst = tokenA.address.toLowerCase() === token0Address.toLowerCase();
    const reserve0 = reserves[0];
    const reserve1 = reserves[1];

    // 5. 格式化数据
    return {
      pairAddress,
      token0: tokenA,
      token1: tokenB,
      balance: formatUnits(balance, 18), // LP Token 固定 18 位小数
      totalSupply: formatUnits(totalSupply, 18),
      reserve0: isTokenAFirst
        ? formatUnits(reserve0, tokenA.decimals)
        : formatUnits(reserve0, tokenB.decimals),
      reserve1: isTokenAFirst
        ? formatUnits(reserve1, tokenB.decimals)
        : formatUnits(reserve1, tokenA.decimals),
    };
  } catch (error) {
    console.error('Failed to get LP token balance:', error);
    throw error;
  }
}

/**
 * 计算移除流动性可获得的代币数量
 *
 * @param lpTokenInfo - LP Token 信息
 * @param liquidityAmount - 要移除的 LP Token 数量
 * @returns 可获得的 Token0 和 Token1 数量
 *
 * @example
 * const amounts = calculateRemoveLiquidityAmounts(lpTokenInfo, '1.0');
 * console.log(amounts); // { amount0: '0.5', amount1: '5.0' }
 */
export function calculateRemoveLiquidityAmounts(
  lpTokenInfo: LPTokenInfo,
  liquidityAmount: string,
): { amount0: string; amount1: string } {
  const liquidity = parseFloat(liquidityAmount);
  const totalSupply = parseFloat(lpTokenInfo.totalSupply);
  const reserve0 = parseFloat(lpTokenInfo.reserve0);
  const reserve1 = parseFloat(lpTokenInfo.reserve1);

  // 计算份额
  const share = liquidity / totalSupply;

  // 计算可获得的代币数量
  const amount0 = (reserve0 * share).toFixed(lpTokenInfo.token0.decimals);
  const amount1 = (reserve1 * share).toFixed(lpTokenInfo.token1.decimals);

  return { amount0, amount1 };
}
