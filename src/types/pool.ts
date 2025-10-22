/**
 * 类型定义：Pool（流动性池）
 * Type Definitions: Pool
 *
 * 纯数据类型，用于数据传输和接口定义
 * 不包含业务逻辑
 */

/**
 * 代币信息
 */
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * 储备量信息
 */
export interface Reserve {
  amount: string;
  amountFormatted: string;
}

/**
 * 代币及其储备量
 */
export interface TokenWithReserve {
  token: Token;
  reserve: Reserve;
}

/**
 * 流动性指标
 */
export interface LiquidityMetrics {
  totalSupply: string;
  totalSupplyFormatted: string;
  tvl?: string;
  apy?: string;
}

/**
 * 流动性池
 *
 * 遵循 Uniswap 协议约定：
 * - token0: 地址较小的代币（按字典序）
 * - token1: 地址较大的代币（按字典序）
 */
export interface LiquidityPool {
  address: string;
  token0: TokenWithReserve;
  token1: TokenWithReserve;
  metrics: LiquidityMetrics;
}
