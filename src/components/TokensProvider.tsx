'use client';

/**
 * TokensProvider
 *
 * 在应用最外层预加载 tokens 数据
 * 避免每个组件重复调用 fetchTokens
 *
 * 符合 DDD 原则：
 * - 调用 Application 层的 Query 获取数据
 * - 使用 Store 管理状态
 */

import React, { useEffect } from 'react';
import { useTokensStore } from '@/stores/useTokensStore';
import { getTokens } from '@/application/queries/getTokens';

export function TokensProvider({ children }: { children: React.ReactNode }) {
  const { setTokens, setLoading, setError } = useTokensStore();

  // 应用启动时预加载 tokens 数据
  useEffect(() => {
    const fetchTokens = async () => {
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
    };

    fetchTokens();
  }, [setTokens, setLoading, setError]); // 依赖 store 的 actions

  return <>{children}</>;
}
