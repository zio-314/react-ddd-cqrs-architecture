/**
 * 查询：获取流动性池列表
 * Query: Get Liquidity Pools
 *
 * 职责：
 * - 从区块链查询流动性池数据（使用 readContract/readContracts）
 * - 处理和转换原始数据
 * - 返回充血的 Pool 实体列表（而非贫血的数据接口）
 *
 * 优势：
 * - 不依赖 React Hooks，业务逻辑与框架解耦
 * - 可以在非 React 环境中使用
 * - 更易于测试（纯函数）
 * - 直接返回充血的 Pool 实体，封装业务逻辑
 */

import { formatUnits, Address } from 'viem';
import { readContract, readContracts } from 'wagmi/actions';
import {
  getConfig,
  uniswapV2FactoryAbi,
  uniswapV2PairAbi,
  CONTRACT_ADDRESSES,
} from '@/infrastructure/blockchain';
import { Pool } from '@/domain/entities/Pool';
import { Amount } from '@/domain/value-objects/Amount';
import type { IToken } from '@/domain/entities/Token';
import { getTokens } from './getTokens';

/**
 * 代币信息映射表（缓存）
 */
let TOKEN_INFO_CACHE: Record<string, { symbol: string; name: string; decimals: number }> | null =
  null;

/**
 * 构建代币信息映射表
 */
async function buildTokenInfoMap(): Promise<
  Record<string, { symbol: string; name: string; decimals: number }>
> {
  if (TOKEN_INFO_CACHE) {
    return TOKEN_INFO_CACHE;
  }

  try {
    const tokens = await getTokens();
    const map: Record<string, { symbol: string; name: string; decimals: number }> = {};

    tokens.forEach(token => {
      map[token.address.toLowerCase()] = {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
      };
    });

    TOKEN_INFO_CACHE = map;
    return map;
  } catch (error) {
    console.error('Error building token info map:', error);
    // 返回默认的 fallback 映射
    return {
      [CONTRACT_ADDRESSES.BTC.toLowerCase()]: { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
      [CONTRACT_ADDRESSES.ETH.toLowerCase()]: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      [CONTRACT_ADDRESSES.USDC.toLowerCase()]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      [CONTRACT_ADDRESSES.USDT.toLowerCase()]: { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    };
  }
}

/**
 * 获取代币信息
 */
async function getTokenInfo(
  address: string,
): Promise<{ symbol: string; name: string; decimals: number }> {
  const tokenMap = await buildTokenInfoMap();
  const lowerAddress = address.toLowerCase();
  return (
    tokenMap[lowerAddress] || {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
    }
  );
}

/**
 * 合约调用结果类型
 */
interface ContractResult {
  status: 'success' | 'failure';
  result?: unknown;
}

/**
 * 处理交易对详情数据，转换为 Pool 实体列表
 *
 * 直接创建充血的 Pool 实体，而非贫血的数据接口
 */
export async function processLiquidityPools(
  pairAddresses: `0x${string}`[],
  pairDetails: ContractResult[],
): Promise<Pool[]> {
  if (!pairDetails || pairDetails.length === 0) {
    return [];
  }

  const processedPools: Pool[] = [];

  for (let i = 0; i < pairAddresses.length; i++) {
    const baseIndex = i * 4;
    const token0Result = pairDetails[baseIndex];
    const token1Result = pairDetails[baseIndex + 1];
    const reservesResult = pairDetails[baseIndex + 2];
    const totalSupplyResult = pairDetails[baseIndex + 3];

    // 验证所有数据都成功获取
    if (
      token0Result?.status === 'success' &&
      token1Result?.status === 'success' &&
      reservesResult?.status === 'success' &&
      totalSupplyResult?.status === 'success'
    ) {
      const token0Address = (token0Result.result as string).toLowerCase();
      const token1Address = (token1Result.result as string).toLowerCase();
      const reserves = reservesResult.result as [bigint, bigint, number];
      const totalSupply = totalSupplyResult.result as bigint;

      // 获取代币信息
      const token0Info = await getTokenInfo(token0Address);
      const token1Info = await getTokenInfo(token1Address);

      // 格式化储备量
      const reserve0Amount = formatUnits(reserves[0], token0Info.decimals);
      const reserve1Amount = formatUnits(reserves[1], token1Info.decimals);
      const totalSupplyAmount = formatUnits(totalSupply, 18);

      // 构建 IToken 对象
      const token0: IToken = {
        address: token0Address as Address,
        symbol: token0Info.symbol,
        name: token0Info.name,
        decimals: token0Info.decimals,
      };

      const token1: IToken = {
        address: token1Address as Address,
        symbol: token1Info.symbol,
        name: token1Info.name,
        decimals: token1Info.decimals,
      };

      // 创建 Amount 值对象
      const reserve0 = new Amount(reserve0Amount, token0Info.decimals);
      const reserve1 = new Amount(reserve1Amount, token1Info.decimals);
      const totalSupplyAmountObj = new Amount(totalSupplyAmount, 18);

      // 创建充血的 Pool 实体
      const pool = new Pool(
        pairAddresses[i] as Address,
        token0,
        token1,
        reserve0,
        reserve1,
        totalSupplyAmountObj,
      );

      processedPools.push(pool);
    }
  }

  return processedPools;
}

/**
 * 验证交易对地址数据
 */
export function extractValidPairAddresses(pairAddresses: ContractResult[]): `0x${string}`[] {
  if (!pairAddresses) return [];

  return pairAddresses
    .filter(result => result.status === 'success' && result.result)
    .map(result => result.result as unknown as string as `0x${string}`);
}

/**
 * 主查询函数：获取所有流动性池
 *
 * 这是一个纯函数，不依赖 React Hooks
 * 可以在任何环境中调用（React 组件、Node.js 脚本等）
 *
 * @returns Pool[] - 充血的 Pool 实体数组，包含所有业务逻辑
 */
export async function getLiquidityPools(): Promise<Pool[]> {
  const config = getConfig();
  const factoryAddress = CONTRACT_ADDRESSES.UniswapV2Factory as `0x${string}`;

  try {
    // 1. 获取所有交易对数量
    const allPairsLength = await readContract(config, {
      address: factoryAddress,
      abi: uniswapV2FactoryAbi,
      functionName: 'allPairsLength',
    });

    const pairCount = Number(allPairsLength);
    if (pairCount === 0) {
      return [];
    }

    // 2. 批量获取所有交易对地址
    const pairIndices = Array.from({ length: pairCount }, (_, i) => i);
    const pairAddressResults = await readContracts(config, {
      contracts: pairIndices.map(index => ({
        address: factoryAddress,
        abi: uniswapV2FactoryAbi,
        functionName: 'allPairs',
        args: [BigInt(index)],
      })),
    });

    // 3. 提取有效的交易对地址
    const validPairAddresses = extractValidPairAddresses(pairAddressResults);
    if (validPairAddresses.length === 0) {
      return [];
    }

    // 4. 批量获取每个交易对的详细信息
    const pairDetailResults = await readContracts(config, {
      contracts: validPairAddresses.flatMap(pairAddress => [
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'token0',
        },
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'token1',
        },
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'getReserves',
        },
        {
          address: pairAddress,
          abi: uniswapV2PairAbi,
          functionName: 'totalSupply',
        },
      ]),
    });

    // 5. 处理数据并返回
    return await processLiquidityPools(validPairAddresses, pairDetailResults);
  } catch (error) {
    console.error('Error fetching liquidity pools:', error);
    throw error;
  }
}
