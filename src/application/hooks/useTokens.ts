/**
 * 应用层 Hook：useTokens
 * Application Layer Hook: useTokens
 *
 * 职责：
 * - 从全局 store 读取代币列表
 * - 提供手动刷新功能
 *
 * 注意：
 * - tokens 数据在 TokensProvider 中预加载
 * - 不需要在每个组件中调用 fetchTokens
 * - 如需手动刷新，使用 refetch()
 */

'use client';

import { useCallback } from 'react';
import { useTokensStore } from '@/stores/useTokensStore';
import { getTokens } from '@/application/queries/getTokens';
import { Token } from '@/domain/entities/Token';

/**
 * useTokens Hook 返回值
 */
export interface UseTokensResult {
  tokens: Token[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * useTokens Hook
 *
 * 获取代币列表（从全局 store）
 *
 * @returns UseTokensResult
 */
export function useTokens(): UseTokensResult {
  const { tokens, isLoading, error, setTokens, setLoading, setError } = useTokensStore();

  // 手动刷新数据
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTokens();
      setTokens(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
    } finally {
      setLoading(false);
    }
  }, [setTokens, setLoading, setError]);

  return {
    tokens,
    isLoading,
    error,
    refetch,
  };
}
