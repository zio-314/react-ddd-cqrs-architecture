/**
 * 基础设施层：Token Blockchain Repository
 * Infrastructure Layer: Token Blockchain Repository
 *
 * 职责：
 * - 封装所有与 Token 相关的区块链查询
 * - 使用 wagmi 的 readContract 访问链上数据
 * - 返回原始数据或领域对象
 *
 * 设计原则：
 * - ✅ 使用独立函数而非 class（支持 Tree Shaking）
 * - ✅ 每个函数只负责一个区块链调用
 * - ✅ 函数命名：fetch + 资源名（如 fetchTokenBalance, fetchTokenInfo）
 * - ✅ 与 api.ts 保持一致的风格
 *
 * @example
 * // 获取代币余额
 * const balance = await fetchTokenBalance(config, tokenAddress, userAddress);
 *
 * // 获取代币信息
 * const tokenInfo = await fetchTokenInfo(config, tokenAddress);
 */

import { type Config } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { erc20Abi } from '@/infrastructure/blockchain';
import { IToken } from '@/domain/entities/Token';
import { Amount } from '@/domain/value-objects/Amount';

// ============================================================================
// Token Balance Functions
// ============================================================================

/**
 * 获取代币余额
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @param userAddress - 用户地址
 * @returns Amount 值对象
 *
 * @example
 * const balance = await fetchTokenBalance(config, '0x...', '0x...');
 * console.log(balance.toString()); // "100.5"
 */
export async function fetchTokenBalance(
  config: Config,
  tokenAddress: string,
  userAddress: string,
): Promise<Amount> {
  try {
    // 1. 获取小数位数
    const decimals = await fetchTokenDecimals(config, tokenAddress);

    // 2. 获取余额（Wei）
    const balanceWei = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    });

    // 3. 转换为 Amount
    return Amount.fromWei(balanceWei, decimals);
  } catch (error) {
    console.error('Failed to get token balance:', error);
    throw error;
  }
}

/**
 * 获取代币授权额度
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @param ownerAddress - 所有者地址
 * @param spenderAddress - 授权使用者地址
 * @returns Amount 值对象
 *
 * @example
 * const allowance = await fetchTokenAllowance(config, tokenAddress, owner, spender);
 */
export async function fetchTokenAllowance(
  config: Config,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
): Promise<Amount> {
  try {
    // 1. 获取小数位数
    const decimals = await fetchTokenDecimals(config, tokenAddress);

    // 2. 获取授权额度（Wei）
    const allowanceWei = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    });

    // 3. 转换为 Amount
    return Amount.fromWei(allowanceWei, decimals);
  } catch (error) {
    console.error('Failed to get token allowance:', error);
    throw error;
  }
}

/**
 * 获取代币总供应量
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @returns Amount 值对象
 *
 * @example
 * const totalSupply = await fetchTokenTotalSupply(config, '0x...');
 */
export async function fetchTokenTotalSupply(config: Config, tokenAddress: string): Promise<Amount> {
  try {
    // 1. 获取小数位数
    const decimals = await fetchTokenDecimals(config, tokenAddress);

    // 2. 获取总供应量（Wei）
    const totalSupplyWei = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'totalSupply',
    });

    // 3. 转换为 Amount
    return Amount.fromWei(totalSupplyWei, decimals);
  } catch (error) {
    console.error('Failed to get token total supply:', error);
    throw error;
  }
}

// ============================================================================
// Token Info Functions
// ============================================================================

/**
 * 获取代币完整信息
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @returns IToken 接口
 *
 * @example
 * const tokenInfo = await fetchTokenInfo(config, '0x...');
 * console.log(tokenInfo.symbol, tokenInfo.name, tokenInfo.decimals);
 */
export async function fetchTokenInfo(config: Config, tokenAddress: string): Promise<IToken> {
  try {
    // 并行获取代币信息
    const [symbol, name, decimals] = await Promise.all([
      fetchTokenSymbol(config, tokenAddress),
      fetchTokenName(config, tokenAddress),
      fetchTokenDecimals(config, tokenAddress),
    ]);

    return {
      address: tokenAddress as `0x${string}`,
      symbol,
      name,
      decimals,
    };
  } catch (error) {
    console.error('Failed to get token info:', error);
    throw error;
  }
}

/**
 * 获取代币符号
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @returns 代币符号（如 "USDC", "ETH"）
 *
 * @example
 * const symbol = await fetchTokenSymbol(config, '0x...');
 */
export async function fetchTokenSymbol(config: Config, tokenAddress: string): Promise<string> {
  try {
    const symbol = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'symbol',
    });

    return symbol;
  } catch (error) {
    console.error('Failed to get token symbol:', error);
    throw error;
  }
}

/**
 * 获取代币名称
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @returns 代币名称（如 "USD Coin", "Ethereum"）
 *
 * @example
 * const name = await fetchTokenName(config, '0x...');
 */
export async function fetchTokenName(config: Config, tokenAddress: string): Promise<string> {
  try {
    const name = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'name',
    });

    return name;
  } catch (error) {
    console.error('Failed to get token name:', error);
    throw error;
  }
}

/**
 * 获取代币小数位数
 *
 * @param config - wagmi Config
 * @param tokenAddress - 代币合约地址
 * @returns 小数位数（如 18, 6）
 *
 * @example
 * const decimals = await fetchTokenDecimals(config, '0x...');
 */
export async function fetchTokenDecimals(config: Config, tokenAddress: string): Promise<number> {
  try {
    const decimals = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    return decimals;
  } catch (error) {
    console.error('Failed to get token decimals:', error);
    throw error;
  }
}
