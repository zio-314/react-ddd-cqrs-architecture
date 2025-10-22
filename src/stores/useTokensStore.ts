/**
 * Zustand Store: useTokensStore
 *
 * 全局管理 tokens 数据
 *
 * 职责：
 * - 管理 tokens 状态
 * - 提供状态更新方法
 *
 * 不负责：
 * - 数据获取（由 Application 层的 Query 负责）
 *
 * 符合 DDD 原则：
 * - Store 层只管理状态
 * - 业务逻辑在 Application 层
 */

import { Token } from '@/domain/entities/Token';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * useTokensStore
 *
 * 使用 combine 中间件实现类型安全的状态管理
 *
 * ⭐ 存储 Token 类实例（充血模型）
 */
export const useTokensStore = create(
  combine(
    // 初始状态
    {
      tokens: [] as Token[],
      isLoading: false,
      error: null as Error | null,
    },
    // Actions
    set => ({
      /**
       * 设置 tokens 数据
       */
      setTokens: (tokens: Token[]) => set({ tokens }),

      /**
       * 设置 loading 状态
       */
      setLoading: (isLoading: boolean) => set({ isLoading }),

      /**
       * 设置 error 状态
       */
      setError: (error: Error | null) => set({ error }),

      /**
       * 清空 tokens 数据
       */
      clearTokens: () => set({ tokens: [] }),

      /**
       * 重置所有状态
       */
      reset: () =>
        set({
          tokens: [],
          isLoading: false,
          error: null,
        }),
    }),
  ),
);
