/**
 * 类型定义：统一导出
 * Type Definitions: Unified Exports
 *
 * 纯数据类型，用于数据传输和接口定义
 * 不包含业务逻辑
 */

// ============================================================================
// Token 相关类型
// ============================================================================

/**
 * 原始代币数据（来自 API）
 */
export interface ITokenRaw {
  /** 代币合约地址 */
  address: string;

  /** 代币符号（如 BTC, ETH） */
  symbol: string;

  /** 代币名称（如 Wrapped Bitcoin） */
  name: string;

  /** 代币小数位数 */
  decimals: number;

  /** 代币图标 URL（注意：领域层使用 logo 字段）- 可选 */
  icon?: string;

  /** 当前价格（USD，格式化后的字符串）- 可选 */
  price?: string;

  /** 24h 涨跌幅（格式化后的字符串，如 "+3.8%"）- 可选 */
  change?: string;

  /** 24h 交易量（格式化后的字符串，如 "$3.2B"）- 可选 */
  volume?: string;

  /** 流动性（格式化后的字符串，如 "$2.1B"）- 可选 */
  liquidity?: string;

  /** 是否上涨 - 可选 */
  positive?: boolean;
}

// ============================================================================
// 重新导出其他类型模块
// ============================================================================

export type {
  AddLiquidityParams,
  LiquidityQuote,
  AddLiquidityResult,
  GetLiquidityQuoteParams,
  RemoveLiquidityParams,
  RemoveLiquidityQuote,
  RemoveLiquidityResult,
  LPTokenInfo,
} from './liquidity';

export type { Token, Reserve, TokenWithReserve, LiquidityMetrics, LiquidityPool } from './pool';
