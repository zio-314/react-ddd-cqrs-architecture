/**
 * 应用层查询：获取代币列表
 * Application Layer Query: Get Tokens
 *
 * 职责：
 * - 调用 Infrastructure 层的 API 函数获取数据
 * - 转换为领域模型（Token 类）
 *
 * 不应该：
 * - 直接调用 fetch（应在 Infrastructure 层）
 * - 包含业务逻辑（应在 Domain 层）
 */

import { Token } from '@/domain/entities/Token';
import { fetchTokens } from '@/infrastructure/repositories/api';

/**
 * 获取代币列表（带统计信息）
 *
 * @returns Promise<Token[]> 代币列表（Token 类实例）
 *
 * @example
 * const tokens = await getTokens();
 */
export async function getTokens(): Promise<Token[]> {
  try {
    // 1. 从 Infrastructure 层获取原始数据
    const rawData = await fetchTokens();

    // 2. ⭐ 使用 fromRaw 工厂方法创建 Token 实例（充血模型）
    return rawData.map(raw => Token.fromRaw(raw));
  } catch (error) {
    console.error('Error fetching tokens:', error);
    // 返回空数组而不是抛出错误，让应用继续运行
    return [];
  }
}
