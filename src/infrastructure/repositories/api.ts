/**
 * 基础设施层：API Repository
 * Infrastructure Layer: API Repository
 *
 * 职责：
 * - 封装所有 HTTP API 请求
 * - 处理网络错误和重试逻辑
 * - 返回原始数据（不做业务转换）
 * - 数据规范化（提供默认值）
 *
 * 设计原则：
 * - ✅ 使用独立函数而非 class/object（支持 Tree Shaking）
 * - ✅ 每个函数只负责一个 API 端点
 * - ✅ 函数命名：fetch + 资源名（如 fetchTokens, fetchPools）
 * - ✅ 返回规范化的数据类型
 *
 * 注意：
 * - 这一层只负责数据获取，不做业务逻辑
 * - 数据转换应该在 Application 层的 Mapper 中进行
 *
 * @example
 * // 添加新的 API 函数
 * export async function fetchPools(): Promise<RawPoolData[]> {
 *   const rawData = await apiRequest<ApiPoolResponse[]>("/pools");
 *   return rawData.map(normalizePoolData);
 * }
 */

/**
 * API 基础配置
 */
const API_CONFIG = {
  baseURL: '/api',
  timeout: 10_000, // 10 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * 通用 API 请求函数
 *
 * @param endpoint - API 端点（相对路径）
 * @param options - fetch 选项
 * @returns Promise<T> 响应数据
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================================
// Token API Functions
// ============================================================================

/**
 * 获取代币列表
 *
 * @returns Promise<RawTokenData[]> 原始代币数据（已规范化）
 *
 * @example
 * const tokens = await fetchTokens();
 */
export async function fetchTokens(): Promise<RawTokenData[]> {
  const rawData = await apiRequest<ApiTokenResponse[]>('/tokens', {
    method: 'GET',
    // Next.js 缓存策略
    next: {
      revalidate: 60, // 60秒后重新验证
    },
  });

  // 规范化数据：确保所有字段都存在
  return rawData.map(normalizeTokenData);
}

/**
 * API 返回的原始 Token 数据（可能有缺失字段）
 */
interface ApiTokenResponse {
  symbol: string;
  name: string;
  icon?: string;
  price?: string;
  change?: string;
  volume?: string;
  liquidity?: string;
  positive?: boolean;
  decimals: number;
  address: string;
}

/**
 * 规范化后的 Token 数据（所有字段都存在）
 *
 * 注意：这是 Infrastructure 层返回给 Application 层的数据格式
 */
export interface RawTokenData {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  change: string;
  volume: string;
  liquidity: string;
  positive: boolean;
  decimals: number;
  address: string;
}

/**
 * 规范化 Token 数据
 *
 * 将 API 返回的可选字段转换为必需字段，提供默认值
 */
function normalizeTokenData(data: ApiTokenResponse): RawTokenData {
  return {
    symbol: data.symbol,
    name: data.name,
    decimals: data.decimals,
    address: data.address,
    // 提供默认值
    icon: data.icon ?? '',
    price: data.price ?? '$0.00',
    change: data.change ?? '0%',
    volume: data.volume ?? '$0',
    liquidity: data.liquidity ?? '$0',
    positive: data.positive ?? false,
  };
}
